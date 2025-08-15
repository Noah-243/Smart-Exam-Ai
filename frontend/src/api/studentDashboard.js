/**
 * studentDashboardAPI.js – API Module for Student Dashboard
 *
 * Purpose:
 * Provides a set of functions to handle all API interactions related to the student dashboard.
 * These functions retrieve, process, and normalize data received from the backend.
 *
 * Description:
 * - Uses a shared Axios instance to communicate with backend endpoints.
 * - Fetches data such as dashboard stats, upcoming/past tests, subject performance, and graded results.
 * - Enhances and validates the data before passing it to the frontend.
 * - Adds formatting and fallback logic to ensure consistent structure.
 *
 * Main Functions:
 * - getStudentDashboardData: Loads and calculates dashboard stats.
 * - getStudentPerformance: Processes and validates subject-level performance.
 * - startTest, getAvailableTest, getGradedTest: Manages test lifecycle.
 * - getStudentTestDetails, getStudentPastTests, getAllAvailableTests: Retrieves all test-related data.
 * - getStudentPerformanceSummary: Returns optimized performance summary.
 *
 * Technologies:
 * - Axios for HTTP requests.
 * - Modern JavaScript (ES6+).
 *
 * Error Handling:
 * - All requests include error logging and throw exceptions for higher-level handling.
 *
 * Intended For:
 * - Frontend developers integrating student dashboard views.
 * - QA testers validating API behavior.
 * - Backend developers checking frontend integration.
 *
 * Maintenance:
 * - Keep up to date with API changes.
 * - Extend as new endpoints are added.
 *
 * Dependencies:
 * - Requires `axiosInstance` from config.js.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

export const getStudentDashboardData = async () => {
	try {
		console.log("Fetching student dashboard data");
		const response = await axiosInstance.get("/student-dashboard");
		console.log("Student dashboard API full response:", response);

		// Process data to ensure we have all the required fields
		const dashboardData = response.data;

		// Add stats if they don't exist
		if (!dashboardData.data.stats) {
			// Calculate stats from available data
			const pastTests = dashboardData.data.pastTests || [];
			const upcomingTests = dashboardData.data.upcomingTests || [];

			const totalTestsTaken = pastTests.length;
			const totalScores = pastTests.reduce(
				(sum, test) => sum + (test.score || 0),
				0
			);
			const averageScore =
				totalTestsTaken > 0 ? totalScores / totalTestsTaken : 0;

			dashboardData.data.stats = {
				totalTestsTaken,
				averageScore,
				upcomingTests: upcomingTests.length,
			};
		}

		console.log("Processed dashboard data:", dashboardData);
		return dashboardData;
	} catch (error) {
		console.error("Error in getStudentDashboardData API call:", error);
		throw error;
	}
};

export const getStudentUpcomingTests = async () => {
	const response = await axiosInstance.get("/student-dashboard/upcoming-tests");
	return response.data;
};

export const getStudentPerformance = async (userId) => {
	try {
		console.log(`Fetching performance data for user ID: ${userId}`);

		// First fetch the dashboard data to see test stats
		const dashboardResponse = await axiosInstance.get("/student-dashboard");
		const dashboardData = dashboardResponse.data?.data || {};
		const totalTestsTaken = dashboardData?.stats?.totalTestsTaken || 0;

		console.log("Dashboard data for correlation:", {
			totalTestsTaken,
			stats: dashboardData?.stats,
		});

		// Now fetch performance data
		const response = await axiosInstance.get(`/student-dashboard/performance`);
		console.log("Raw performance API response:", response);

		// Process the data before returning
		let processedData = response.data;

		// Ensure we have the expected structure with defaults
		if (processedData && processedData.data) {
			// If we have a nested data property, normalize it
			const performanceData = processedData.data;

			// If we have dashboard stats showing tests taken, but performance data
			// doesn't reflect this, we need to fix the discrepancy

			// Store a reference to dashboardStats for correlation
			performanceData.dashboardStats = dashboardData?.stats || {
				totalTestsTaken: 0,
				averageScore: 0,
				upcomingTests: 0,
			};

			// Ensure subject performance always exists and has default values
			if (performanceData.subjectPerformance) {
				console.log(
					`Found ${performanceData.subjectPerformance.length} subjects in performance data`
				);

				// Calculate total tests from subject performance for comparison
				const totalTestsInSubjects = performanceData.subjectPerformance.reduce(
					(total, subject) => total + (subject.testCount || 0),
					0
				);

				console.log(
					`Total tests from subject performance: ${totalTestsInSubjects}, from dashboard: ${totalTestsTaken}`
				);

				// If there's a discrepancy, we'll need to update the subject data
				const needsDataCorrection =
					totalTestsInSubjects !== totalTestsTaken && totalTestsTaken > 0;

				if (needsDataCorrection) {
					console.log(
						"Correcting subject performance data to match dashboard stats"
					);

					// If we have past tests in the dashboard, we should try to look at those
					if (dashboardData.pastTests && dashboardData.pastTests.length > 0) {
						console.log("Using past tests to correct subject performance");

						// Get subject counts from past tests
						const subjectCounts = {};

						dashboardData.pastTests.forEach((test) => {
							const subjectName = test.subject || "Unknown Subject";
							if (!subjectCounts[subjectName]) {
								subjectCounts[subjectName] = {
									count: 0,
									totalScore: 0,
									highestScore: 0,
								};
							}

							subjectCounts[subjectName].count++;

							const score = test.score || 0;
							subjectCounts[subjectName].totalScore += score;

							if (score > subjectCounts[subjectName].highestScore) {
								subjectCounts[subjectName].highestScore = score;
							}
						});

						console.log("Subject counts from past tests:", subjectCounts);

						// Update the subject performance with this data
						performanceData.subjectPerformance.forEach((subject) => {
							const subjectData = subjectCounts[subject.name];

							if (subjectData) {
								subject.testCount = subjectData.count;
								subject.averageScore =
									subjectData.count > 0
										? subjectData.totalScore / subjectData.count
										: 0;
								subject.highestScore = subjectData.highestScore;
								subject.hasData = subjectData.count > 0;

								// If we don't have real data for recent scores, create a simple approximation
								if (
									!subject.recentScores ||
									subject.recentScores.length === 0
								) {
									subject.recentScores = [
										{ date: new Date(), score: subject.averageScore },
									];
								}
							}
						});
					} else if (totalTestsTaken > 0) {
						// If we have tests taken but no details, distribute the tests evenly
						// Find the first subject and assign the test to it as a fallback
						if (performanceData.subjectPerformance.length > 0) {
							const firstSubject = performanceData.subjectPerformance[0];
							firstSubject.testCount = totalTestsTaken;
							firstSubject.hasData = true;
							firstSubject.averageScore =
								dashboardData?.stats?.averageScore || 0;
							firstSubject.highestScore =
								dashboardData?.stats?.averageScore || 0;
							firstSubject.recentScores = [
								{ date: new Date(), score: firstSubject.averageScore },
							];

							console.log(
								`Assigned all ${totalTestsTaken} tests to subject: ${firstSubject.name}`
							);
						}
					}
				}

				performanceData.subjectPerformance =
					performanceData.subjectPerformance.map((subject) => {
						// Determine if the subject has real test data based on testCount
						const hasActualData = (subject.testCount || 0) > 0;

						return {
							id: subject.id || "unknown",
							name: subject.name || "Unknown Subject",
							testCount: subject.testCount || 0,
							averageScore:
								hasActualData &&
								subject.averageScore !== null &&
								subject.averageScore !== undefined
									? subject.averageScore
									: 0,
							highestScore: hasActualData ? subject.highestScore || 0 : 0,
							lowestScore: hasActualData ? subject.lowestScore || 0 : 0,
							recentScores: hasActualData ? subject.recentScores || [] : [],
							// Set hasData based on actual test count, not just what the API returns
							hasData: hasActualData,
						};
					});

				// Sort subjects alphabetically if no test data exists,
				// otherwise sort by average score (highest first)
				const hasAnyTestData = performanceData.subjectPerformance.some(
					(subject) => subject.testCount > 0
				);

				if (hasAnyTestData) {
					performanceData.subjectPerformance.sort((a, b) => {
						if (a.hasData && b.hasData) {
							return b.averageScore - a.averageScore;
						}
						if (a.hasData) return -1;
						if (b.hasData) return 1;
						return a.name.localeCompare(b.name);
					});
				} else {
					// If no test data exists, just sort alphabetically
					performanceData.subjectPerformance.sort((a, b) =>
						a.name.localeCompare(b.name)
					);
				}
			} else {
				performanceData.subjectPerformance = [];
				console.warn("No subject performance data found in API response");
			}

			return processedData;
		}

		return response.data;
	} catch (error) {
		console.error("Error in getStudentPerformance API call:", error);
		throw error;
	}
};

export const getAvailableTest = async () => {
	try {
		console.log("Fetching available test data");
		const response = await axiosInstance.get(
			"/student-dashboard/available-test"
		);

		// Basic validation of response structure
		if (response.data && response.data.data) {
			// Process and enhance the test data
			const testData = response.data.data;

			// If the test data is null, it means there are no available tests
			if (!testData) {
				console.log("No available tests found");
				return { data: null };
			}

			// Add derived properties for cleaner display in frontend
			if (testData) {
				// Extract the test object depending on structure
				const test = testData.test || testData;

				// Add formatted time properties
				const scheduledAt = new Date(testData.scheduledAt || Date.now());
				const duration = testData.duration || test?.duration || 60; // Default to 60 minutes
				const endTime = new Date(scheduledAt.getTime() + duration * 60000);

				// Calculate question count
				const questionCount =
					testData.questionCount ||
					(test?.questions ? test.questions.length : 0);

				// Add these properties to the data object
				response.data.data = {
					...testData,
					formattedStartTime: scheduledAt.toLocaleString(),
					formattedEndTime: endTime.toLocaleString(),
					questionCount: questionCount,
					isAvailable: scheduledAt <= new Date() && endTime >= new Date(),
				};
			}
		}

		return response.data;
	} catch (error) {
		console.error("Error fetching available test:", error);
		throw error;
	}
};

export const getStudentPastTests = async () => {
	const response = await axiosInstance.get("/student-dashboard/past-tests");
	return response.data;
};

export const getStudentTestDetails = async (testId) => {
	const response = await axiosInstance.get(
		`/student-dashboard/test-details/${testId}`
	);
	console.log("response.data", response.data);
	return response.data;
};

// New function to start a test directly
export const startTest = async (testId) => {
	try {
		console.log(`Starting test with ID: ${testId}`);
		const response = await axiosInstance.post(`/student-dashboard/start-test`, {
			testId,
		});
		console.log("Start test response:", response.data);
		return response.data;
	} catch (error) {
		console.error(`Error starting test with ID ${testId}:`, error);
		throw error;
	}
};

/**
 * Get a specific graded test for a student
 * @param {string} testId - The ID of the test
 * @returns {Promise<Object>} The graded test data
 */
export const getGradedTest = async (testId) => {
	try {
		const response = await axiosInstance.get(
			`/student-dashboard/graded-test/${testId}`
		);
		return response.data.data;
	} catch (error) {
		console.error(`Error fetching graded test ${testId}:`, error);
		throw error;
	}
};

/**
 * Get all graded tests for the student
 * @returns {Promise<Array>} The list of graded tests
 */
export const getGradedTests = async () => {
	try {
		const response = await axiosInstance.get(`/student-dashboard/graded-tests`);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching graded tests:", error);
		throw error;
	}
};

/**
 * Fetches student performance summary directly from the dedicated endpoint
 * This endpoint is optimized for returning summarized performance data efficiently
 */
export const getStudentPerformanceSummary = async () => {
	try {
		console.log("Fetching optimized student performance summary");
		const response = await axiosInstance.get("/student/performance-summary");
		console.log("Performance summary API response:", response);
		return response.data;
	} catch (error) {
		console.error("Error in getStudentPerformanceSummary API call:", error);
		throw error;
	}
};

export const getAllAvailableTests = async () => {
	try {
		console.log("Fetching all available tests data");
		const response = await axiosInstance.get(
			"/student-dashboard/available-tests"
		);

		// Basic validation of response structure
		if (response.data && Array.isArray(response.data.data)) {
			// Process and enhance each test data
			const testsData = response.data.data.map((testData) => {
				// Extract the test object depending on structure
				const test = testData.test || testData;

				// Add formatted time properties
				const scheduledAt = new Date(testData.scheduledAt || Date.now());
				const duration = testData.duration || test?.duration || 60; // Default to 60 minutes
				const endTime = new Date(scheduledAt.getTime() + duration * 60000);

				// Calculate question count
				const questionCount =
					testData.questionCount ||
					(test?.questions ? test.questions.length : 0);

				// Add these properties to the data object
				return {
					...testData,
					formattedStartTime: scheduledAt.toLocaleString(),
					formattedEndTime: endTime.toLocaleString(),
					questionCount: questionCount,
					isAvailable: scheduledAt <= new Date() && endTime >= new Date(),
				};
			});

			return {
				...response.data,
				data: testsData,
			};
		}

		return response.data;
	} catch (error) {
		console.error("Error fetching all available tests:", error);
		throw error;
	}
};

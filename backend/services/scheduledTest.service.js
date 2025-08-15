/**
 * 📅 Scheduled Test Service Module
 *
 * Comprehensive scheduled test management service providing test scheduling operations:
 * - Test scheduling and lifecycle management
 * - Student test availability and access control
 * - Time-based test filtering and queries
 * - Test results aggregation and analytics
 * - Status management and updates
 * - Grade-based test distribution
 *
 * Features:
 * - Time-aware test availability checking
 * - Comprehensive test data population
 * - Teacher and grade-based filtering
 * - Test results aggregation with analytics
 * - Status-based test management
 * - Upcoming and past test categorization
 * - Comprehensive error handling and logging
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const ScheduledTest = require("../models/ScheduledTest");
const StudentTest = require("../models/StudentTest");
const ErrorResponse = require("../utils/errorResponse");

/**
 * 📅 ScheduledTestService Class
 *
 * Handles all scheduled test-related business logic including test scheduling,
 * availability management, and results analytics.
 */
class ScheduledTestService {
	/**
	 * 🆕 Create Scheduled Test
	 *
	 * Creates a new scheduled test with validation and logging.
	 *
	 * @param {Object} testData - Scheduled test creation data
	 * @param {string} testData.test - Test ObjectId
	 * @param {string} testData.grade - Grade ObjectId
	 * @param {string} testData.teacher - Teacher ObjectId
	 * @param {Date} testData.scheduledAt - When test should start
	 * @param {number} testData.duration - Test duration in minutes
	 * @param {string} testData.status - Test status ('scheduled', 'active', 'completed')
	 * @returns {Promise<Object>} Created scheduled test object
	 *
	 * @example
	 * const scheduledTest = await scheduledTestService.createScheduledTest({
	 *   test: testId,
	 *   grade: gradeId,
	 *   teacher: teacherId,
	 *   scheduledAt: new Date(),
	 *   duration: 60,
	 *   status: 'scheduled'
	 * });
	 */
	async createScheduledTest(testData) {
		console.log(`🆕 Creating scheduled test`);
		console.log(`📋 Test: ${testData.test}, Grade: ${testData.grade}`);
		console.log(`👨‍🏫 Teacher: ${testData.teacher}`);
		console.log(`⏰ Scheduled for: ${testData.scheduledAt}`);
		console.log(`⏱️ Duration: ${testData.duration} minutes`);
		console.log(`📊 Status: ${testData.status}`);

		try {
			const scheduledTest = await ScheduledTest.create(testData);

			console.log(`🎉 Scheduled test created successfully!`);
			console.log(`🆔 Scheduled Test ID: ${scheduledTest._id}`);

			return scheduledTest;
		} catch (error) {
			console.error(`💥 Error creating scheduled test:`, error.message);
			throw error;
		}
	}

	/**
	 * 🔍 Get Scheduled Test by ID
	 *
	 * Retrieves a scheduled test with comprehensive populated data including
	 * test details, questions, grade, and teacher information.
	 *
	 * @param {string} id - Scheduled test MongoDB ObjectId
	 * @returns {Promise<Object>} Scheduled test with populated relationships
	 * @throws {ErrorResponse} 400 for invalid ID, 404 if not found
	 *
	 * @example
	 * const scheduledTest = await scheduledTestService.getScheduledTestById(testId);
	 * console.log(`Test: ${scheduledTest.test.title}`);
	 */
	async getScheduledTestById(id) {
		console.log(`🔍 Looking for scheduled test with ID: ${id}`);

		// Check if id is valid
		if (!id) {
			console.log(`❌ Invalid test ID provided: ${id}`);
			throw new ErrorResponse(`Invalid test ID provided: ${id}`, 400);
		}

		try {
			const scheduledTest = await ScheduledTest.findById(id)
				.populate({
					path: "test",
					select: "title description questions duration",
					populate: {
						path: "questions.question",
						model: "Question",
						select: "body type options answers isMultiAnswer isTextAnswer",
					},
				})
				.populate("grade", "name level")
				.populate("teacher", "name");

			if (!scheduledTest) {
				console.log(`❌ No scheduled test found with ID: ${id}`);
				throw new ErrorResponse(
					`Scheduled test not found with id of ${id}`,
					404
				);
			}

			console.log(
				`✅ Found scheduled test: ${scheduledTest.test?.title || "Unknown"}`
			);
			console.log(
				`📚 Grade: ${scheduledTest.grade?.name || "Unknown"} (Level: ${
					scheduledTest.grade?.level || "N/A"
				})`
			);
			console.log(`👨‍🏫 Teacher: ${scheduledTest.teacher?.name || "Unknown"}`);
			console.log(`⏰ Scheduled: ${scheduledTest.scheduledAt}`);
			console.log(`⏱️ Duration: ${scheduledTest.duration} minutes`);
			console.log(`📊 Status: ${scheduledTest.status}`);

			return scheduledTest;
		} catch (error) {
			console.error(
				`💥 Error retrieving scheduled test with ID ${id}:`,
				error.message
			);

			// If it's a CastError (invalid ObjectId), provide a clearer message
			if (error.name === "CastError") {
				throw new ErrorResponse(`Invalid test ID format: ${id}`, 400);
			}

			throw error;
		}
	}

	/**
	 * 📅 Get Currently Available Test
	 *
	 * Finds a test that is currently available for a specific grade.
	 * Checks for tests that have started but not yet ended.
	 *
	 * @param {string} gradeId - Grade MongoDB ObjectId
	 * @param {Date} now - Current timestamp for availability check
	 * @returns {Promise<Object|null>} Available test or null if none found
	 *
	 * @example
	 * const availableTest = await scheduledTestService.getCurrentlyAvailableTest(gradeId, new Date());
	 * if (availableTest) {
	 *   console.log(`Available: ${availableTest.test.title}`);
	 * }
	 */
	async getCurrentlyAvailableTest(gradeId, now) {
		console.log(`📅 Checking for currently available test`);
		console.log(`🎓 Grade: ${gradeId}`);
		console.log(`⏰ Current time: ${now}`);

		try {
			// Find a test that:
			// 1. Is for this student's grade
			// 2. Has already started but not yet ended
			// 3. Has status "scheduled"
			const test = await ScheduledTest.findOne({
				grade: gradeId,
				status: "scheduled",
				// Test has started (scheduled time is in the past)
				scheduledAt: { $lte: now },
				// Test has not ended (scheduled time + duration > now)
				$expr: {
					$gt: [
						{
							$add: [
								"$scheduledAt",
								{ $multiply: ["$duration", 60000] }, // Convert duration from minutes to milliseconds
							],
						},
						now,
					],
				},
			})
				.populate({
					path: "test",
					select: "title subject questions duration",
					populate: {
						path: "subject",
						select: "name",
					},
				})
				.populate("grade", "name level")
				.populate("teacher", "name");

			if (test) {
				const endTime = new Date(
					test.scheduledAt.getTime() + test.duration * 60000
				);
				const remainingMinutes = Math.round((endTime - now) / (1000 * 60));

				console.log(
					`✅ Found available test: ${test.test?.title || "Unknown"}`
				);
				console.log(`📚 Subject: ${test.test?.subject?.name || "Unknown"}`);
				console.log(`⏰ Started: ${test.scheduledAt}`);
				console.log(`⏱️ Ends: ${endTime}`);
				console.log(`⌛ Remaining: ${remainingMinutes} minutes`);
			} else {
				console.log(`❌ No currently available test found for grade`);
			}

			return test;
		} catch (error) {
			console.error(`💥 Error checking for available test:`, error.message);
			throw error;
		}
	}

	/**
	 * 📋 Get Scheduled Tests with Query
	 *
	 * Retrieves scheduled tests based on query parameters with populated data
	 * and optional sorting and limiting.
	 *
	 * @param {Object} query - MongoDB query object
	 * @param {Object} options - Query options
	 * @param {Object} options.sort - Sort criteria (default: { scheduledAt: 1 })
	 * @param {number} options.limit - Maximum number of results
	 * @returns {Promise<Array>} Array of scheduled tests with populated data
	 *
	 * @example
	 * const tests = await scheduledTestService.getScheduledTests(
	 *   { status: 'scheduled' },
	 *   { sort: { scheduledAt: -1 }, limit: 10 }
	 * );
	 */
	async getScheduledTests(query = {}, options = {}) {
		console.log(
			`📋 Getting scheduled tests with query:`,
			JSON.stringify(query, null, 2)
		);
		console.log(`⚙️ Options:`, JSON.stringify(options, null, 2));

		try {
			const { sort = { scheduledAt: 1 }, limit } = options;

			let queryBuilder = ScheduledTest.find(query)
				.populate({
					path: "test",
					select: "title subject duration",
					populate: {
						path: "subject",
						select: "name",
					},
				})
				.populate("grade", "name level")
				.populate("teacher", "name")
				.sort(sort);

			if (limit) {
				queryBuilder = queryBuilder.limit(limit);
				console.log(`🔢 Applying limit: ${limit}`);
			}

			const tests = await queryBuilder;

			console.log(`✅ Retrieved ${tests.length} scheduled tests`);

			// Log status distribution
			const statusStats = tests.reduce((acc, test) => {
				acc[test.status] = (acc[test.status] || 0) + 1;
				return acc;
			}, {});

			console.log(`📊 Status distribution:`, statusStats);

			return tests;
		} catch (error) {
			console.error(`💥 Error getting scheduled tests:`, error.message);
			throw error;
		}
	}

	/**
	 * 🎓 Get Tests by Grade
	 *
	 * Retrieves scheduled tests for a specific grade with optional filtering
	 * by status and timeframe.
	 *
	 * @param {string} gradeId - Grade MongoDB ObjectId
	 * @param {Object} options - Filtering options
	 * @param {string} options.status - Test status filter
	 * @param {string} options.timeframe - Time filter ('upcoming', 'past')
	 * @returns {Promise<Array>} Array of scheduled tests for the grade
	 *
	 * @example
	 * const upcomingTests = await scheduledTestService.getTestsByGrade(gradeId, {
	 *   status: 'scheduled',
	 *   timeframe: 'upcoming'
	 * });
	 */
	async getTestsByGrade(gradeId, options = {}) {
		console.log(`🎓 Getting tests by grade: ${gradeId}`);
		console.log(`⚙️ Filter options:`, JSON.stringify(options, null, 2));

		try {
			const { status, timeframe } = options;
			const query = { grade: gradeId };
			const now = new Date();

			if (status) {
				query.status = status;
				console.log(`📊 Filtering by status: ${status}`);
			}

			if (timeframe === "upcoming") {
				query.scheduledAt = { $gt: now };
				console.log(`⏰ Filtering for upcoming tests (after ${now})`);
			} else if (timeframe === "past") {
				query.scheduledAt = { $lt: now };
				console.log(`⏰ Filtering for past tests (before ${now})`);
			}

			const sortDirection = timeframe === "upcoming" ? 1 : -1;
			const tests = await this.getScheduledTests(query, {
				sort: { scheduledAt: sortDirection },
			});

			console.log(`✅ Found ${tests.length} tests for grade with filters`);

			return tests;
		} catch (error) {
			console.error(
				`💥 Error getting tests by grade ${gradeId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 👨‍🏫 Get Tests by Teacher
	 *
	 * Retrieves all scheduled tests created by a specific teacher.
	 *
	 * @param {string} teacherId - Teacher user ObjectId
	 * @param {Object} options - Query options
	 * @returns {Promise<Array>} Array of tests created by the teacher
	 *
	 * @example
	 * const myTests = await scheduledTestService.getTestsByTeacher(teacherId);
	 */
	async getTestsByTeacher(teacherId, options = {}) {
		console.log(`👨‍🏫 Getting tests by teacher: ${teacherId}`);

		try {
			const query = { teacher: teacherId };
			const tests = await this.getScheduledTests(query, options);

			console.log(`✅ Found ${tests.length} tests created by teacher`);

			return tests;
		} catch (error) {
			console.error(
				`💥 Error getting tests by teacher ${teacherId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 📊 Get Test Results
	 *
	 * Retrieves comprehensive test results with analytics for completed tests.
	 * Includes student participation data and average scores.
	 *
	 * @param {Object} query - Optional query filter
	 * @returns {Promise<Array>} Array of test results with analytics
	 *
	 * @example
	 * const results = await scheduledTestService.getTestResults({ teacher: teacherId });
	 * results.forEach(result => {
	 *   console.log(`${result.test.title}: avg ${result.averageScore}%`);
	 * });
	 */
	async getTestResults(query = {}) {
		console.log(
			`📊 Getting test results with query:`,
			JSON.stringify(query, null, 2)
		);
		const startTime = Date.now();

		try {
			// Get all completed tests
			console.log(`🔍 Retrieving completed scheduled tests...`);
			const scheduledTests = await this.getScheduledTests({
				...query,
				status: "completed",
			});

			if (!scheduledTests.length) {
				console.log(`❌ No completed tests found`);
				return [];
			}

			console.log(
				`✅ Found ${scheduledTests.length} completed scheduled tests`
			);

			// Get test IDs
			const testIds = scheduledTests.map((test) => test._id);

			// Get corresponding student tests
			console.log(`👥 Retrieving student test submissions...`);
			const studentTests = await StudentTest.find({
				scheduledTest: { $in: testIds },
			}).populate("student", "name");

			console.log(`📝 Found ${studentTests.length} student submissions`);

			// Organize by scheduled test
			console.log(`🔄 Organizing results by test...`);
			const resultsByTest = testIds.map((testId) => {
				const scheduledTest = scheduledTests.find(
					(t) => t._id.toString() === testId.toString()
				);
				const testsForThisSchedule = studentTests.filter(
					(st) => st.scheduledTest.toString() === testId.toString()
				);

				const averageScore =
					testsForThisSchedule.length > 0
						? testsForThisSchedule.reduce((acc, curr) => acc + curr.score, 0) /
						  testsForThisSchedule.length
						: 0;

				console.log(
					`  📋 ${scheduledTest.test?.title || "Unknown"}: ${
						testsForThisSchedule.length
					} submissions, avg: ${averageScore.toFixed(2)}%`
				);

				return {
					_id: scheduledTest._id,
					test: scheduledTest.test,
					grade: scheduledTest.grade,
					scheduledAt: scheduledTest.scheduledAt,
					studentTests: testsForThisSchedule,
					averageScore,
				};
			});

			const processingTime = Date.now() - startTime;
			console.log(`⚡ Test results processed in ${processingTime}ms`);
			console.log(
				`📊 Total results: ${resultsByTest.length} tests with analytics`
			);

			return resultsByTest;
		} catch (error) {
			const processingTime = Date.now() - startTime;
			console.error(
				`💥 Error getting test results (${processingTime}ms):`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 🔄 Update Test Status
	 *
	 * Updates the status of a scheduled test with validation.
	 *
	 * @param {string} testId - Scheduled test MongoDB ObjectId
	 * @param {string} status - New status ('scheduled', 'active', 'completed', 'cancelled')
	 * @returns {Promise<Object>} Updated scheduled test object
	 * @throws {ErrorResponse} 404 if test not found
	 *
	 * @example
	 * await scheduledTestService.updateTestStatus(testId, 'completed');
	 */
	async updateTestStatus(testId, status) {
		console.log(`🔄 Updating test status: ${testId} -> ${status}`);

		try {
			const scheduledTest = await ScheduledTest.findByIdAndUpdate(
				testId,
				{ status },
				{ new: true, runValidators: true }
			);

			if (!scheduledTest) {
				console.log(`❌ Scheduled test not found: ${testId}`);
				throw new ErrorResponse(
					`Scheduled test not found with id of ${testId}`,
					404
				);
			}

			console.log(`✅ Test status updated successfully`);
			console.log(`📊 New status: ${scheduledTest.status}`);

			return scheduledTest;
		} catch (error) {
			console.error(`💥 Error updating test status ${testId}:`, error.message);
			throw error;
		}
	}

	async updateScheduledTest(id, testData) {
		// Find the scheduled test first to validate it
		const scheduledTest = await ScheduledTest.findById(id);

		if (!scheduledTest) {
			throw new ErrorResponse(`Scheduled test not found with id of ${id}`, 404);
		}

		// Prevent editing tests that are in the past or currently happening
		const now = new Date();
		const testStartTime = new Date(scheduledTest.scheduledAt);

		if (testStartTime <= now) {
			throw new ErrorResponse(
				`Cannot edit a test that has already started or finished`,
				400
			);
		}

		if (scheduledTest.status !== "scheduled") {
			throw new ErrorResponse(`Only scheduled tests can be edited`, 400);
		}

		// Update the test with the new data
		const updatedTest = await ScheduledTest.findByIdAndUpdate(id, testData, {
			new: true,
			runValidators: true,
		})
			.populate({
				path: "test",
				select: "title subject duration",
				populate: {
					path: "subject",
					select: "name",
				},
			})
			.populate("grade", "name level")
			.populate("teacher", "name");

		return updatedTest;
	}

	async deleteScheduledTest(id) {
		const scheduledTest = await ScheduledTest.findById(id);

		if (!scheduledTest) {
			throw new ErrorResponse(`Scheduled test not found with id of ${id}`, 404);
		}

		if (scheduledTest.status === "completed") {
			throw new ErrorResponse(`Cannot delete completed test`, 400);
		}

		await scheduledTest.deleteOne();
		return { success: true };
	}

	async getUpcomingTests(gradeId) {
		const now = new Date();
		return await ScheduledTest.find({
			grades: gradeId,
			scheduledAt: { $gt: now },
			status: "scheduled",
		})
			.populate("test", "title description")
			.populate("grades", "name level")
			.sort({ scheduledAt: 1 });
	}

	async getPastTests(gradeId) {
		const now = new Date();
		return await ScheduledTest.find({
			grades: gradeId,
			scheduledAt: { $lt: now },
		})
			.populate("test", "title description")
			.populate("grades", "name level")
			.sort({ scheduledAt: -1 });
	}

	async getUpcomingTestsByGrades(gradeIds) {
		const currentDate = new Date();

		const tests = await ScheduledTest.find({
			grade: { $in: gradeIds },
			scheduledAt: { $gt: currentDate },
		})
			.populate("test", "title subject")
			.populate("grade", "name level")
			.sort({ scheduledAt: 1 })
			.limit(10); // Limit to next 10 upcoming tests

		return tests;
	}

	async getRecentTestResults(gradeIds) {
		const currentDate = new Date();

		// Find completed scheduled tests for the specified grades
		const scheduledTests = await ScheduledTest.find({
			grade: { $in: gradeIds },
			scheduledAt: { $lt: currentDate },
			status: "completed",
		})
			.populate("test", "title subject")
			.populate("grade", "name level")
			.sort({ scheduledAt: -1 })
			.limit(10); // Last 10 completed tests

		if (!scheduledTests.length) {
			return [];
		}

		// Get test IDs
		const testIds = scheduledTests.map((test) => test._id);

		// Find corresponding student tests
		const studentTests = await StudentTest.find({
			scheduledTest: { $in: testIds },
		}).populate("student", "name");

		// Organize by scheduled test
		const results = scheduledTests.map((scheduledTest) => {
			const testsForThisSchedule = studentTests.filter(
				(st) => st.scheduledTest.toString() === scheduledTest._id.toString()
			);

			const averageScore =
				testsForThisSchedule.length > 0
					? testsForThisSchedule.reduce((acc, curr) => acc + curr.score, 0) /
					  testsForThisSchedule.length
					: 0;

			return {
				_id: scheduledTest._id,
				test: scheduledTest.test,
				grade: scheduledTest.grade,
				studentTests: testsForThisSchedule,
				averageScore,
			};
		});

		return results;
	}

	async getUpcomingTestsByGrade(gradeId) {
		const now = new Date();
		return await ScheduledTest.find({
			grade: gradeId,
			scheduledAt: { $gt: now },
			status: "scheduled",
		})
			.populate("test", "title description")
			.populate("grade", "name level")
			.sort({ scheduledAt: 1 });
	}

	async getPastTestsByStudent(studentId) {
		// Find student tests for this student
		const studentTests = await StudentTest.find({
			student: studentId,
			status: { $in: ["completed", "graded"] },
		})
			.populate({
				path: "scheduledTest",
				populate: [
					{ path: "test", select: "title subject" },
					{ path: "grade", select: "name level" },
				],
			})
			.sort({ submittedAt: -1 });

		return studentTests;
	}
}

module.exports = new ScheduledTestService();

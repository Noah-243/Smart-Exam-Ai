/**
 * teacherTestAPI.js – Teacher Test & Grading API Functions
 *
 * This module provides all API functions for teachers to manage tests, student submissions,
 * grading (manual and AI-assisted), and retrieving test-related data using a configured Axios instance.
 *
 * Main Features:
 * - Fetch teacher's student test data (single & multiple).
 * - Grade tests and individual answers (manual + Gemini AI suggestions).
 * - Retrieve test and grading info for UI rendering.
 *
 * Functions Overview:
 * ▸ getTeacherStudentTests() – Get all student-submitted tests.
 * ▸ getTeacherStudentTest(testId) – Get specific student test with mapped questions & answers.
 * ▸ gradeStudentTest(id, gradeData) – Submit manual grades for a full test.
 * ▸ getTeacherTests() / getTeacherTest(testId) – Fetch teacher-authored tests.
 * ▸ gradeStudentTestSubmission(testId, data) – Alternate grading endpoint for full test.
 * ▸ gradeStudentAnswer({ answerId, data, isQuestionId, testId }) – Grade a single answer (fallback to question ID if needed).
 * ▸ requestGeminiAnswerGrading({ answerId, questionPoints, testId }) – Get AI suggestions for a single answer.
 * ▸ requestGeminiTestGrading(testId) – Get AI grading suggestions for a full test.
 * ▸ getTeacherGrades() – Fetch all graded test data for the teacher.
 *
 * Notes:
 * - Uses Bearer token from localStorage for authenticated Gemini requests.
 * - Provides fallback behavior when grading by answer ID fails (e.g., try question ID).
 * - AI grading endpoints return suggestions only, not final grades.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

/**
 * Get all student tests for the teacher
 * @returns {Promise<Object>} The list of student tests
 */
export const getTeacherStudentTests = async () => {
	try {
		const response = await axiosInstance.get("/teacher/tests");
		return response.data.data;
	} catch (error) {
		console.error("Error fetching teacher student tests:", error);
		throw error;
	}
};

/**
 * Get a specific student test for grading
 * @param {string} testId - The student test ID
 * @returns {Promise<Object>} The student test details
 */
export const getTeacherStudentTest = async (testId) => {
	try {
		// Using the original path without 'api' prefix
		const response = await axiosInstance.get(`/teacher/tests/${testId}`);
		const data = response.data.data;

		// Create a map of question IDs for easier lookup
		const questionMap = {};
		if (data.scheduledTest?.test?.questions) {
			data.scheduledTest.test.questions.forEach((q, index) => {
				const qId = q.question?._id?.toString();
				if (qId) {
					questionMap[qId] = {
						index,
						question: q.question,
					};
				}
			});
		}

		// Process questions for display
		if (data.scheduledTest?.test?.questions) {
			data.questions = data.scheduledTest.test.questions.map((question) => {
				const questionObject = question.question;
				questionObject.points = question.points;
				return questionObject;
			});
		}

		// Enhance the answers with additional metadata
		if (data.answers && Array.isArray(data.answers)) {
			// Enhance answers with better matching info
			data.answers = data.answers.map((answer) => {
				const questionId =
					answer.question?.toString?.() || String(answer.question);
				const matchedQuestion = questionMap[questionId];

				return {
					...answer,
					questionId, // Ensure consistent ID format
					matchedIndex: matchedQuestion ? matchedQuestion.index : -1,
					hasMatch: !!matchedQuestion,
				};
			});
		}

		return data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Error fetching test");
	}
};

/**
 * Grade a student test
 * @param {string} id - The student test ID
 * @param {Object} gradeData - The grading data
 * @param {number} gradeData.score - The overall score for the test
 * @param {string} gradeData.feedback - General feedback for the student
 * @param {Array} gradeData.gradedAnswers - Array of graded answers
 * @returns {Promise<Object>} The updated student test
 */
export const gradeStudentTest = async (id, gradeData) => {
	try {
		const response = await axiosInstance.put(
			`/teacher/tests/${id}/grade`,
			gradeData
		);
		return response.data.data;
	} catch (error) {
		console.error(`Error grading student test ${id}:`, error);
		throw error;
	}
};

/**
 * Get all tests for a teacher
 * @returns {Promise<Object>} The tests data
 */
export const getTeacherTests = async () => {
	const response = await axiosInstance.get("/teacher/tests");
	return response.data.data;
};

/**
 * Get a specific test for a teacher
 * @param {string} testId - The ID of the test to fetch
 * @returns {Promise<Object>} The test data
 */
export const getTeacherTest = async (testId) => {
	const response = await axiosInstance.get(`/teacher/tests/${testId}`);
	return response.data.data;
};

/**
 * Grade a student's test submission
 * @param {string} testId - The ID of the student test to grade
 * @param {Object} data - The grading data including score and feedback
 * @param {number} data.score - The overall score for the test
 * @param {string} data.status - The status of the test (e.g., "graded")
 * @param {string} [data.feedback] - Optional overall feedback for the test
 * @returns {Promise<Object>} The updated test data
 */
export const gradeStudentTestSubmission = async (testId, data) => {
	const response = await axiosInstance.post(
		`/api/teacher/student-tests/${testId}/grade`,
		data
	);
	return response.data;
};

/**
 * Grade an individual answer in a student's test using either answer ID or question ID
 * @param {object} params - The grading parameters
 * @param {string} params.answerId - The ID of the answer to grade (can be answer ID or question ID)
 * @param {object} params.data - The grading data
 * @param {number} params.data.points - The points awarded for the answer
 * @param {string} [params.data.feedback] - Optional feedback for the specific answer
 * @param {boolean} [params.isQuestionId=false] - Whether the ID is a question ID (fallback approach)
 * @param {string} [params.testId] - The ID of the student test (needed when using question ID)
 * @returns {Promise<Object>} The updated answer data
 */
export const gradeStudentAnswer = async ({
	answerId,
	data,
	isQuestionId = false,
	testId = null,
}) => {
	// Validate answerId to prevent server errors
	if (!answerId || answerId === "undefined" || answerId === undefined) {
		console.error(`Invalid answerId: ${answerId} - request aborted`);
		throw new Error("Cannot grade an answer with an invalid ID");
	}

	// Add query parameter for testId if available when using question ID
	let queryParams = "";
	if (isQuestionId && testId) {
		queryParams = `?testId=${testId}`;
	}

	// Construct the endpoint based on whether this is an answer ID or question ID
	const endpoint = isQuestionId
		? `/teacher/questions/${answerId}/grade${queryParams}` // Alternative endpoint for grading by question ID
		: `/teacher/answers/${answerId}/grade`; // Standard endpoint for grading by answer ID

	try {
		// Log the attempt
		console.log(
			`Grading ${isQuestionId ? "question" : "answer"} with ID ${answerId}${
				testId ? ` for test ${testId}` : ""
			}`
		);

		const response = await axiosInstance.post(endpoint, data);
		return response.data;
	} catch (error) {
		// If using answer ID failed and we haven't tried question ID yet, try using question ID as fallback
		if (!isQuestionId && error.response?.status === 404) {
			console.log(
				`Answer ID ${answerId} not found, trying as question ID instead`
			);
			// Recursive call with isQuestionId=true
			return gradeStudentAnswer({ answerId, data, isQuestionId: true, testId });
		}

		// If we're already using question ID and it failed, or it's a different error, throw it
		console.error(
			`Error grading ${isQuestionId ? "question" : "answer"} ${answerId}:`,
			error.response?.data?.message || error.message
		);
		throw error;
	}
};

/**
 * Request AI grading suggestions for a specific answer using Gemini (does NOT submit final grades)
 * @param {Object} params - The parameters for AI grading
 * @param {string} params.answerId - The ID of the answer to grade
 * @param {number} params.questionPoints - The maximum points for this question
 * @param {string} [params.testId] - The ID of the test for context
 * @returns {Promise<Object>} The AI grading suggestions
 */
export const requestGeminiAnswerGrading = async ({
	answerId,
	questionPoints = 10,
	testId = null,
}) => {
	try {
		// Get the token from storage to ensure it's available
		const storedData = localStorage.getItem("SES-USER");
		let token = null;

		if (storedData) {
			try {
				const userData = JSON.parse(storedData);
				token = userData.token;
			} catch (e) {
				console.error("Error parsing user data from storage", e);
			}
		}

		if (!token) {
			throw new Error("No authentication token found. Please log in again.");
		}

		// Build query params
		let endpoint = `/teacher/answers/${answerId}/ai-grade?points=${questionPoints}`;
		if (testId) {
			endpoint += `&testId=${testId}`;
		}

		// Get AI suggestions for the answer grade
		const response = await axiosInstance.get(endpoint, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.data && response.data.data) {
			return response.data.data;
		}

		return response.data;
	} catch (error) {
		console.error(
			`Error requesting AI grading suggestions for answer ${answerId}:`,
			error
		);
		if (error.response?.status === 401) {
			console.error(
				"Authentication error when requesting AI grading suggestions",
				error
			);
			throw new Error("Your session has expired. Please log in again.");
		}

		if (error.response?.status === 404) {
			console.error("AI grading endpoint not found", error);
			throw new Error(
				"AI grading feature is not available or not properly configured on the server."
			);
		}

		throw error;
	}
};

/**
 * Request AI grading suggestions for an entire test using Gemini (does NOT submit final grades)
 * @param {string} testId - The ID of the test to grade
 * @returns {Promise<Object>} The AI grading suggestions
 */
export const requestGeminiTestGrading = async (testId) => {
	try {
		// Get the token from storage to ensure it's available
		const storedData = localStorage.getItem("SES-USER");
		let token = null;

		if (storedData) {
			try {
				const userData = JSON.parse(storedData);
				token = userData.token;
			} catch (e) {
				console.error("Error parsing user data from storage", e);
			}
		}

		if (!token) {
			throw new Error("No authentication token found. Please log in again.");
		}

		// Get AI suggestions for the test grades
		const response = await axiosInstance.get(
			`/teacher/tests/${testId}/ai-grade`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.data && response.data.data) {
			return {
				...response.data.data,
				isSuggestion: true, // Ensure the frontend knows this is a suggestion only
			};
		}

		return {
			...response.data,
			isSuggestion: true, // Ensure the frontend knows this is a suggestion only
		};
	} catch (error) {
		console.error(
			`Error requesting AI grading suggestions for test ${testId}:`,
			error
		);
		if (error.response?.status === 401) {
			console.error(
				"Authentication error when requesting AI grading suggestions",
				error
			);
			throw new Error("Your session has expired. Please log in again.");
		}

		if (error.response?.status === 404) {
			console.error("AI grading endpoint not found", error);
			throw new Error(
				"AI grading feature is not available or not properly configured on the server."
			);
		}

		throw error;
	}
};

/**
 * Get all grades for the teacher (both assigned grades and grades with scheduled tests)
 * @returns {Promise<Array>} The list of grades
 */
export const getTeacherGrades = async () => {
	try {
		const response = await axiosInstance.get("/teacher/tests/grades");
		return response.data.data;
	} catch (error) {
		console.error("Error fetching teacher grades:", error);
		throw error;
	}
};

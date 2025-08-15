/**
 * testAPI.js – Test Management & AI Test Generation API
 *
 * This module handles all API interactions for managing tests and generating tests using AI.
 * It includes standard CRUD operations as well as AI-based test suggestion and creation.
 *
 * Functions:
 * ▸ getTests(): Fetch all tests.
 * ▸ getTest(id): Fetch a single test by ID.
 * ▸ createTest(testData): Create a new test manually.
 * ▸ updateTest(id, testData): Update an existing test.
 * ▸ deleteTest(id): Delete a test by ID.
 *
 * AI-Related Functions:
 * ▸ getQuestionsForAI(gradeId, subjectId): Fetches question pool for AI test generation.
 * ▸ generateAITest(testConfig): Generates test suggestions using AI.
 * ▸ createAITest(testData): Creates a test based on AI-generated content.
 *
 * Notes:
 * - Uses a pre-configured axiosInstance from config.js.
 * - All errors are rethrown with clear messages from the server response if available.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

// Get all tests
export const getTests = async () => {
	try {
		const response = await axiosInstance.get("/tests");
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// Get single test
export const getTest = async (id) => {
	try {
		const response = await axiosInstance.get(`/tests/${id}`);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// Create a new test
export const createTest = async (testData) => {
	const response = await axiosInstance.post("/tests", testData);
	return response.data;
};

// Update test
export const updateTest = async (id, testData) => {
	try {
		const response = await axiosInstance.put(`/tests/${id}`, testData);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// Delete test
export const deleteTest = async (id) => {
	try {
		const response = await axiosInstance.delete(`/tests/${id}`);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// AI Test Generation Functions

// Get questions for AI analysis
export const getQuestionsForAI = async (gradeId, subjectId) => {
	try {
		const response = await axiosInstance.get(
			`/tests/ai/questions/${gradeId}/${subjectId}`
		);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// Generate AI test suggestions
export const generateAITest = async (testConfig) => {
	try {
		const response = await axiosInstance.post("/tests/ai/generate", testConfig);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// Create test with AI-generated content
export const createAITest = async (testData) => {
	try {
		const response = await axiosInstance.post("/tests/ai/create", testData);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

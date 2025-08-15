/**
 * Scheduled Tests API Module
 *
 * This module provides functions to interact with the scheduled tests endpoints on the server.
 * It allows fetching all scheduled tests, retrieving a specific test by ID, creating new tests,
 * updating existing ones, and deleting tests. It also supports retrieving upcoming and past tests
 * for a specific grade.
 *
 * Dependencies:
 * - Uses `axiosInstance` from the shared apiConfig for authenticated API requests
 *
 * Exported Functions:
 * - getScheduledTests(): Fetch all scheduled tests
 * - getScheduledTestById(id): Fetch a specific scheduled test with validation
 * - createScheduledTest(testData): Schedule a new test
 * - updateScheduledTest(id, testData): Update an existing scheduled test
 * - deleteScheduledTest(id): Remove a scheduled test
 * - getUpcomingTests(gradeId): Get future tests for a specific grade
 * - getPastTests(gradeId): Get past tests for a specific grade
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

// Get all scheduled tests
export const getScheduledTests = async () => {
	const response = await axiosInstance.get("/scheduled-tests");
	return response.data;
};

// Get a specific scheduled test by ID with validation
export const getScheduledTestById = async (id) => {
	// Validate the ID
	if (!id || id === "undefined" || id === "null") {
		throw new Error("Invalid test ID");
	}

	const endpoint = `/scheduled-tests/${id}`;
	const response = await axiosInstance.get(endpoint);

	// Validate the response
	if (!response.data || !response.data.data) {
		throw new Error("Invalid response format");
	}

	// Validate that we have a test object
	if (!response.data.data.test) {
		throw new Error("Test data is incomplete");
	}

	return response.data;
};

// Create a new scheduled test
export const createScheduledTest = async (testData) => {
	const response = await axiosInstance.post("/scheduled-tests", testData);
	return response.data;
};

// Update an existing scheduled test
export const updateScheduledTest = async (id, testData) => {
	const response = await axiosInstance.put(`/scheduled-tests/${id}`, testData);
	return response.data;
};

// Delete a scheduled test by ID
export const deleteScheduledTest = async (id) => {
	const response = await axiosInstance.delete(`/scheduled-tests/${id}`);
	return response.data;
};

// Get upcoming tests for a specific grade
export const getUpcomingTests = async (gradeId) => {
	const response = await axiosInstance.get(
		`/scheduled-tests/upcoming/${gradeId}`
	);
	return response.data;
};

// Get past tests for a specific grade
export const getPastTests = async (gradeId) => {
	const response = await axiosInstance.get(`/scheduled-tests/past/${gradeId}`);
	return response.data;
};

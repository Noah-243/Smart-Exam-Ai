/**
 * Question Management API Module
 *
 * This module handles all API interactions related to exam questions in the system.
 * It supports full CRUD operations, as well as advanced filtering and pagination.
 * Each function wraps an HTTP request using Axios and provides a clean interface to the frontend.
 *
 * Dependencies:
 * - Uses axiosInstance from `apiConfig`, which includes token injection and error handling.
 *
 * Functions:
 * - getQuestions: Retrieves a paginated list of questions with optional filters.
 * - getQuestionById: Retrieves a specific question by ID.
 * - createQuestion: Sends a POST request to create a new question.
 * - updateQuestion: Sends a PUT request to update an existing question.
 * - deleteQuestion: Sends a DELETE request to remove a question.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

// Get all questions with pagination and optional filters
export const getQuestions = async (page = 1, limit = 10, filters = {}) => {
	// If filters are provided (by grade or subject), use the filtered endpoint
	if (filters && (filters.grades?.length > 0 || filters.subjects?.length > 0)) {
		const params = new URLSearchParams();
		params.append("page", page);
		params.append("limit", limit);

	// Add grade filters
		if (filters.grades?.length > 0) {
			// Filter out any undefined or null grade IDs
			filters.grades
				.filter((gradeId) => gradeId)
				.forEach((gradeId) => {
					params.append("grades", gradeId);
				});
		}

		// Add subject filters
		if (filters.subjects?.length > 0) {
			// Filter out any undefined or null subject IDs
			filters.subjects
				.filter((subjectId) => subjectId)
				.forEach((subjectId) => {
					params.append("subjects", subjectId);
				});
		}

		// GET request to the filtered endpoint
		const response = await axiosInstance.get(
			`/questions/filter?${params.toString()}`
		);

		// Return data and pagination details
		return {
			data: response.data.data,
			pagination: response.data.pagination,
		};
	}

	// If no filters, use the default endpoint with pagination
	const response = await axiosInstance.get(
		`/questions?page=${page}&limit=${limit}`
	);
	return {
		data: response.data.data,
		pagination: response.data.pagination,
	};
};

// Get a single question by ID
export const getQuestionById = async (id) => {
	const response = await axiosInstance.get(`/questions/${id}`);
	return response.data;
};

// Create a new question
export const createQuestion = async (questionData) => {
	const response = await axiosInstance.post("/questions", questionData);
	return response.data;
};

// Update an existing question by ID
export const updateQuestion = async (id, questionData) => {
	const response = await axiosInstance.put(`/questions/${id}`, questionData);
	return response.data;
};

// Delete a question by ID
export const deleteQuestion = async (id) => {
	const response = await axiosInstance.delete(`/questions/${id}`);
	return response.data;
};

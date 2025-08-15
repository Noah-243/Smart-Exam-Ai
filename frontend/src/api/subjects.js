/**
 * subjectAPI.js – Subject Management API
 *
 * This module provides functions to interact with the backend for managing subjects.
 * Includes operations to fetch, create, update, and delete subjects using axiosInstance.
 *
 * Exported functions:
 * - getAllSubjects() / getSubjects() – Get all subjects
 * - getSubjectById(id) – Get a subject by ID
 * - createSubject(subjectData) – Create a new subject
 * - updateSubject(id, subjectData) – Update an existing subject
 * - deleteSubject(id) – Delete a subject by ID
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

/**
 * Get all subjects
 */
export const getAllSubjects = async () => {
	try {
		const response = await axiosInstance.get("/subjects");
		return response.data;
	} catch (error) {
		console.error("Error fetching subjects:", error);
		throw error;
	}
};

// Alias for getAllSubjects to maintain backward compatibility
export const getSubjects = getAllSubjects;

// Get a single subject by ID
export const getSubjectById = async (id) => {
	const response = await axiosInstance.get(`/subjects/${id}`);
	return response.data;
};

// Create a new subject
export const createSubject = async (subjectData) => {
	const response = await axiosInstance.post("/subjects", subjectData);
	return response.data;
};

// Update a subject
export const updateSubject = async (id, subjectData) => {
	const response = await axiosInstance.put(`/subjects/${id}`, subjectData);
	return response.data;
};

// Delete a subject
export const deleteSubject = async (id) => {
	const response = await axiosInstance.delete(`/subjects/${id}`);
	return response.data;
};

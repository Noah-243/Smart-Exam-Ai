/**
 * teacherProfileAPI.js – API Functions for Teacher Profile Management
 *
 * Provides endpoints for teachers to access and update their own profile data,
 * including teaching assignments and specializations.
 *
 * Functions:
 * - getTeacherProfile(): Fetches the current teacher's profile using the /me endpoint.
 * - updateTeachingAssignments(assignments): Updates the teacher's teaching assignments.
 * - updateSpecializations(specializations): Updates the teacher's subject specializations.
 *
 * Notes:
 * - All API requests use the secure /teachers/me route to ensure only the
 *   authenticated teacher accesses or updates their own information.
 * - Uses `axiosInstance` from config.js for consistent request configuration.
 * - Each function includes basic error handling and logging.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

/**
 * Get teacher profile details including teaching assignments
 */
export const getTeacherProfile = async () => {
	try {
		// Use /me endpoint for teachers to get their own profile
		const response = await axiosInstance.get(`/teachers/me`);
		return response.data;
	} catch (error) {
		console.error("Error fetching teacher profile:", error);
		throw error;
	}
};

/**
 * Update teaching assignments for a teacher
 */
export const updateTeachingAssignments = async (assignments) => {
	try {
		// Always use /me endpoint for teachers updating their own assignments
		const response = await axiosInstance.put(
			`/teachers/me/assignments`,
			assignments
		);
		return response.data;
	} catch (error) {
		console.error("Error updating teaching assignments:", error);
		throw error;
	}
};

/**
 * Update teacher specializations
 */
export const updateSpecializations = async (specializations) => {
	try {
		// Always use /me endpoint for teachers updating their own specializations
		const response = await axiosInstance.put(`/teachers/me/specializations`, {
			specializations,
		});
		return response.data;
	} catch (error) {
		console.error("Error updating specializations:", error);
		throw error;
	}
};

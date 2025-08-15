/**
 * Grade Management API Module
 *
 * This module provides all necessary functions to interact with the `/grades` API endpoints.
 * It allows the frontend to perform CRUD operations on grades and manage the association
 * between students and their respective grades.
 *
 * Dependencies:
 * - Uses a pre-configured `axiosInstance` from `apiConfig` to handle HTTP requests
 *   with built-in authentication and error handling.
 *
 * Exported Functions:
 * - getGrades(): Fetches the list of all grades.
 * - getStudentCountsByGrade(): Retrieves the number of students per grade.
 * - getGradeById(id): Fetches data for a specific grade and its students.
 * - createGrade(gradeData): Creates a new grade with the given data.
 * - updateGrade(id, gradeData): Updates an existing grade by ID.
 * - deleteGrade(id): Deletes a grade by its ID.
 * - addStudentToGrade(gradeId, studentData): Adds a new student to the specified grade.
 * - transferStudent(studentId, fromGradeId, toGradeId): Moves a student from one grade to another.
 * - getGradeWithStudents(gradeId): Retrieves a grade along with all its students (alias to getGradeById).
 *
 * Usage Example:
 * const grades = await getGrades();
 * const studentCounts = await getStudentCountsByGrade();
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

// Get all grades
export const getGrades = async () => {
	try {
		const response = await axiosInstance.get("/grades");
		return response.data;
	} catch (error) {
		console.error("Error fetching grades:", error);
		throw error;
	}
};

// Get student counts for all grades
export const getStudentCountsByGrade = async () => {
	try {
		console.log("Fetching student counts from server...");
		const response = await axiosInstance.get("/grades/student-counts");
		console.log("Student counts API response:", response);
		console.log("Student counts data structure:", response.data);
		return response.data;
	} catch (error) {
		console.error("Error fetching student counts:", error);
		throw error;
	}
};

// Get a single grade by ID
export const getGradeById = async (id) => {
	const response = await axiosInstance.get(`/grades/${id}/students`);
	return response.data;
};

// Create a new grade
export const createGrade = async (gradeData) => {
	const response = await axiosInstance.post("/grades", gradeData);
	return response.data;
};

// Update a grade
export const updateGrade = async (id, gradeData) => {
	const response = await axiosInstance.put(`/grades/${id}`, gradeData);
	return response.data;
};

// Delete a grade
export const deleteGrade = async (id) => {
	const response = await axiosInstance.delete(`/grades/${id}`);
	return response.data;
};

// Add student to grade
export const addStudentToGrade = async (gradeId, studentData) => {
	const response = await axiosInstance.post(
		`/grades/${gradeId}/students`,
		studentData
	);
	return response.data;
};

// Transfer student
export const transferStudent = async (studentId, fromGradeId, toGradeId) => {
	const response = await axiosInstance.post(`/grades/transfer-student`, {
		studentId,
		fromGradeId,
		toGradeId,
	});
	return response.data;
};

export const getGradeWithStudents = async (gradeId) => {
	try {
		const response = await axiosInstance.get(`/grades/${gradeId}/students`);
		return response.data;
	} catch (error) {
		console.error("Error fetching grade students:", error);
		throw error;
	}
};

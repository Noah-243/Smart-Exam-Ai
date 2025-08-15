/**
 * teacherDashboardAPI.js – API Functions for Teacher Dashboard
 *
 * Provides functions to fetch teacher-specific dashboard data from the backend,
 * including upcoming tests, test results, and grades.
 *
 * Functions:
 * - getTeacherDashboardData(): Fetch general teacher dashboard data.
 * - getTeacherUpcomingTests(): Fetch upcoming tests assigned to the teacher.
 * - getTeacherTestResults(): Fetch test results for tests the teacher created.
 * - getTeacherGrades(): Extracts teaching assignments with grades from the dashboard data.
 *
 * Notes:
 * - All functions use `axiosInstance` from config.js.
 * - Responses are returned as-is, or with extracted data when needed.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

export const getTeacherDashboardData = async () => {
	const response = await axiosInstance.get("/teacher-dashboard");
	return response.data;
};

export const getTeacherUpcomingTests = async () => {
	const response = await axiosInstance.get("/teacher-dashboard/upcoming-tests");
	return response.data;
};

export const getTeacherTestResults = async () => {
	const response = await axiosInstance.get("/teacher-dashboard/test-results");
	return response.data;
};

export const getTeacherGrades = async () => {
	const response = await axiosInstance.get("/teacher-dashboard");
	// Extract just the teaching assignments with grades
	return response.data.data.teacher.teachingAssignments;
};

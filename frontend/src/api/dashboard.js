/**
 * Dashboard Statistics API Module
 *
 * This module provides a utility function for fetching aggregated statistics
 * used in the admin or user dashboard interface.
 *
 * Dependencies:
 * - Uses a pre-configured `axiosInstance` from the `apiConfig` module.
 *   This instance automatically includes authentication headers and error handling.
 *
 * Exported Functions:
 * - getDashboardStats(): Sends a GET request to `/dashboard/stats` endpoint
 *   and returns the `data` portion of the response.
 *
 * Expected Usage:
 * - Call this function inside a component or service to retrieve real-time stats
 *   like number of users, tests, grades, or any other metrics shown in the dashboard.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

export const getDashboardStats = async () => {
	const response = await axiosInstance.get("/dashboard/stats");
	return response.data;
};

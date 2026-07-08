/**
 * Axios Configuration Module
 *
 * This module sets up a custom axios instance for making HTTP requests from the frontend to the backend API.
 * It includes request and response interceptors to handle authentication tokens and common error handling.
 *
 * Key Features:
 * - Uses a relative `API_URL` for proxy compatibility in development environments (e.g., Vite).
 * - Stores and retrieves the JWT token from `localStorage` using a fixed key (`SES-USER`).
 * - Automatically attaches the token to the `Authorization` header of each request (as Bearer token).
 * - Handles HTTP errors globally:
 *    - 401 Unauthorized → clears token and redirects to login (except when updating profile).
 *    - 403 Forbidden → redirects to `/unauthorized`.
 *    - 404 Not Found → redirects to `/not-found`.
 *
 * Exports:
 * - `apiConfig`: An object containing:
 *    - `axiosInstance`: the configured axios client
 *    - `API_URL`: the base path for API calls ("/api")
 */

import axios from "axios";

// Use relative path for better compatibility with Vite proxy
const API_URL = import.meta.env.VITE_API_URL || "/api";
const STORAGE_KEY = "SES-USER";

const axiosInstance = axios.create({
	baseURL: API_URL,
	withCredentials: true,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add auth token to all requests
axiosInstance.interceptors.request.use((config) => {
	try {
		const storedData = localStorage.getItem(STORAGE_KEY);
		if (storedData) {
			const { token } = JSON.parse(storedData);
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		return config;
	} catch {
		return config;
	}
});

// Handle response errors
axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle specific error cases
		if (error.response?.status === 401) {
			// Don't automatically redirect for profile update operations
			if (error.config?.url === "/auth/updateprofile") {
				// Just return the error for the component to handle
				return Promise.reject(error);
			}

			// Handle unauthorized access for other endpoints
			localStorage.removeItem(STORAGE_KEY);
			window.location.href = "/login";
		} else if (error.response?.status === 403) {
			// Handle forbidden access
			window.location.href = "/unauthorized";
		} else if (error.response?.status === 404) {
			// Handle not found
			window.location.href = "/not-found";
		}

		return Promise.reject(error);
	}
);

export const apiConfig = {
	axiosInstance,
	API_URL,
};

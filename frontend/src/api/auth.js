/**
 * ===============================
 * 🔐 Authentication API Module
 * ===============================
 * This module handles user authentication actions for the front-end application:
 *
 * 1. login(credentials):
 *    - Sends a login request to the backend (/auth/login).
 *    - Stores the logged-in user's data and token in localStorage under the key "SES-USER".
 *
 * 2. logout():
 *    - Removes the user's data from localStorage, effectively logging them out.
 *
 * 3. updateProfile(profileData):
 *    - Sends a PUT request to update the logged-in user's profile (/auth/updateprofile).
 *    - Updates the stored user object in localStorage with the new profile data.
 *
 * All API calls use the configured axios instance from ./config (with baseURL, headers, etc.).
 * These functions are asynchronous and return Promises.
 */

import { apiConfig } from "./config";

/**
 * Logs in a user with given credentials.
 * Sends POST request to /auth/login endpoint and stores user data in localStorage if successful.
 *
 * @param {Object} credentials - The user's email and password
 * @returns {Object} success and data object containing user and token
 */
export const login = async (credentials) => {
	const response = await apiConfig.axiosInstance.post(
		"/auth/login",
		credentials
	);

	// Check if response is valid and contains expected data
	if (response.data && response.data.success && response.data.data) {
		const { user, token } = response.data.data;

		// Defensive check in case user or token is missing
		if (!user || !token) {
			throw new Error("Invalid login response: missing user or token");
		}

		// Combine user and token into one object for storage
		const dataToStore = {
			...user,
			token,
		};

		// Store user + token in browser localStorage under "SES-USER"
		localStorage.setItem("SES-USER", JSON.stringify(dataToStore));

		// Return successful response
		return {
			success: true,
			data: dataToStore,
		};
	} else {
		throw new Error("Invalid response format"); // Error if structure is unexpected
	}
};

/**
 * Logs out the current user.
 * Simply removes the user data from localStorage.
 */
export const logout = () => {
	localStorage.removeItem("SES-USER");
};

/**
 * Updates the logged-in user's profile.
 * Sends PUT request to /auth/updateprofile with updated profileData.
 * Also updates the localStorage with the latest user info.
 *
 * @param {Object} profileData - The new profile fields (e.g., name, email)
 * @returns {Object} The updated response from the server
 */
export const updateProfile = async (profileData) => {
	const response = await apiConfig.axiosInstance.put(
		"/auth/updateprofile",
		profileData
	);

	if (response.data && response.data.success) {
		// Retrieve the current stored user data
		const storedData = JSON.parse(localStorage.getItem("SES-USER"));

		// Merge old user data with the updated fields returned from backend
		const updatedUser = { ...storedData, ...response.data.data };

		// Save updated user data to localStorage
		localStorage.setItem("SES-USER", JSON.stringify(updatedUser));

		return response.data;
	} else {
		throw new Error("Failed to update profile");
	}
};

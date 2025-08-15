/**
 * submitTestAPI.js – Function to Submit Student Test
 *
 * Overview:
 * This module defines the `submitTest` function responsible for submitting
 * a student's completed test to the backend server. It handles validation,
 * authentication, and fallback logic to ensure reliability in the submission process.
 *
 * Purpose:
 * - Validate input test data before submission.
 * - Add Authorization header based on user token stored in localStorage.
 * - Attempt to submit test data via the main endpoint and fall back to
 *   an alternate endpoint if the first one fails with a 404 error.
 *
 * Main Function:
 * - submitTest(testData): Sends a POST request with the test data.
 *   - Expects `testData` to include:
 *     - `scheduledTest` (test ID)
 *     - `answers` (array of answer objects)
 *   - Verifies presence of a valid Bearer token.
 *   - Uses Axios instance configured in `config.js`.
 *
 * Error Handling:
 * - Throws errors for missing or invalid data.
 * - Throws if the user is not authenticated.
 * - Falls back to `/student-dashboard/submit-test` if `/student-tests` returns 404.
 *
 * Related:
 * - Axios instance: Comes from `apiConfig` and includes base URL and headers.
 * - Token: Retrieved from localStorage key `"SES-USER"` and applied to headers.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

export const submitTest = async (testData) => {
	// Validate the test data before sending
	if (!testData.scheduledTest) {
		throw new Error("Test ID is required for submission");
	}

	if (
		!testData.answers ||
		!Array.isArray(testData.answers) ||
		testData.answers.length === 0
	) {
		throw new Error("Test answers are required for submission");
	}

	// Ensure authorization header is set
	const storedUserData = JSON.parse(localStorage.getItem("SES-USER"));
	if (storedUserData?.token) {
		axiosInstance.defaults.headers.common[
			"Authorization"
		] = `Bearer ${storedUserData.token}`;
	} else {
		throw new Error("Authentication required to submit test");
	}

	// Try the main endpoint first
	try {
		const response = await axiosInstance.post("/student-tests", testData);
		return response.data;
	} catch (error) {
		if (error.response?.status === 404) {
			// Try a fallback endpoint if the main one fails with 404
			const fallbackResponse = await axiosInstance.post(
				"/student-dashboard/submit-test",
				testData
			);
			return fallbackResponse.data;
		}
		throw error; // Re-throw if it's not a 404
	}
};

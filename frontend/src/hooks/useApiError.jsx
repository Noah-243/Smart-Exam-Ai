
/**
 * useApiError
 *
 * A custom React hook for handling API errors and loading state in a consistent way.
 * This hook integrates with the notistack library to display error messages
 * as snackbars (toasts) and provides utility functions to handle API requests gracefully.
 *
 * Features:
 * - Tracks the `error` and `loading` states
 * - Automatically shows error messages in snackbars
 * - Wraps async requests and handles errors internally
 * - Provides utility functions to clear errors manually
 *
 * Returns:
 * {
 *   error: any,                     // Current error object or null
 *   loading: boolean,              // Whether a request is currently in progress
 *   handleError: function,         // Manually trigger error handling
 *   clearError: function,          // Manually clear current error
 *   wrapRequest: function          // Wraps an async request with built-in error/loading handling
 * }
 *
 * Example usage:
 * ```js
 * const { error, loading, wrapRequest } = useApiError();
 *
 * useEffect(() => {
 *   wrapRequest(() => fetchUsers()).then(setUsers);
 * }, []);
 * ```
 *
 * Dependencies:
 * - React (useState, useCallback)
 * - notistack (useSnackbar)
 */

import { useState, useCallback } from "react";
import { useSnackbar } from "notistack";

export const useApiError = () => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error) => {
			setError(error);
			setLoading(false);

			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"An unexpected error occurred";

			enqueueSnackbar(errorMessage, {
				variant: "error",
				autoHideDuration: 5000,
				anchorOrigin: {
					vertical: "top",
					horizontal: "right",
				},
			});
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const wrapRequest = useCallback(
		async (request) => {
			try {
				setLoading(true);
				setError(null);
				const response = await request();
				setLoading(false);
				return response;
			} catch (err) {
				handleError(err);
				throw err;
			}
		},
		[handleError]
	);

	return {
		error,
		loading,
		handleError,
		clearError,
		wrapRequest,
	};
};

/**
 * UserProvider.jsx
 *
 * This component provides a global authentication context for the entire React application.
 * It handles user login, logout, session persistence (via localStorage),
 * and exposes useful authentication-related values and functions to all components via context.
 *
 * Features:
 * - Stores and shares authenticated user data (with token)
 * - Persists user sessions across page reloads using localStorage
 * - Exposes `login`, `logout`, and `updateUser` functions to manage user state
 * - Provides `isAuthenticated` and `isLoading` booleans for control flow in UI
 * - Redirects to the login page on logout
 * - Memoizes context values to avoid unnecessary re-renders
 *
 * Usage:
 * Wrap your application with `<UserProvider>` in the main `App.jsx` file:
 *
 * ```jsx
 * <UserProvider>
 *   <App />
 * </UserProvider>
 * ```
 *
 * Inside any component, access user data using the custom hook `useUser()`:
 *
 * ```jsx
 * const { user, login, logout, isAuthenticated } = useUser();
 * ```
 *
 * Technologies:
 * - React Context API (createContext, useContext)
 * - React Router (useNavigate)
 * - Local Storage for session persistence
 */


import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const STORAGE_KEY = "SES-USER";

// Create context with a default value that matches the shape of the context
const UserContext = createContext({
	user: null,
	login: () => {},
	logout: () => {},
	isAuthenticated: false,
	isLoading: true,
});

// Custom hook for using the context
export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};

export default function UserProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	// Initialize auth state from localStorage
	useEffect(() => {
		const initializeAuth = () => {
			try {
				const storedUserData = JSON.parse(localStorage.getItem(STORAGE_KEY));

				if (storedUserData?.user && storedUserData?.token) {
					setUser({
						...storedUserData.user,
						token: storedUserData.token,
					});
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				localStorage.removeItem(STORAGE_KEY);
			} finally {
				setIsLoading(false);
			}
		};

		initializeAuth();
	}, []);

	const login = (userData) => {
		try {
			const userWithToken = {
				...userData.data,
				token: userData.token,
			};
			// Save to localStorage
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					user: userData.data,
					token: userData.token,
				})
			);

			setUser(userWithToken);
		} catch (error) {
			console.error("Error setting user:", error);
			throw new Error("Failed to log in");
		}
	};

	const logout = () => {
		try {
			localStorage.removeItem(STORAGE_KEY);
			setUser(null);
			navigate("/login");
		} catch (error) {
			console.error("Error during logout:", error);
			// Still clear the user state even if there's an error
			setUser(null);
		}
	};

	const updateUser = (userData) => {
		// Preserve the token when updating user data
		const updatedUser = {
			...userData,
			token: user?.token,
		};
		setUser(updatedUser);

		// Maintain the correct structure in localStorage
		const storedData = {
			user: userData,
			token: user?.token,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
	};

	// Memoize the context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			user,
			login,
			logout,
			updateUser,
			isAuthenticated: !!user,
			isLoading,
		}),
		[user, isLoading]
	);

	// Show loading state
	if (isLoading) {
		return null; // Or a loading spinner component
	}

	return (
		<UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
	);
}

UserProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

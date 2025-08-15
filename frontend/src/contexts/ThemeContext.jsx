/**
 * ThemeContext.jsx
 *
 * Provides a global theme context to manage dark/light mode across the application.
 *
 * Features:
 * - Uses React Context API to expose `isDarkMode` and `toggleTheme`
 * - Persists the user's theme preference to localStorage
 * - Integrates with Material UI's ThemeProvider for consistent theming
 * - Applies either `lightTheme` or `darkTheme` based on user preference
 *
 * Usage:
 * - Wrap your app with `<ThemeProvider>` to enable theming support
 * - Use `useTheme()` hook in child components to access and toggle theme
 *
 * Example:
 * ```jsx
 * const { isDarkMode, toggleTheme } = useTheme();
 * <button onClick={toggleTheme}>
 *   Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
 * </button>
 * ```
 *
 * Technologies:
 * - React (useState, useContext, useEffect)
 * - Material UI ThemeProvider
 * - localStorage for persisting theme selection
 *
 * @returns {JSX.Element} The ThemeProvider component wrapping all children
 */

import { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material";
import { lightTheme, darkTheme } from "../theme";
import PropTypes from "prop-types";

const ThemeContext = createContext();

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

export function ThemeProvider({ children }) {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		// Initialize theme from localStorage or default to false (light mode)
		const savedTheme = localStorage.getItem("theme");
		return savedTheme === "dark";
	});

	// Save theme preference to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("theme", isDarkMode ? "dark" : "light");
	}, [isDarkMode]);

	const toggleTheme = () => {
		setIsDarkMode((prev) => !prev);
	};

	return (
		<ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
			<MUIThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
				{children}
			</MUIThemeProvider>
		</ThemeContext.Provider>
	);
}

ThemeProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

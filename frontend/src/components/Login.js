/**
 * Login.jsx
 *
 * This component renders the login screen for the Exemind-AI platform.
 * It allows users to log in by entering their email and password.
 * On successful login, the user data is stored in the AuthContext,
 * making the session available across the app.
 *
 * Features:
 * - Uses controlled inputs for email and password
 * - Handles form submission with async/await
 * - Displays error messages for failed login attempts
 * - Uses a shared logo and external CSS for styling
 * - Connects to backend via the `login` function from `api/auth.js`
 * - Updates global auth state using `AuthContext`
 *
 * Technologies used:
 * - React (useState, useContext)
 * - Custom AuthContext for authentication state management
 * - CSS Module for styling (Login.css)
 * - Static asset logo for branding
 *
 * @returns {JSX.Element} The login form UI
 */

import React, { useState, useContext } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";
import logo from "../assets/logo.png";

/**
 * Login component for Exemind-AI.
 * Allows users to log in using email and password.
 * On success, updates the global AuthContext with user data.
 */
const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login: loginUser } = useContext(AuthContext);

	console.log("Rendering login...");

	/**
	 * Handles form submission.
	 * Sends credentials to backend and stores result in AuthContext.
	 * Shows error if login fails.
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await login({ email, password });
			loginUser(response.data);
			console.log("Login successful:", response);
		} catch (err) {
			setError("Invalid email or password");
		}
	};

	return (
		<div className="login-container">
			<div className="logo-container">
				<img src={logo} alt="Exemind-AI Logo" className="login-logo" />
			</div>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Email</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div className="form-group">
					<label>Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				{error && <p className="error">{error}</p>}
				<button type="submit" className="login-button">
					Login
				</button>
			</form>
		</div>
	);
};

export default Login;

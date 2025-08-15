/**
 * Authentication Utility Functions
 *
 * This module provides helper functions for creating, signing, and verifying
 * JWT tokens, as well as sending authentication responses with cookies.
 *
 * Features:
 * - Create and sign JWT tokens
 * - Send token via HTTP-only cookie
 * - Secure cookie setup for production
 * - Verify JWT tokens
 *
 * Dependencies:
 * - jsonwebtoken: Used for creating and verifying JWTs
 *
 * Environment Variables Required:
 * - JWT_SECRET: Secret key for signing JWTs
 * - JWT_EXPIRE: Expiry time (e.g., "30d", "1h")
 * - JWT_COOKIE_EXPIRE: Number of days the auth cookie should last
 * - NODE_ENV: Used to determine if `secure` cookie flag should be set
 *
 * @module utils/auth.utils
 * @author Smart Exam Platform Team
 * @version 1.0
 */

const jwt = require("jsonwebtoken");

/**
 * Send JWT token response in a cookie and JSON body
 *
 * @param {Object} user - The authenticated user object
 * @param {number} statusCode - HTTP status code to return
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
	// Generate signed JWT token
	const token = user.getSignedJwtToken();

	// Cookie configuration options
	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to ms
		),
		httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
	};

	// Add "secure" flag in production to ensure HTTPS-only
	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	// Do not expose hashed password
	user.password = undefined;

	// Send response with cookie and token
	res
		.status(statusCode)
		.cookie("token", token, options)
		.json({
			success: true,
			token,
			data: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
};

/**
 * Create a signed JWT token from a user ID
 *
 * @param {string} id - The user ID to embed in the token
 * @returns {string} JWT token
 */
const createJwtToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

/**
 * Verify a JWT token and decode its payload
 *
 * @param {string} token - The token to verify
 * @returns {Object} Decoded payload (typically includes the user ID)
 */
const verifyJwtToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
	sendTokenResponse,
	createJwtToken,
	verifyJwtToken,
};

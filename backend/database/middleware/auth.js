/**
 * Authentication & Authorization Middleware
 * 
 * This module provides middleware functions to:
 * - Authenticate users via JWT (from Authorization header or cookies)
 * - Authorize access based on user roles (e.g., admin, teacher, student)
 *
 * @module middleware/auth
 */

const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

/**
 * Middleware to protect private routes.
 * 
 * - Verifies JWT token from Authorization header (Bearer) or cookies
 * - Adds authenticated user object (`req.user`) to the request
 * - Throws an error if token is invalid or user is not found
 *
 * @function protect
 * @access Private
 */
exports.protect = asyncHandler(async (req, res, next) => {
	console.log("Auth middleware request:", {
		method: req.method,
		path: req.path,
		headers: {
			authorization: req.headers.authorization ? "Bearer ..." : undefined,
			cookie: req.cookies ? "Present" : undefined,
		},
	});

	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		// Set token from Bearer token in header
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies.token) {
		// Set token from cookie
		token = req.cookies.token;
	}

	// Make sure token exists
	if (!token) {
		return next(new ErrorResponse("Not authorized to access this route", 401));
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("Decoded token:", decoded);

		req.user = await User.findById(decoded.id);
		if (!req.user) {
			return next(new ErrorResponse("User not found", 401));
		}

		console.log("Authenticated user:", {
			id: req.user._id,
			role: req.user.role,
			name: req.user.name,
		});

		next();
	} catch (err) {
		return next(new ErrorResponse("Not authorized to access this route", 401));
	}
});

/**
 * Middleware to authorize access based on user role(s)
 *
 * - Use in routes like: `authorize('admin', 'teacher')`
 * - Checks if the authenticated user's role is included in allowed roles
 *
 * @function authorize
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'teacher')
 * @returns {Function} Express middleware
 * @access Private
 */
exports.authorize = (...roles) => {
	return (req, res, next) => {
		console.log("Checking role authorization:", {
			userRole: req.user?.role,
			allowedRoles: roles,
			path: req.path,
		});

		if (!req.user) {
			return next(new ErrorResponse("User not found", 401));
		}
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role ${req.user.role} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};

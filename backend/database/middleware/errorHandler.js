/**
 * Centralized Error Handling Middleware
 * 
 * This middleware captures and formats errors for all routes and controllers.
 * It supports handling of:
 * - Invalid ObjectId (CastError)
 * - Duplicate key entries (MongoDB)
 * - Mongoose validation errors
 * 
 * @module middleware/errorHandler
 */

const ErrorResponse = require("../../utils/errorResponse");

/**
 * Express error handler middleware
 * 
 * @param {Object} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Log the full error for development/debugging
	console.error(err);

	// Handle invalid MongoDB ObjectId
	if (err.name === "CastError") {
		const message = "Resource not found";
		error = new ErrorResponse(message, 404);
	}

	// Handle duplicate key error (e.g., email already exists)
	if (err.code === 11000) {
		const message = "Duplicate field value entered";
		error = new ErrorResponse(message, 400);
	}

	// Handle Mongoose validation errors (e.g., required fields)
	if (err.name === "ValidationError") {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}

	// Send JSON response with error details
	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || "Server Error",
	});
};

module.exports = errorHandler;

/**
 * Error Handler Middleware
 * Centralized error handling system for the Exemind-AI backend
 *
 * Features:
 * - Comprehensive error logging with context
 * - Environment-specific error responses
 * - Error categorization and status code mapping
 * - Request tracking for debugging
 * - Security-aware error messaging
 *
 * @module middleware/errorHandler
 */

/**
 * Main error handling middleware
 * Processes all application errors and sends appropriate responses
 *
 * @function errorHandler
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
	// Log comprehensive error information
	console.error("\n🚨 =============== ERROR CAUGHT ===============");
	console.error(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.error(`🔗 Request URL: ${req.method} ${req.originalUrl}`);
	console.error(`👤 User IP: ${req.ip || req.connection.remoteAddress}`);
	console.error(`🆔 Request ID: ${req.headers["x-request-id"] || "N/A"}`);
	console.error(`📱 User Agent: ${req.headers["user-agent"] || "N/A"}`);

	// Error details
	console.error(`💥 Error Name: ${err.name}`);
	console.error(`📝 Error Message: ${err.message}`);
	console.error(`🔢 Status Code: ${err.statusCode || 500}`);

	// Log request body for debugging (excluding sensitive data)
	if (req.body && Object.keys(req.body).length > 0) {
		const sanitizedBody = sanitizeRequestBody(req.body);
		console.error(`📦 Request Body:`, JSON.stringify(sanitizedBody, null, 2));
	}

	// Log query parameters
	if (req.query && Object.keys(req.query).length > 0) {
		console.error(`🔍 Query Params:`, JSON.stringify(req.query, null, 2));
	}

	// Log route parameters
	if (req.params && Object.keys(req.params).length > 0) {
		console.error(`🛣️ Route Params:`, JSON.stringify(req.params, null, 2));
	}

	// Determine status code
	let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

	// Override status code if error has one
	if (err.statusCode) {
		statusCode = err.statusCode;
	}

	// Handle specific error types
	const errorInfo = categorizeError(err);
	statusCode = errorInfo.statusCode || statusCode;

	console.error(`📊 Final Status Code: ${statusCode}`);
	console.error(`🏷️ Error Category: ${errorInfo.category}`);

	// Log stack trace in development
	if (process.env.NODE_ENV === "development") {
		console.error(`📚 Stack Trace:`);
		console.error(err.stack);
	}

	console.error("🚨 ============================================\n");

	// Prepare response
	const response = {
		success: false,
		message: getErrorMessage(err, errorInfo),
		...(process.env.NODE_ENV === "development" && {
			stack: err.stack,
			error: err,
			category: errorInfo.category,
		}),
	};

	res.status(statusCode).json(response);
};

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 *
 * @function notFound
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFound = (req, res, next) => {
	console.log("\n🔍 =============== 404 NOT FOUND ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`🔗 Requested URL: ${req.method} ${req.originalUrl}`);
	console.log(`👤 User IP: ${req.ip || req.connection.remoteAddress}`);
	console.log(`📱 User Agent: ${req.headers["user-agent"] || "N/A"}`);
	console.log(`🌐 Referer: ${req.headers.referer || "N/A"}`);
	console.log("🔍 ============================================\n");

	const error = new Error(`Not Found - ${req.originalUrl}`);
	error.statusCode = 404;
	res.status(404);
	next(error);
};

/**
 * Categorize errors for better handling and logging
 *
 * @function categorizeError
 * @param {Error} err - The error object
 * @returns {Object} Error category information
 */
function categorizeError(err) {
	// Mongoose validation errors
	if (err.name === "ValidationError") {
		return {
			category: "Validation Error",
			statusCode: 400,
		};
	}

	// Mongoose cast errors
	if (err.name === "CastError") {
		return {
			category: "Invalid ID Format",
			statusCode: 400,
		};
	}

	// MongoDB duplicate key errors
	if (err.code === 11000) {
		return {
			category: "Duplicate Entry",
			statusCode: 400,
		};
	}

	// JWT errors
	if (err.name === "JsonWebTokenError") {
		return {
			category: "Authentication Error",
			statusCode: 401,
		};
	}

	if (err.name === "TokenExpiredError") {
		return {
			category: "Token Expired",
			statusCode: 401,
		};
	}

	// Custom application errors
	if (err.name === "ErrorResponse") {
		return {
			category: "Application Error",
			statusCode: err.statusCode || 400,
		};
	}

	// Network/Connection errors
	if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
		return {
			category: "Network Error",
			statusCode: 503,
		};
	}

	// Default category
	return {
		category: "Server Error",
		statusCode: 500,
	};
}

/**
 * Get user-friendly error message based on error type
 *
 * @function getErrorMessage
 * @param {Error} err - The error object
 * @param {Object} errorInfo - Error categorization info
 * @returns {string} User-friendly error message
 */
function getErrorMessage(err, errorInfo) {
	// In production, return generic messages for security
	if (process.env.NODE_ENV === "production") {
		switch (errorInfo.category) {
			case "Validation Error":
				return "Invalid data provided";
			case "Invalid ID Format":
				return "Invalid identifier format";
			case "Duplicate Entry":
				return "Resource already exists";
			case "Authentication Error":
			case "Token Expired":
				return "Authentication failed";
			case "Network Error":
				return "Service temporarily unavailable";
			default:
				return "Internal server error";
		}
	}

	// In development, return detailed messages
	return err.message || "An unexpected error occurred";
}

/**
 * Sanitize request body for logging (remove sensitive information)
 *
 * @function sanitizeRequestBody
 * @param {Object} body - Request body object
 * @returns {Object} Sanitized body object
 */
function sanitizeRequestBody(body) {
	const sensitiveFields = ["password", "token", "secret", "key", "auth"];
	const sanitized = { ...body };

	Object.keys(sanitized).forEach((key) => {
		if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
			sanitized[key] = "[REDACTED]";
		}
	});

	return sanitized;
}

/**
 * Log performance metrics for error analysis
 *
 * @function logPerformanceMetrics
 * @param {Request} req - Express request object
 */
function logPerformanceMetrics(req) {
	if (req.startTime) {
		const duration = Date.now() - req.startTime;
		console.error(`⏱️ Request Duration: ${duration}ms`);
	}

	// Memory usage
	const memUsage = process.memoryUsage();
	console.error(
		`💾 Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
	);
}

// Export as a CommonJS module
module.exports = {
	errorHandler,
	notFound,
	categorizeError,
	sanitizeRequestBody,
};

/**
 * Error Response Utility
 * Custom error class for structured error handling in Exemind-AI backend
 *
 * Features:
 * - Standardized error response format
 * - HTTP status code management
 * - Error message consistency
 * - Stack trace preservation
 * - Logging integration support
 *
 * @module utils/errorResponse
 * @author Exemind-AI Team
 */

/**
 * Custom Error Response Class
 * Extends the native Error class to include HTTP status codes
 * for consistent API error responses throughout the application
 *
 * @class ErrorResponse
 * @extends Error
 * @example
 * // Create a 404 Not Found error
 * throw new ErrorResponse("User not found", 404);
 *
 * @example
 * // Create a 400 Bad Request error
 * throw new ErrorResponse("Invalid input data", 400);
 */
class ErrorResponse extends Error {
	/**
	 * Create an ErrorResponse instance
	 *
	 * @param {string} message - Error message describing what went wrong
	 * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
	 * @param {Object} [details] - Additional error details for debugging
	 */
	constructor(message, statusCode, details = null) {
		// Call parent Error constructor with the message
		super(message);

		/**
		 * HTTP status code for the error response
		 * @type {number}
		 * @example 400, 401, 403, 404, 500
		 */
		this.statusCode = statusCode;

		/**
		 * Additional error details for debugging and logging
		 * @type {Object|null}
		 * @example { field: 'email', reason: 'already exists' }
		 */
		this.details = details;

		/**
		 * Timestamp when the error was created
		 * @type {string}
		 */
		this.timestamp = new Date().toISOString();

		/**
		 * Error name identifier
		 * @type {string}
		 */
		this.name = "ErrorResponse";

		/**
		 * Indicates this is an operational error (expected)
		 * vs programming error (unexpected)
		 * @type {boolean}
		 */
		this.isOperational = true;

		// Capture stack trace, excluding constructor call from it
		Error.captureStackTrace(this, this.constructor);

		// Log error creation for debugging (in development)
		if (process.env.NODE_ENV === "development") {
			console.log(`\n🔴 ErrorResponse created:`);
			console.log(`   📝 Message: ${message}`);
			console.log(`   📊 Status Code: ${statusCode}`);
			console.log(`   🕐 Timestamp: ${this.timestamp}`);
			if (details) {
				console.log(`   📋 Details: ${JSON.stringify(details)}`);
			}
		}
	}

	/**
	 * Convert error to JSON format for API responses
	 * @returns {Object} Serialized error object
	 */
	toJSON() {
		return {
			success: false,
			error: {
				message: this.message,
				statusCode: this.statusCode,
				timestamp: this.timestamp,
				details: this.details,
				...(process.env.NODE_ENV === "development" && { stack: this.stack }),
			},
		};
	}

	/**
	 * Get error severity level based on status code
	 * @returns {string} Severity level: 'low', 'medium', 'high', 'critical'
	 */
	getSeverity() {
		if (this.statusCode >= 500) return "critical";
		if (this.statusCode >= 400 && this.statusCode < 500) return "medium";
		if (this.statusCode >= 300 && this.statusCode < 400) return "low";
		return "low";
	}

	/**
	 * Check if error should be logged
	 * @returns {boolean} True if error should be logged
	 */
	shouldLog() {
		// Log server errors (5xx) and authentication errors
		return (
			this.statusCode >= 500 ||
			this.statusCode === 401 ||
			this.statusCode === 403
		);
	}
}

/**
 * Static helper methods for common error types
 */

/**
 * Create a 400 Bad Request error
 * @param {string} message - Error message
 * @param {Object} [details] - Additional details
 * @returns {ErrorResponse} ErrorResponse instance
 */
ErrorResponse.badRequest = (message, details) => {
	return new ErrorResponse(message, 400, details);
};

/**
 * Create a 401 Unauthorized error
 * @param {string} [message='Unauthorized access'] - Error message
 * @param {Object} [details] - Additional details
 * @returns {ErrorResponse} ErrorResponse instance
 */
ErrorResponse.unauthorized = (message = "Unauthorized access", details) => {
	return new ErrorResponse(message, 401, details);
};

/**
 * Create a 403 Forbidden error
 * @param {string} [message='Access forbidden'] - Error message
 * @param {Object} [details] - Additional details
 * @returns {ErrorResponse} ErrorResponse instance
 */
ErrorResponse.forbidden = (message = "Access forbidden", details) => {
	return new ErrorResponse(message, 403, details);
};

/**
 * Create a 404 Not Found error
 * @param {string} [message='Resource not found'] - Error message
 * @param {Object} [details] - Additional details
 * @returns {ErrorResponse} ErrorResponse instance
 */
ErrorResponse.notFound = (message = "Resource not found", details) => {
	return new ErrorResponse(message, 404, details);
};

/**
 * Create a 409 Conflict error
 * @param {string} [message='Resource conflict'] - Error message
 * @param {Object} [details] - Additional details
 * @returns {ErrorResponse} ErrorResponse instance
 */
ErrorResponse.conflict = (message = "Resource conflict", details) => {
	return new ErrorResponse(message, 409, details);
};

/**
 * Create a 500 Internal Server Error
 * @param {string} [message='Internal server error'] - Error message
 * @param {Object} [details] - Additional details
 * @returns {ErrorResponse} ErrorResponse instance
 */
ErrorResponse.internal = (message = "Internal server error", details) => {
	return new ErrorResponse(message, 500, details);
};

module.exports = ErrorResponse;

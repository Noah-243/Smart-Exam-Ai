/**
 * Async Handler Middleware
 *
 * Wraps async controller functions to eliminate the need for
 * repetitive try/catch blocks in controllers
 */

// Function to catch async errors and pass them to the error handler
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

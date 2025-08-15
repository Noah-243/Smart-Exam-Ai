/**
 * Async handler wrapper to eliminate try-catch blocks in controllers.
 * This utility wraps an asynchronous route handler function and
 * automatically forwards errors to the Express error handler via `next()`.
 *
 * This helps reduce boilerplate `try-catch` logic in every async controller.
 *
 * Usage:
 * router.get('/route', asyncHandler(async (req, res, next) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 *
 * @function asyncHandler
 * @param {Function} fn - The async function (controller) to wrap
 * @returns {Function} Express middleware-compatible function
 */

const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

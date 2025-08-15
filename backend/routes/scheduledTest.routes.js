/**
 * Scheduled Test Routing Module
 *
 * This module defines API routes for managing scheduled tests,
 * including fetching, creating, updating, and deleting test schedules.
 *
 * Features:
 * - Authenticated users can view upcoming and past tests by grade
 * - Teachers and admins can manage scheduled tests (CRUD operations)
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("teacher", "admin"): Restricts write operations to teachers and admins
 *
 * Routes:
 * - GET    /upcoming/:gradeId       → Authenticated: Get upcoming tests for a grade
 * - GET    /past/:gradeId           → Authenticated: Get past tests for a grade
 * - GET    /:id                     → Authenticated: Get a single scheduled test
 * - GET    /                        → Teacher/Admin: Get all scheduled tests
 * - POST   /                        → Teacher/Admin: Create a new scheduled test
 * - PUT    /:id                     → Teacher/Admin: Update a scheduled test
 * - DELETE /:id                     → Teacher/Admin: Delete a scheduled test
 *
 * @module routes/scheduledTest.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getScheduledTests,
	getScheduledTest,
	createScheduledTest,
	updateScheduledTest,
	deleteScheduledTest,
	getUpcomingTests,
	getPastTests,
} = require("../controllers/scheduledTest.controller");

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /upcoming/:gradeId
 * @desc    Get upcoming scheduled tests for a specific grade
 * @access  Private (Authenticated users)
 */
router.get("/upcoming/:gradeId", getUpcomingTests);

/**
 * @route   GET /past/:gradeId
 * @desc    Get past scheduled tests for a specific grade
 * @access  Private (Authenticated users)
 */
router.get("/past/:gradeId", getPastTests);

/**
 * @route   GET /:id
 * @desc    Get a specific scheduled test by ID
 * @access  Private (Authenticated users)
 */
router.get("/:id", getScheduledTest);

// Restrict the following routes to teachers and admins only
router.use(authorize("teacher", "admin"));

/**
 * @route   GET / 
 * @desc    Get all scheduled tests
 * @access  Private (Teacher/Admin only)
 *
 * @route   POST /
 * @desc    Create a new scheduled test
 * @access  Private (Teacher/Admin only)
 */
router.route("/").get(getScheduledTests).post(createScheduledTest);

/**
 * @route   PUT /:id
 * @desc    Update an existing scheduled test
 * @access  Private (Teacher/Admin only)
 *
 * @route   DELETE /:id
 * @desc    Delete a scheduled test
 * @access  Private (Teacher/Admin only)
 */
router.route("/:id").put(updateScheduledTest).delete(deleteScheduledTest);

module.exports = router;

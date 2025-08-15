/**
 * Teacher Dashboard Routes
 *
 * This router defines endpoints for retrieving dashboard data relevant to teachers and admins.
 * It includes data such as upcoming tests and test results.
 *
 * Features:
 * - Provides an overview of teacher-specific dashboard information
 * - Lists upcoming tests for teachers
 * - Returns test results submitted by students
 *
 * Middleware:
 * - protect: Ensures the request is from an authenticated user
 * - authorize("teacher", "admin"): Allows access only to users with teacher or admin roles
 *
 * Routes:
 * - GET /                   → Get overall dashboard data for teacher/admin
 * - GET /upcoming-tests     → Get a list of upcoming scheduled tests
 * - GET /test-results       → Get results of tests submitted by students
 *
 * @module routes/teacherDashboard.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getDashboardData,
	getUpcomingTests,
	getTestResults,
} = require("../controllers/teacherDashboard.controller");

// Protect all routes
router.use(protect);
router.use(authorize("teacher", "admin"));

router.get("/", getDashboardData);
router.get("/upcoming-tests", getUpcomingTests);
router.get("/test-results", getTestResults);

module.exports = router;

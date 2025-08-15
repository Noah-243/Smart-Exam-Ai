/**
 * Student Performance Routing Module
 *
 * Defines route for retrieving performance summary data for an individual student.
 *
 * Features:
 * - Middleware protection to ensure only authenticated users can access
 * - Role-based access restriction to students only
 *
 * Middleware:
 * - protect: Ensures the request is from an authenticated user
 * - authorize("student"): Ensures the user has the "student" role
 *
 * Routes:
 * - GET /api/student-performance/performance-summary
 *   → Authenticated Student Only: Returns summary of student's performance
 *
 * @module routes/student-performance.routes
 */

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");

// Performance summary route
router.get(
	"/performance-summary",
	protect,
	authorize("student"),
	studentController.getStudentPerformanceSummary
);

// Export the router
module.exports = router;

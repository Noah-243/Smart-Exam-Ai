/**
 * Student Test Submission Routing Module
 *
 * This module defines the route for students to submit their completed tests.
 *
 * Features:
 * - Middleware to ensure the route is accessed only by authenticated students
 * - Delegates test submission logic to the studentTestController
 *
 * Middleware:
 * - protect: Ensures the request is from an authenticated user
 * - authorize("student"): Restricts access to users with the "student" role
 *
 * Routes:
 * - POST /api/student-tests/
 *   → Authenticated Student Only: Submits a completed test for evaluation
 *
 * @module routes/studentTest.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const studentTestController = require("../controllers/studentTest.controller");

// Protect all routes
router.use(protect);

// Submit test route
router.post("/", authorize("student"), studentTestController.submitTest);

module.exports = router;

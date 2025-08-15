/**
 * Teacher Test Management Routes
 *
 * This router defines endpoints for teachers and admins to manage student test submissions.
 * It includes functionality for retrieving, grading, and getting AI-generated grades for student tests.
 *
 * Features:
 * - Retrieve all student test submissions associated with the teacher
 * - Fetch specific student test details
 * - Grade a test manually
 * - Retrieve AI-based grading suggestions
 * - Fetch all grades assigned/scheduled by a teacher
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("teacher", "admin"): Restricts access to teacher and admin users only
 *
 * Routes:
 * - GET /grades             → Get all grades assigned or scheduled by the teacher
 * - GET /                   → Get all student test submissions
 * - GET /:id                → Get a specific student test
 * - PUT /:id/grade          → Submit manual grade for a test
 * - GET /:id/ai-grade       → Get AI-generated grading for a test
 *
 * @module routes/teacherTest.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getStudentTests,
	getStudentTest,
	gradeTest,
	getTeacherGrades,
} = require("../controllers/teacherTest.controller");
const { getTestAIGrade } = require("../controllers/teacherAI.controller");

// Protect all routes
router.use(protect);
router.use(authorize("teacher", "admin"));

// Get all grades for the teacher (assigned + scheduled)
router.get("/grades", getTeacherGrades);

// Get all student tests for the teacher
router.get("/", getStudentTests);

// Get a specific student test
router.get("/:id", getStudentTest);

// Grade a student test
router.put("/:id/grade", gradeTest);

// Get AI grading for a test
router.get("/:id/ai-grade", getTestAIGrade);

module.exports = router;

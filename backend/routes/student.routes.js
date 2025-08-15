/**
 * Student Routing Module
 *
 * This module defines API routes for accessing and managing student-related data,
 * including fetching individual student profiles, exam results, statistics, and filtering by grade.
 *
 * Features:
 * - Secured with authentication (`protect`)
 * - Role-based access using `authorize(...)`
 *
 * Middleware:
 * - protect: Requires the user to be authenticated
 * - authorize(...roles): Limits access to users with specified roles
 *
 * Routes:
 * - GET    /:id                 → Admin/Teacher: Get student profile by ID
 * - POST   /:id/exam-results    → Teacher only: Update exam results for a student
 * - GET    /grade/:gradeId      → Admin/Teacher: Get all students in a specific grade
 * - GET    /:id/stats           → Admin/Teacher/Student: Get statistics for a specific student
 *
 * @module routes/student.routes
 */

const express = require("express");
const router = express.Router();
const {
	getStudent,
	updateExamResults,
	getStudentsByGrade,
	getStudentStats,
} = require("../controllers/student.controller");
const { protect, authorize } = require("../middleware/auth");

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /:id
 * @desc    Get detailed information about a specific student
 * @access  Private (Admin, Teacher)
 */
router.route("/:id").get(authorize("admin", "teacher"), getStudent);

/**
 * @route   POST /:id/exam-results
 * @desc    Update exam results for a specific student
 * @access  Private (Teacher only)
 */
router.route("/:id/exam-results").post(authorize("teacher"), updateExamResults);

/**
 * @route   GET /grade/:gradeId
 * @desc    Get all students belonging to a specific grade
 * @access  Private (Admin, Teacher)
 */
router
	.route("/grade/:gradeId")
	.get(authorize("admin", "teacher"), getStudentsByGrade);

/**
 * @route   GET /:id/stats
 * @desc    Get performance statistics for a specific student
 * @access  Private (Admin, Teacher, Student)
 */
router
	.route("/:id/stats")
	.get(authorize("admin", "teacher", "student"), getStudentStats);

module.exports = router;

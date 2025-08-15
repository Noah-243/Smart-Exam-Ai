/**
 * Grade Routing Module
 *
 * This module defines API routes for managing grade-related operations
 * such as fetching grades, managing students in grades, and performing
 * administrative operations like creating or deleting grades.
 *
 * Features:
 * - Public access to list of grades
 * - Protected routes for viewing/managing students in a grade
 * - Admin-only operations for creating, updating, and deleting grades
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("admin"): Ensures the user has admin privileges
 *
 * Routes:
 * - GET    /                      → Public: Get list of all grades
 * - GET    /student-counts       → Admin only: Get number of students per grade
 * - GET    /:id/students         → Authenticated: Get students in a specific grade
 * - POST   /:id/students         → Admin only: Add a student to a grade
 * - POST   /transfer-student     → Admin only: Transfer a student between grades
 * - POST   /                     → Admin only: Create a new grade
 * - PUT    /:id                  → Admin only: Update a grade
 * - DELETE /:id                  → Admin only: Delete a grade
 *
 * @module routes/grade.routes
 */


const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const gradeService = require("../services/grade.service");
const {
	getGrades,
	getGradeWithStudents,
	addStudentToGrade,
	transferStudent,
	getStudentCountsByGrade,
} = require("../controllers/grade.controller");

// Public routes
router.get("/", getGrades);

// Special routes that must come before /:id routes
router.get(
	"/student-counts",
	protect,
	authorize("admin"),
	getStudentCountsByGrade
);

// Protected routes
router.get("/:id/students", protect, getGradeWithStudents);
router.post("/:id/students", protect, authorize("admin"), addStudentToGrade);
router.post("/transfer-student", protect, authorize("admin"), transferStudent);

// Protected admin routes
router.use(protect);
router.use(authorize("admin"));

router.post("/", async (req, res, next) => {
	try {
		const grade = await gradeService.createGrade(req.body);
		res.status(201).json({
			success: true,
			data: grade,
		});
	} catch (err) {
		next(err);
	}
});

router.put("/:id", async (req, res, next) => {
	try {
		const grade = await gradeService.updateGrade(req.params.id, req.body);
		res.status(200).json({
			success: true,
			data: grade,
		});
	} catch (err) {
		next(err);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		await gradeService.deleteGrade(req.params.id);
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;

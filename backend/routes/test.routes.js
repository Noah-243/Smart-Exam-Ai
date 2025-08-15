/**
 * Test Management Routing Module
 *
 * This module defines routes for managing tests in the system. It includes endpoints
 * for creating, retrieving, updating, and deleting tests, as well as AI-assisted test generation.
 *
 * Features:
 * - Students can fetch tests assigned to their grade
 * - Teachers and Admins can create, update, delete, and manage tests
 * - AI routes allow dynamic generation of tests based on question banks
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("student"): Restricts access to students only
 * - authorize("teacher", "admin"): Restricts access to teachers and admins
 *
 * Routes:
 * - GET    /grade/:gradeId                      → Student: Get all tests for a specific grade
 * - GET    /                                    → Teacher/Admin: Get all tests
 * - POST   /                                    → Teacher/Admin: Create a new test
 * - GET    /ai/questions/:gradeId/:subjectId    → Teacher/Admin: Get AI-eligible questions
 * - POST   /ai/generate                         → Teacher/Admin: Generate test using AI
 * - POST   /ai/create                           → Teacher/Admin: Create test from AI-generated structure
 * - GET    /:id                                 → Teacher/Admin: Get a specific test by ID
 * - PUT    /:id                                 → Teacher/Admin: Update a specific test
 * - DELETE /:id                                 → Teacher/Admin: Delete a specific test
 * - PUT    /:id/publish                         → Teacher/Admin: Mark a test as published
 * - PUT    /:id/unpublish                       → Teacher/Admin: Mark a test as unpublished
 *
 * @module routes/test.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getTests,
	getTest,
	createTest,
	updateTest,
	deleteTest,
	getQuestionsForAI,
	generateAITest,
	createAITest,
} = require("../controllers/test.controller");

// Protected routes
router.use(protect);

// Student routes
router.get("/grade/:gradeId", authorize("student"), async (req, res, next) => {
	try {
		const tests = await testService.getTestsByGrade(req.params.gradeId);
		res.status(200).json({
			success: true,
			data: tests,
		});
	} catch (err) {
		next(err);
	}
});

// Teacher and admin routes
router.use(authorize("teacher", "admin"));

router.route("/").get(getTests).post(createTest);

// AI-specific routes
router.get("/ai/questions/:gradeId/:subjectId", getQuestionsForAI);
router.post("/ai/generate", generateAITest);
router.post("/ai/create", createAITest);

router.route("/:id").get(getTest).put(updateTest).delete(deleteTest);

// Publish a test
router.put("/:id/publish", async (req, res, next) => {
	try {
		const test = await testService.publishTest(req.params.id);
		res.status(200).json({
			success: true,
			data: test,
		});
	} catch (err) {
		next(err);
	}
});

// Unpublish a test
router.put("/:id/unpublish", async (req, res, next) => {
	try {
		const test = await testService.unpublishTest(req.params.id);
		res.status(200).json({
			success: true,
			data: test,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;

/**
 * Question Routing Module
 *
 * This module defines routes for managing question-related operations.
 *
 * Features:
 * - Public access to view all questions with pagination
 * - Filtering questions by grade and subject
 * - Retrieve a single question by ID
 * - Create, update, and delete questions (for teachers and admins only)
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("teacher", "admin"): Grants access to teachers and admins
 *
 * Routes:
 * - GET    /             → Public: Get all questions with pagination
 * - GET    /filter       → Public: Filter questions by grades and subjects
 * - GET    /:id          → Public: Get a question by ID
 * - POST   /             → Teacher/Admin: Create a new question
 * - PUT    /:id          → Teacher/Admin: Update a question
 * - DELETE /:id          → Teacher/Admin: Delete a question
 *
 * @module routes/question.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const questionService = require("../services/question.service");

// =========================================================
// Public Routes
// =========================================================

/**
 * @route   GET /
 * @desc    Get all questions with pagination
 * @access  Public
 */
router.get("/", async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		const result = await questionService.getQuestions({}, page, limit);
		res.status(200).json({
			success: true,
			data: result.questions,
			pagination: result.pagination,
		});
	} catch (err) {
		next(err);
	}
});

/**
 * @route   GET /filter
 * @desc    Filter questions by grades and subjects
 * @access  Public
 */
router.get("/filter", async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		const grades = req.query.grades
			? Array.isArray(req.query.grades)
				? req.query.grades
				: [req.query.grades]
			: [];

		const subjects = req.query.subjects
			? Array.isArray(req.query.subjects)
				? req.query.subjects
				: [req.query.subjects]
			: [];

		const filters = { grades, subjects };
		const result = await questionService.getQuestionsByFilters(
			filters,
			page,
			limit
		);

		res.status(200).json({
			success: true,
			data: result.questions,
			pagination: result.pagination,
		});
	} catch (err) {
		next(err);
	}
});

/**
 * @route   GET /:id
 * @desc    Get a specific question by ID
 * @access  Public
 */
router.get("/:id", async (req, res, next) => {
	try {
		const question = await questionService.getQuestionById(req.params.id);
		res.status(200).json({
			success: true,
			data: question,
		});
	} catch (err) {
		next(err);
	}
});

// =========================================================
// Protected Routes (Requires Authentication & Role Check)
// =========================================================

router.use(protect);
router.use(authorize("teacher", "admin"));

/**
 * @route   POST /
 * @desc    Create a new question
 * @access  Teacher/Admin
 */
router.post("/", async (req, res, next) => {
	try {
		console.log("Received question data:", req.body);
		const question = await questionService.createQuestion(req.body);
		res.status(201).json({
			success: true,
			data: question,
		});
	} catch (err) {
		console.error("Error creating question:", err);
		next(err);
	}
});

/**
 * @route   PUT /:id
 * @desc    Update an existing question
 * @access  Teacher/Admin
 */
router.put("/:id", async (req, res, next) => {
	try {
		const question = await questionService.updateQuestion(
			req.params.id,
			req.body
		);
		res.status(200).json({
			success: true,
			data: question,
		});
	} catch (err) {
		next(err);
	}
});

/**
 * @route   DELETE /:id
 * @desc    Delete a question by ID
 * @access  Teacher/Admin
 */
router.delete("/:id", async (req, res, next) => {
	try {
		await questionService.deleteQuestion(req.params.id);
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;

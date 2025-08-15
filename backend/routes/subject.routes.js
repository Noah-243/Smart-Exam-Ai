/**
 * Subject Routing Module
 *
 * This Express router manages CRUD operations for school subjects.
 * It provides public read-only access to subjects and restricts 
 * create, update, and delete operations to admin users only.
 *
 * Features:
 * - Public access to get all subjects or a specific subject
 * - Admin-only routes to create, update, or delete subjects
 *
 * Middleware:
 * - protect: Ensures the request comes from an authenticated user
 * - authorize("admin"): Grants access only to users with the admin role
 *
 * Routes:
 * - GET    /               → Public: Get all subjects
 * - GET    /:id            → Public: Get subject by ID
 * - POST   /               → Admin only: Create a new subject
 * - PUT    /:id            → Admin only: Update an existing subject
 * - DELETE /:id            → Admin only: Delete a subject
 *
 * @module routes/subject.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const subjectService = require("../services/subject.service");

// ======================
// Public routes
// ======================

/**
 * @route   GET /
 * @desc    Retrieve all subjects
 * @access  Public
 */
router.get("/", async (req, res, next) => {
	try {
		const subjects = await subjectService.getAllSubjects();
		res.status(200).json({
			success: true,
			data: subjects,
		});
	} catch (err) {
		next(err);
	}
});

/**
 * @route   GET /:id
 * @desc    Retrieve a specific subject by ID
 * @access  Public
 */
router.get("/:id", async (req, res, next) => {
	try {
		const subject = await subjectService.getSubjectById(req.params.id);
		res.status(200).json({
			success: true,
			data: subject,
		});
	} catch (err) {
		next(err);
	}
});

// ======================
// Protected Admin Routes
// ======================

router.use(protect);
router.use(authorize("admin"));

/**
 * @route   POST /
 * @desc    Create a new subject
 * @access  Private (Admin only)
 */
router.post("/", async (req, res, next) => {
	try {
		const subject = await subjectService.createSubject(req.body);
		res.status(201).json({
			success: true,
			data: subject,
		});
	} catch (err) {
		next(err);
	}
});

/**
 * @route   PUT /:id
 * @desc    Update an existing subject
 * @access  Private (Admin only)
 */
router.put("/:id", async (req, res, next) => {
	try {
		const subject = await subjectService.updateSubject(req.params.id, req.body);
		res.status(200).json({
			success: true,
			data: subject,
		});
	} catch (err) {
		next(err);
	}
});

/**
 * @route   DELETE /:id
 * @desc    Delete a subject
 * @access  Private (Admin only)
 */
router.delete("/:id", async (req, res, next) => {
	try {
		await subjectService.deleteSubject(req.params.id);
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;

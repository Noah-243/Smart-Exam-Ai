/**
 * Question Grading Routes
 *
 * This router handles the grading of individual answers to specific questions by teachers or admins.
 *
 * Features:
 * - Allows teachers/admins to submit a grade for a specific student's answer to a question
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("teacher", "admin"): Allows only teachers and admins to access this route
 *
 * Routes:
 * - POST /:id/grade → Grade a specific answer by question ID
 *
 * @module routes/questionGrading.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { gradeQuestionAnswer } = require("../controllers/teacher.controller");

// Protect all routes
router.use(protect);
router.use(authorize("teacher", "admin"));

// Grade an answer by question ID
router.post("/:id/grade", gradeQuestionAnswer);

module.exports = router;

/**
 * Teacher Answer Grading Routes
 *
 * This Express router handles routes related to grading student answers,
 * including both manual grading and AI-generated grading assistance.
 *
 * Features:
 * - Provides AI-generated grading feedback for a specific answer
 * - Allows a teacher or admin to manually grade a student's answer
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize("teacher", "admin"): Restricts access to teachers and admins only
 *
 * Routes:
 * - GET  /:id/ai-grade  → Get AI-generated grade suggestion for an answer
 * - POST /:id/grade     → Manually grade an answer
 *
 * @module routes/teacherAI.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getAnswerAIGrade } = require("../controllers/teacherAI.controller");
const { gradeAnswer } = require("../controllers/teacher.controller");

// Protect all routes
router.use(protect);
router.use(authorize("teacher", "admin"));

// Get AI grading for an answer
router.get("/:id/ai-grade", getAnswerAIGrade);

// Grade an answer
router.post("/:id/grade", gradeAnswer);

module.exports = router;

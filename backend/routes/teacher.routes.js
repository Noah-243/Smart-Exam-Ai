/**
 * Teacher Routing Module
 *
 * This Express router handles API routes for managing teacher profiles,
 * teaching assignments, and specializations.
 *
 * Features:
 * - Authenticated teachers can:
 *   - View their profile
 *   - Update their teaching assignments
 *   - Update their subject specializations
 * - Admin users can:
 *   - View any teacher's profile by ID
 *   - Update teaching assignments or specializations of any teacher
 *   - Fetch teachers filtered by subject or grade
 *
 * Middleware:
 * - protect: Ensures the user is authenticated
 * - authorize(...roles): Restricts access to users with specific roles (e.g., admin, teacher)
 *
 * Routes:
 * - GET    /me                     → Authenticated teacher/admin: Get own profile
 * - PUT    /me/assignments        → Authenticated teacher/admin: Update own assignments
 * - PUT    /me/specializations    → Authenticated teacher/admin: Update own specializations
 * - GET    /:id                   → Admin only: Get a teacher profile by ID
 * - PUT    /:id/assignments       → Admin/teacher: Update teacher's assignments
 * - PUT    /:id/specializations   → Admin/teacher: Update teacher's specializations
 * - GET    /subject/:subjectId    → Admin only: Get teachers by subject
 * - GET    /grade/:gradeId        → Admin only: Get teachers by grade
 *
 * @module routes/teacher.routes
 */

const express = require("express");
const router = express.Router();
const {
	getTeacher,
	updateTeachingAssignments,
	updateSpecializations,
	getTeachersBySubject,
	getTeachersByGrade,
} = require("../controllers/teacher.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Route for teachers to get their own profile
router.route("/me").get(authorize("teacher", "admin"), getTeacher);

// Routes for teachers to update their own assignments and specializations
router
	.route("/me/assignments")
	.put(authorize("teacher", "admin"), updateTeachingAssignments);

router
	.route("/me/specializations")
	.put(authorize("teacher", "admin"), updateSpecializations);

// Admin-only route to get any teacher by ID
router.route("/:id").get(authorize("admin"), getTeacher);

router
	.route("/:id/assignments")
	.put(authorize("admin", "teacher"), updateTeachingAssignments);

router
	.route("/:id/specializations")
	.put(authorize("admin", "teacher"), updateSpecializations);

router
	.route("/subject/:subjectId")
	.get(authorize("admin"), getTeachersBySubject);

router.route("/grade/:gradeId").get(authorize("admin"), getTeachersByGrade);

module.exports = router;

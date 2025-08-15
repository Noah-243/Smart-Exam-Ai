/**
 * User Management Routing Module
 *
 * This Express router handles administrative operations related to user management.
 * It allows administrators to list, create, update, and delete users in the system.
 *
 * Access Control:
 * - All routes are protected and limited to users with the "admin" role.
 *
 * Middleware:
 * - protect: Verifies that the request is authenticated.
 * - authorize("admin"): Ensures that only administrators can access these routes.
 *
 * Routes:
 * - GET    /           → Get a list of all users
 * - GET    /:id        → Get details of a specific user by ID
 * - PUT    /:id        → Update a specific user's information
 * - DELETE /:id        → Delete a user by ID
 * - POST   /           → Create a new user with validation by role
 *
 * Validations:
 * - Requires name, email, password, and role fields
 * - Additional required fields based on role:
 *   - Students require a grade
 *   - Teachers require a specialization
 *
 * @module routes/user.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const userService = require("../services/user.service");
const { ErrorResponse } = require("../utils/errorResponse");

// Protected admin routes
router.use(protect);
router.use(authorize("admin"));

router.get("/", async (req, res, next) => {
	try {
		const users = await userService.getUsers();
		res.status(200).json({
			success: true,
			data: users,
		});
	} catch (err) {
		next(err);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const user = await userService.getUserById(req.params.id);
		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (err) {
		next(err);
	}
});

router.put("/:id", async (req, res, next) => {
	try {
		const user = await userService.updateUser(req.params.id, req.body);
		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (err) {
		next(err);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		await userService.deleteUser(req.params.id);
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (err) {
		next(err);
	}
});

router.post("/", async (req, res, next) => {
	try {
		// Add validation for required fields
		const { name, email, password, role } = req.body;
		if (!name || !email || !password || !role) {
			return next(new ErrorResponse("Please provide all required fields", 400));
		}

		// Role-specific validation
		if (role === "student" && !req.body.grade) {
			return next(
				new ErrorResponse("Grade is required for student accounts", 400)
			);
		}

		if (role === "teacher" && !req.body.specialization) {
			return next(
				new ErrorResponse(
					"Specialization is required for teacher accounts",
					400
				)
			);
		}

		const user = await userService.createUser(req.body);

		// Remove password from response
		user.password = undefined;

		res.status(201).json({
			success: true,
			data: user,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;

/**
 * Student Dashboard Routing Module
 *
 * This module defines API routes for students to interact with their dashboard, including:
 * - Viewing upcoming and past tests
 * - Accessing performance statistics
 * - Submitting tests
 * - Fetching graded and available tests
 * - Admin/Teacher routes for student performance stats
 *
 * Features:
 * - Middleware protection for all routes (`protect`)
 * - Role-based access control using `authorize(...)`
 * - Diagnostic route for developers to inspect data state
 *
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize(...roles): Ensures user has the appropriate role (student, admin, teacher)
 *
 * Routes:
 * - GET    /diagnostic                    → Public diagnostic route
 * - GET    /                             → Student: Dashboard data
 * - GET    /upcoming-tests               → Student: Upcoming tests
 * - GET    /performance                  → Student: Own performance stats
 * - GET    /available-test               → Student: Get next available test
 * - GET    /available-tests              → Student: Get all available tests
 * - GET    /past-tests                   → Student: Get past completed tests
 * - GET    /test-details/:testId         → Student: Get detailed info about specific test
 * - POST   /submit-test                  → Student: Submit answers for a test
 * - POST   /generate-sample-data         → Student: (Testing/dev) Generate mock data
 * - GET    /admin/performance/:id        → Admin/Teacher: View performance for any student
 * - GET    /graded-tests                 → Student: All graded tests
 * - GET    /graded-test/:id              → Student: View a specific graded test
 * - GET    /grade-tests                  → Student: Fallback - all tests for student's grade
 *
 * @module routes/studentDashboard.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getDashboardData,
	getUpcomingTests,
	getPerformanceStats,
	getAvailableTest,
	getAllAvailableTests,
	getPastTests,
	getTestDetails,
	submitTest,
	generateSampleData,
	getStudentPerformance,
} = require("../controllers/studentDashboard.controller");
const { ErrorResponse } = require("../utils/errorResponse");
const StudentTest = require("../models/StudentTest");
const mongoose = require("mongoose");

// Add a diagnostic handler for checking data
router.get("/diagnostic", async (req, res) => {
	try {
		const Subject = require("../models/Subject");
		const StudentTest = require("../models/StudentTest");
		const Test = require("../models/Test");

		// Get all subjects
		const subjects = await Subject.find({}).select("name");

		// Get some example student tests
		const studentTests = await StudentTest.find({ status: "completed" })
			.limit(10)
			.populate({
				path: "scheduledTest",
				populate: {
					path: "test",
					populate: {
						path: "subject",
						select: "name",
					},
				},
			});

		// Count tests by subject
		const testsBySubject = {};
		studentTests.forEach((test) => {
			const subjectName = test.scheduledTest?.test?.subject?.name || "Unknown";
			if (!testsBySubject[subjectName]) {
				testsBySubject[subjectName] = 0;
			}
			testsBySubject[subjectName]++;
		});

		res.json({
			subjects: subjects.map((s) => s.name),
			testsBySubject,
			sampleTests: studentTests.map((test) => ({
				id: test._id,
				subject: test.scheduledTest?.test?.subject?.name || "Unknown",
				score: test.score,
			})),
		});
	} catch (error) {
		console.error("Diagnostic error:", error);
		res.status(500).json({ error: error.message });
	}
});

// Protect all routes
router.use(protect);

// Student-only routes
router.get("/", authorize("student"), getDashboardData);
router.get("/upcoming-tests", authorize("student"), getUpcomingTests);
router.get("/performance", authorize("student"), getStudentPerformance);
router.get("/available-test", authorize("student"), getAvailableTest);
router.get("/available-tests", authorize("student"), getAllAvailableTests);
router.get("/past-tests", authorize("student"), getPastTests);
router.get("/test-details/:testId", authorize("student"), getTestDetails);
router.post("/submit-test", authorize("student"), submitTest);
router.post("/generate-sample-data", authorize("student"), generateSampleData);

// Admin/teacher routes - note these need different authorization
router.get(
	"/admin/performance/:id",
	authorize("admin", "teacher"),
	getPerformanceStats
);

// Get all graded tests for the student
router.get("/graded-tests", authorize("student"), async (req, res, next) => {
	try {
		const studentId = req.user.id;

		const gradedTests = await StudentTest.find({
			student: studentId,
			status: "graded",
		})
			.populate({
				path: "scheduledTest",
				populate: {
					path: "test",
					select: "title subject grade",
				},
			})
			.select("score submittedAt gradedAt feedback")
			.sort("-gradedAt");

		res.status(200).json({
			success: true,
			count: gradedTests.length,
			data: gradedTests,
		});
	} catch (error) {
		next(error);
	}
});

// Get a specific graded test
router.get("/graded-test/:id", authorize("student"), async (req, res, next) => {
	try {
		const studentId = req.user.id;
		const testId = req.params.id;

		const gradedTest = await StudentTest.findOne({
			_id: testId,
			student: studentId,
			status: "graded",
		}).populate({
			path: "scheduledTest",
			populate: {
				path: "test",
				populate: {
					path: "questions.question",
					select: "text options type difficulty",
				},
			},
		});

		if (!gradedTest) {
			return next(
				new ErrorResponse("Graded test not found or not yet graded", 404)
			);
		}

		res.status(200).json({
			success: true,
			data: gradedTest,
		});
	} catch (error) {
		next(error);
	}
});

// Get all tests for the student's grade (a fallback for available-test)
router.get("/grade-tests", authorize("student"), async (req, res, next) => {
	try {
		console.log("Fetching all grade tests as fallback");
		const userId = req.user.id;
		const student = await mongoose.model("Student").findOne({ user: userId });

		if (!student) {
			return next(new ErrorResponse("Student profile not found", 404));
		}

		console.log("Found student grade:", student.grade);

		// Get all tests for this grade
		const scheduledTests = await mongoose
			.model("ScheduledTest")
			.find({ grade: student.grade })
			.populate({
				path: "test",
				select: "title subject questions duration",
				populate: {
					path: "subject",
					select: "name",
				},
			})
			.populate("grade", "name level")
			.populate("teacher", "name");

		console.log(`Found ${scheduledTests.length} tests for grade`);

		// Check which ones are currently active
		const now = new Date();
		const activeTests = scheduledTests.filter((test) => {
			const endTime = new Date(
				test.scheduledAt.getTime() + test.duration * 60000
			);
			return (
				test.status === "scheduled" && test.scheduledAt <= now && endTime >= now
			);
		});

		console.log(`Found ${activeTests.length} active tests`);

		res.status(200).json({
			success: true,
			data: scheduledTests,
		});
	} catch (error) {
		console.error("Error in grade-tests:", error);
		next(error);
	}
});

module.exports = router;

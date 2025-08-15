/**
 * Teacher Dashboard Controller
 * ----------------------------
 * Provides dashboard data to teachers and admins.
 * Includes:
 * - Overview with upcoming tests, assignments, and recent results
 * - Only upcoming tests
 * - Only test results
 *
 * Admins receive either empty or generalized data.
 */

const asyncHandler = require("../middleware/async");
const Teacher = require("../models/Teacher");
const scheduledTestService = require("../services/scheduledTest.service");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Get teacher dashboard overview data
 * @route   GET /api/teacher-dashboard
 * @access  Private (Teacher, Admin)
 */
exports.getDashboardData = asyncHandler(async (req, res, next) => {
	const isAdmin = req.user.role === "admin";

	if (isAdmin) {
		// Optionally return summary for admin
		return res.status(200).json({
			success: true,
			data: {
				teacher: {
					specialization: null,
					teachingAssignments: [],
					upcomingTests: [],
					recentResults: [],
				},
			},
		});
	}

	// Proceed for teacher users
	const teacherId = req.user.profileId;

	const teacher = await Teacher.findById(teacherId)
		.populate("user", "name email")
		.populate({
			path: "teachingAssignments",
			populate: [
				{ path: "subject", select: "name" },
				{ path: "grades", select: "name level" },
			],
		});

	if (!teacher) {
		return next(new ErrorResponse("Teacher profile not found", 404));
	}

	// Collect all grade IDs from teaching assignments
	const gradeIds = teacher.teachingAssignments
		.flatMap((ta) => ta.grades)
		.map((grade) => grade._id);

	const upcomingTests = await scheduledTestService.getUpcomingTestsByGrades(gradeIds);
	const recentResults = await scheduledTestService.getRecentTestResults(gradeIds);

	res.status(200).json({
		success: true,
		data: {
			teacher: {
				specialization: teacher.specialization,
				teachingAssignments: teacher.teachingAssignments,
				upcomingTests,
				recentResults,
			},
		},
	});
});

/**
 * @desc    Get upcoming tests for the teacher’s assigned grades
 * @route   GET /api/teacher-dashboard/upcoming-tests
 * @access  Private (Teacher, Admin)
 */
exports.getUpcomingTests = asyncHandler(async (req, res, next) => {
	const isAdmin = req.user.role === "admin";

	if (isAdmin) {
		return res.status(200).json({
			success: true,
			data: [],
		});
	}

	const teacherId = req.user.profileId;
	const teacher = await Teacher.findById(teacherId).populate(
		"teachingAssignments.grades",
		"name level"
	);

	if (!teacher) {
		return next(new ErrorResponse("Teacher profile not found", 404));
	}

	const gradeIds = teacher.teachingAssignments
		.flatMap((ta) => ta.grades)
		.map((grade) => grade._id);

	const upcomingTests = await scheduledTestService.getUpcomingTestsByGrades(gradeIds);

	res.status(200).json({
		success: true,
		data: upcomingTests,
	});
});

/**
 * @desc    Get past test results for the teacher’s assigned grades
 * @route   GET /api/teacher-dashboard/test-results
 * @access  Private (Teacher, Admin)
 */
exports.getTestResults = asyncHandler(async (req, res, next) => {
	const isAdmin = req.user.role === "admin";

	if (isAdmin) {
		return res.status(200).json({
			success: true,
			data: [],
		});
	}

	const teacherId = req.user.profileId;
	const teacher = await Teacher.findById(teacherId).populate(
		"teachingAssignments.grades",
		"name level"
	);

	if (!teacher) {
		return next(new ErrorResponse("Teacher profile not found", 404));
	}

	const gradeIds = teacher.teachingAssignments
		.flatMap((ta) => ta.grades)
		.map((grade) => grade._id);

	const results = await scheduledTestService.getTestResults(gradeIds);

	res.status(200).json({
		success: true,
		data: results,
	});
});

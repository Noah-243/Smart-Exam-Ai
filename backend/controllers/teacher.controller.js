/**
 * Teacher Controller
 * -------------------
 * Provides routes and logic for:
 * - Fetching teacher profile(s)
 * - Updating teaching assignments and specializations
 * - Retrieving teachers by subject or grade
 * - Grading answers and handling grading logic
 */

const teacherService = require("../services/teacher.service");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Answer = require("../models/Answer");
const Teacher = require("../models/Teacher");

/**
 * @desc    Get a specific teacher (or current user if /me)
 * @route   GET /api/teachers/:id or /api/teachers/me
 * @access  Private
 */
exports.getTeacher = asyncHandler(async (req, res) => {
	const teacherId =
		req.params.id === undefined
			? req.user.profileId?.toString()
			: req.params.id;

	if (!teacherId) {
		return res.status(400).json({
			success: false,
			error: "Teacher ID not found",
		});
	}

	const teacher = await teacherService.getTeacherById(teacherId);
	res.status(200).json({
		success: true,
		data: teacher,
	});
});

/**
 * @desc    Update the teaching assignments for a teacher
 * @route   PUT /api/teachers/:id/assignments or /api/teachers/me/assignments
 * @access  Private
 */
exports.updateTeachingAssignments = asyncHandler(async (req, res) => {
	const teacherId =
		req.params.id === undefined
			? req.user.profileId?.toString()
			: req.params.id;

	if (!teacherId) {
		return res.status(400).json({
			success: false,
			error: "Teacher ID not found",
		});
	}

	const teacher = await teacherService.updateTeachingAssignments(
		teacherId,
		req.body
	);

	res.status(200).json({
		success: true,
		data: teacher,
	});
});

/**
 * @desc    Update the specializations of a teacher
 * @route   PUT /api/teachers/:id/specializations or /api/teachers/me/specializations
 * @access  Private
 */
exports.updateSpecializations = asyncHandler(async (req, res, next) => {
	const teacherId =
		req.params.id === undefined
			? req.user.profileId?.toString()
			: req.params.id;
	const { specializations } = req.body;

	if (!teacherId) {
		return res.status(400).json({
			success: false,
			error: "Teacher ID not found",
		});
	}

	if (
		!specializations ||
		!Array.isArray(specializations) ||
		specializations.length === 0
	) {
		return next(
			new ErrorResponse("At least one specialization is required", 400)
		);
	}

	try {
		const teacher = await teacherService.updateSpecializations(
			teacherId,
			specializations
		);

		res.status(200).json({
			success: true,
			data: teacher,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @desc    Get teachers by subject ID
 * @route   GET /api/teachers/by-subject/:subjectId
 * @access  Private
 */
exports.getTeachersBySubject = asyncHandler(async (req, res) => {
	const teachers = await teacherService.getTeachersBySubject(
		req.params.subjectId
	);
	res.status(200).json({
		success: true,
		data: teachers,
	});
});

/**
 * @desc    Get teachers by grade ID
 * @route   GET /api/teachers/by-grade/:gradeId
 * @access  Private
 */
exports.getTeachersByGrade = asyncHandler(async (req, res) => {
	const teachers = await teacherService.getTeachersByGrade(req.params.gradeId);
	res.status(200).json({
		success: true,
		data: teachers,
	});
});

/**
 * @desc    Grade a specific answer by answer ID
 * @route   POST /api/teacher/answers/:id/grade
 * @access  Private (Teacher)
 */
exports.gradeAnswer = asyncHandler(async (req, res) => {
	const answerId = req.params.id;

	if (!answerId || answerId === "undefined" || answerId === undefined) {
		return next(new ErrorResponse(`Invalid answer ID: ${answerId}`, 400));
	}

	const { points, feedback } = req.body;

	if (points === undefined || isNaN(points)) {
		return next(
			new ErrorResponse("Points are required and must be a number", 400)
		);
	}

	try {
		let answer = await Answer.findById(answerId);

		if (!answer) {
			return next(
				new ErrorResponse(`Answer not found with id ${answerId}`, 404)
			);
		}

		const originalPoints = points;

		// Update grading information
		answer.points = Math.min(Number(points), 10);
		answer.feedback = feedback || "";
		answer.gradedAt = Date.now();
		answer.gradedBy = req.user.id;
		answer.isCorrect = Number(points) > 0;
		answer.graded = true;

		await answer.save();

		res.status(200).json({
			success: true,
			data: {
				...answer.toObject(),
				originalPoints,
			},
		});
	} catch (error) {
		return next(
			new ErrorResponse(`Error grading answer: ${error.message}`, 500)
		);
	}
});

/**
 * @desc    Grade an answer by question ID (used when answer ID is not available)
 * @route   POST /api/teacher/questions/:id/grade?testId={optional}
 * @access  Private (Teacher)
 */
exports.gradeQuestionAnswer = asyncHandler(async (req, res, next) => {
	const questionId = req.params.id;
	const { testId } = req.query;
	const { points, feedback } = req.body;

	if (!questionId || questionId === "undefined") {
		return next(new ErrorResponse(`Invalid question ID: ${questionId}`, 400));
	}

	if (points === undefined || isNaN(points)) {
		return next(
			new ErrorResponse("Points are required and must be a number", 400)
		);
	}

	try {
		const originalPoints = points;
		let answer = await Answer.findOne({ question: questionId });

		// Try alternatives if not found
		if (!answer) {
			const mongoose = require("mongoose");
			if (mongoose.Types.ObjectId.isValid(questionId)) {
				answer = await Answer.findOne({
					question: new mongoose.Types.ObjectId(questionId),
				});
			}
			if (!answer) {
				answer = await Answer.findOne({ questionId: questionId });
			}
		}

		// Create answer if not found but testId is available
		if (!answer && testId) {
			const StudentTest = require("../models/StudentTest");
			const studentTest = await StudentTest.findById(testId);

			if (!studentTest) {
				return res.status(200).json({
					success: true,
					message: "No answer record found and could not create one",
					data: {
						question: questionId,
						points,
						feedback: feedback || "",
						createdAt: new Date(),
						originalPoints,
					},
				});
			}

			answer = new Answer({
				question: questionId,
				points: Math.min(points, 10),
				feedback: feedback ? feedback.trim() : "",
				gradedAt: Date.now(),
				gradedBy: req.user.id,
				studentTest: testId,
				student: studentTest.student,
				answer: "",
				isCorrect: points > 0,
				graded: true,
			});

			await answer.save();
		} else if (!answer) {
			// If no answer and no testId, return response without DB write
			return res.status(200).json({
				success: true,
				message: "No answer record found, but grade processed for display",
				data: {
					question: questionId,
					points,
					feedback: feedback || "",
					createdAt: new Date(),
					originalPoints,
				},
			});
		} else {
			// Update existing answer
			answer.points = Math.min(Number(points), 10);
			answer.feedback = feedback ? feedback.trim() : "";
			answer.gradedAt = Date.now();
			answer.gradedBy = req.user.id;
			answer.isCorrect = Number(points) > 0;
			answer.graded = true;

			await answer.save();
		}

		res.status(200).json({
			success: true,
			data: {
				...answer.toObject(),
				originalPoints,
			},
		});
	} catch (error) {
		return next(
			new ErrorResponse(`Error grading answer: ${error.message}`, 500)
		);
	}
});

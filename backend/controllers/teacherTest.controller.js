/**
 * Teacher Tests Controller
 * -------------------------
 * Handles teacher operations related to student tests, including:
 * - Viewing all submitted tests for the teacher's scheduled exams
 * - Accessing individual student tests
 * - Grading tests and updating scores
 * - Fetching all grades the teacher is connected to
 */

const StudentTest = require("../models/StudentTest");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");

/**
 * @desc    Get all student tests related to the teacher’s scheduled tests
 * @route   GET /api/teacher/tests
 * @access  Private (Teacher)
 */
exports.getStudentTests = asyncHandler(async (req, res, next) => {
	const teacherId = req.user.id;

	const scheduledTests = await mongoose
		.model("ScheduledTest")
		.find({ teacher: teacherId })
		.select("_id");

	const scheduledTestIds = scheduledTests.map((test) => test._id);

	const studentTests = await StudentTest.find({
		scheduledTest: { $in: scheduledTestIds },
	})
		.populate({
			path: "scheduledTest",
			populate: [
				{
					path: "test",
					select: "title subject",
					populate: { path: "subject", select: "name" },
				},
				{ path: "grade", select: "name level" },
			],
		})
		.populate({ path: "student", select: "name email" })
		.sort("-submittedAt");

	res.status(200).json({
		success: true,
		count: studentTests.length,
		data: studentTests,
	});
});

/**
 * @desc    Get details of a specific student test for grading
 * @route   GET /api/teacher/tests/:id
 * @access  Private (Teacher)
 */
exports.getStudentTest = asyncHandler(async (req, res, next) => {
	const testId = req.params.id;
	const teacherId = req.user.id;

	const studentTest = await StudentTest.findById(testId)
		.populate({
			path: "scheduledTest",
			populate: [
				{
					path: "test",
					select: "title subject grade teacher questions",
					populate: [
						{ path: "subject", select: "name" },
						{
							path: "questions.question",
							select: "body text options type difficulty correctAnswer answers",
						},
					],
				},
				{ path: "teacher", select: "name email" },
			],
		})
		.populate({ path: "student", select: "name email grade" });

	if (!studentTest) {
		return next(new ErrorResponse(`No student test found with id ${testId}`, 404));
	}

	// Ensure teacher owns the test
	if (
		!studentTest.scheduledTest ||
		studentTest.scheduledTest.teacher._id.toString() !== teacherId
	) {
		return next(new ErrorResponse(`Not authorized to access this test`, 403));
	}

	res.status(200).json({
		success: true,
		data: studentTest,
	});
});

/**
 * @desc    Grade a student test manually
 * @route   PUT /api/teacher/tests/:id/grade
 * @access  Private (Teacher)
 */
exports.gradeTest = asyncHandler(async (req, res, next) => {
	const testId = req.params.id;
	const teacherId = req.user.id;
	const { score, feedback, gradedAnswers } = req.body;

	const studentTest = await StudentTest.findById(testId).populate({
		path: "scheduledTest",
		populate: [
			{ path: "test", select: "title questions" },
			{ path: "teacher", select: "name email" },
		],
	});

	if (!studentTest) {
		return next(new ErrorResponse(`No student test found with id ${testId}`, 404));
	}

	if (
		!studentTest.scheduledTest ||
		studentTest.scheduledTest.teacher._id.toString() !== teacherId
	) {
		return next(new ErrorResponse(`Not authorized to grade this test`, 403));
	}

	if (gradedAnswers && Array.isArray(gradedAnswers)) {
		let totalPoints = 0;
		let totalPossiblePoints = 0;
		let correctAnswersCount = 0;

		const questionsMap = {};
		if (
			studentTest.scheduledTest?.test?.questions
		) {
			studentTest.scheduledTest.test.questions.forEach((q) => {
				questionsMap[q.question.toString()] = q.points || 10;
			});
		}

		const updatedAnswerIds = new Set();

		for (const graded of gradedAnswers) {
			const answerIndex = studentTest.answers.findIndex(
				(a) => a.question.toString() === graded.question
			);

			if (answerIndex !== -1) {
				const maxPoints = questionsMap[graded.question] || 10;
				const pointsAwarded = Number(graded.points || 0);
				const isFullyCorrect = pointsAwarded >= maxPoints * 0.9;

				studentTest.answers[answerIndex].isCorrect = isFullyCorrect;
				studentTest.answers[answerIndex].points = pointsAwarded;
				studentTest.answers[answerIndex].maxPoints = maxPoints;
				studentTest.answers[answerIndex].feedback = graded.feedback?.trim() || "";

				if (isFullyCorrect) correctAnswersCount++;
				totalPoints += pointsAwarded;
				totalPossiblePoints += maxPoints;
				updatedAnswerIds.add(graded.question);
			}
		}

		// Add non-updated answers to the total
		studentTest.answers.forEach((answer) => {
			const questionId = answer.question.toString();
			if (!updatedAnswerIds.has(questionId)) {
				totalPoints += Number(answer.points || 0);
				totalPossiblePoints += questionsMap[questionId] || 10;
				if (answer.isCorrect) correctAnswersCount++;
			}
		});

		// Calculate score from total points
		if (totalPossiblePoints > 0 && score === undefined) {
			studentTest.score = Math.round((totalPoints / totalPossiblePoints) * 100);
		}
	}

	if (score !== undefined) {
		studentTest.score = Math.min(Number(score), 100);
	}

	studentTest.feedback = feedback || studentTest.feedback;
	studentTest.status = "graded";
	studentTest.gradedAt = Date.now();

	await studentTest.save();

	res.status(200).json({
		success: true,
		data: studentTest,
	});
});

/**
 * @desc    Get all grades the teacher is connected to
 * @route   GET /api/teacher/grades
 * @access  Private (Teacher)
 */
exports.getTeacherGrades = asyncHandler(async (req, res, next) => {
	const teacherId = req.user.id;

	// Get grades from teaching assignments
	const teacher = await mongoose
		.model("Teacher")
		.findOne({ user: teacherId })
		.populate({
			path: "teachingAssignments",
			populate: [
				{ path: "subject", select: "name" },
				{ path: "grades", select: "name level" },
			],
		});

	let assignedGrades = [];
	if (teacher?.teachingAssignments) {
		assignedGrades = teacher.teachingAssignments.flatMap((assignment) =>
			assignment.grades.map((grade) => ({
				_id: grade._id,
				name: grade.name,
				level: grade.level,
				source: "assigned",
			}))
		);
	}

	// Get grades where the teacher has scheduled tests
	const scheduledTests = await mongoose
		.model("ScheduledTest")
		.find({ teacher: teacherId })
		.populate("grade", "name level");

	const scheduledGrades = scheduledTests
		.filter((test) => test.grade)
		.map((test) => ({
			_id: test.grade._id,
			name: test.grade.name,
			level: test.grade.level,
			source: "scheduled",
		}));

	// Merge assigned + scheduled grades without duplicates
	const allGradesMap = new Map();

	assignedGrades.forEach((grade) => {
		allGradesMap.set(grade._id.toString(), { ...grade, sources: ["assigned"] });
	});

	scheduledGrades.forEach((grade) => {
		const key = grade._id.toString();
		if (allGradesMap.has(key)) {
			const existing = allGradesMap.get(key);
			if (!existing.sources.includes("scheduled")) {
				existing.sources.push("scheduled");
			}
		} else {
			allGradesMap.set(key, { ...grade, sources: ["scheduled"] });
		}
	});

	const allGrades = Array.from(allGradesMap.values()).sort((a, b) =>
		a.level ? a.level - b.level : a.name.localeCompare(b.name)
	);

	res.status(200).json({
		success: true,
		data: allGrades,
	});
});

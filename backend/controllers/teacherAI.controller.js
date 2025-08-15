/**
 * AI Grading Controller
 * ---------------------
 * Provides endpoints for AI-generated grading suggestions using Gemini AI.
 * These suggestions are not saved to the database and are meant for teacher review.
 *
 * Routes:
 * - GET /api/teacher/answers/:id/ai-grade – Grade a single answer
 * - GET /api/teacher/tests/:id/ai-grade – Grade an entire test
 */

const StudentTest = require("../models/StudentTest");
const Answer = require("../models/Answer");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const geminiService = require("../services/gemini.service");

/**
 * @desc    Get AI-suggested grading for a specific answer
 * @route   GET /api/teacher/answers/:id/ai-grade
 * @access  Private (Teacher)
 */
exports.getAnswerAIGrade = asyncHandler(async (req, res, next) => {
	try {
		const answerId = req.params.id;
		const teacherId = req.user.id;
		const questionPoints = req.query.points
			? parseInt(req.query.points, 10)
			: 10;

		console.log(
			`Request for AI grading suggestions for answer ${answerId} by teacher ${teacherId} (max points: ${questionPoints})`
		);

		// Attempt to find the student test containing this answer by multiple methods
		let studentTest = await StudentTest.findOne({ "answers._id": answerId })
			.populate({ path: "scheduledTest", select: "teacher" })
			.populate({
				path: "answers.question",
				select: "body text options correctAnswer gradingGuidelines",
			});

		if (!studentTest) {
			// Try ObjectId fallback
			studentTest = await StudentTest.findOne({
				"answers._id": mongoose.Types.ObjectId.isValid(answerId)
					? new mongoose.Types.ObjectId(answerId)
					: answerId,
			})
				.populate({ path: "scheduledTest", select: "teacher" })
				.populate({
					path: "answers.question",
					select: "body text options correctAnswer gradingGuidelines",
				});
		}

		if (!studentTest) {
			// As a last resort, iterate all tests to find a match
			const allTests = await StudentTest.find()
				.populate({ path: "scheduledTest", select: "teacher" })
				.populate({
					path: "answers.question",
					select: "body text options correctAnswer gradingGuidelines",
				});

			for (const test of allTests) {
				const found = test.answers.find((a) => {
					const idMatch =
						a._id?.toString?.() === answerId || a._id === answerId;
					const questionMatch =
						a.question?._id?.toString?.() === answerId ||
						a.question === answerId;
					return idMatch || questionMatch;
				});
				if (found) {
					studentTest = test;
					break;
				}
			}
		}

		if (!studentTest) {
			return next(
				new ErrorResponse(
					`No test found with answer id ${answerId}. Please check the answer ID.`,
					404
				)
			);
		}

		// Permission check
		if (studentTest.scheduledTest.teacher.toString() !== teacherId) {
			return next(new ErrorResponse("Not authorized to access this answer", 403));
		}

		// Find the answer from the test's answers
		let answer = studentTest.answers.find(
			(a) => a._id?.toString?.() === answerId
		) || studentTest.answers[0]; // fallback

		if (!answer) {
			return next(
				new ErrorResponse(
					`Answer not found in the test. Test has ${studentTest.answers.length} answers.`,
					404
				)
			);
		}

		// Request AI grading
		const aiGrading = await geminiService.gradeAnswer(
			answer,
			answer.question,
			questionPoints
		);

		res.status(200).json({
			success: true,
			data: {
				points: aiGrading.points || 0,
				isCorrect: aiGrading.isCorrect || false,
				feedback: aiGrading.feedback || "No feedback available",
				confidence: 0.9,
				summary: aiGrading.summary || "",
				isSuggestion: true,
				message:
					"This is an AI-suggested grade. Please review and submit manually if you agree.",
			},
		});
	} catch (error) {
		console.error("Error in AI grading suggestion for answer:", error);
		return next(
			new ErrorResponse(`Error in AI grading suggestion: ${error.message}`, 500)
		);
	}
});

/**
 * @desc    Get AI-suggested grading for a full student test
 * @route   GET /api/teacher/tests/:id/ai-grade
 * @access  Private (Teacher)
 */
exports.getTestAIGrade = asyncHandler(async (req, res, next) => {
	try {
		const testId = req.params.id;
		const teacherId = req.user.id;

		console.log(
			`Request for AI grading suggestions for test ${testId} by teacher ${teacherId}`
		);

		// Fetch the student test with populated test & questions
		const studentTest = await StudentTest.findById(testId)
			.populate({
				path: "scheduledTest",
				select: "teacher test",
				populate: {
					path: "test",
					select: "title questions",
					populate: {
						path: "questions.question",
						select: "body text options correctAnswer gradingGuidelines points",
					},
				},
			})
			.populate({
				path: "answers.question",
				select: "body text options correctAnswer gradingGuidelines points",
			});

		if (!studentTest) {
			return next(new ErrorResponse(`Test not found with id ${testId}`, 404));
		}

		// Permission check
		if (studentTest.scheduledTest.teacher.toString() !== teacherId) {
			return next(new ErrorResponse("Not authorized to access this test", 403));
		}

		// Log structure for debugging
		console.log(`Student: ${studentTest.student}`);
		console.log(`Questions Count: ${studentTest.scheduledTest?.test?.questions?.length}`);
		console.log(`Answers Count: ${studentTest.answers?.length}`);

		// AI grading request
		const aiGradingResult = await geminiService.gradeTest(studentTest);

		// Map answers with IDs
		const aiGradedAnswers = (aiGradingResult.questionsWithIds || aiGradingResult.questions || []).map((q) => {
			const questionId = q.questionId?.toString?.() || null;

			let answerId = null;
			const matching = studentTest.answers.find((a) => {
				const aQid =
					typeof a.question === "object"
						? a.question._id?.toString?.()
						: a.question?.toString?.();
				return aQid === questionId;
			});
			if (matching) {
				answerId = matching._id?.toString?.() || matching.id || null;
			}

			return {
				answerId,
				questionId,
				points: q.points || 0,
				isCorrect: q.isCorrect || false,
				feedback: q.feedback || "No feedback available",
			};
		});

		res.status(200).json({
			success: true,
			data: {
				score: aiGradingResult.score || 0,
				feedback: aiGradingResult.summary || "No summary available",
				gradedAnswers: aiGradedAnswers,
				confidence: 0.9,
				totalCorrect: aiGradingResult.totalCorrect,
				totalQuestions: aiGradingResult.totalQuestions,
				isSuggestion: true,
				message:
					"These are AI-suggested grades. Please review and submit manually if you agree.",
			},
		});
	} catch (error) {
		console.error("Error in AI grading suggestions for test:", error);
		return next(
			new ErrorResponse(
				`Error in AI grading suggestions: ${error.message}`,
				500
			)
		);
	}
});

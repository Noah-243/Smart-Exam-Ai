/**
 * StudentDashboardController
 * --------------------------
 * This controller handles all student dashboard-related endpoints, including:
 * - Fetching dashboard overview data
 * - Retrieving upcoming and past tests
 * - Submitting test results
 * - Viewing performance statistics
 * - Generating sample test data (for development)
 *
 * Services used:
 * - userService
 * - testService
 * - studentService
 * - scheduledTestService
 */

const userService = require("../services/user.service");
const testService = require("../services/test.service");
const scheduledTestService = require("../services/scheduledTest.service");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");
const StudentTest = require("../models/StudentTest");
const Question = require("../models/Question");
const ScheduledTest = require("../models/ScheduledTest");
const studentService = require("../services/student.service");
const devConfig = require("../config/development");
const asyncHandler = require("express-async-handler");

class StudentDashboardController {
	/**
	 * Get dashboard data for logged-in student
	 * Includes profile, upcoming tests, past tests, and stats
	 */
	async getDashboardData(req, res, next) {
		try {
			const userId = req.user.id;
			const user = await userService.getUserById(userId);

			if (!user || user.role !== "student") {
				throw new ErrorResponse("User not found or not a student", 404);
			}

			// Get student's profile and grade
			const studentProfile = await mongoose
				.model("Student")
				.findById(user.profileId)
				.populate("grade", "name level");

			if (!studentProfile) {
				throw new ErrorResponse("Student profile not found", 404);
			}

			// Get upcoming and past tests
			const upcomingTests = await scheduledTestService.getUpcomingTestsByGrade(studentProfile.grade._id);
			const pastTests = await scheduledTestService.getPastTestsByStudent(userId);

			// Calculate test stats
			const totalTestsTaken = pastTests.length;
			const totalScores = pastTests.reduce((sum, test) => sum + (test.score || 0), 0);
			const averageScore = totalTestsTaken > 0 ? totalScores / totalTestsTaken : 0;

			const stats = {
				totalTestsTaken,
				averageScore,
				upcomingTests: upcomingTests.length,
			};

			console.log("Dashboard stats calculated:", stats);

			// Respond with full dashboard data
			res.status(200).json({
				success: true,
				data: {
					student: {
						...user.toObject(),
						profile: studentProfile,
					},
					upcomingTests,
					pastTests,
					stats,
				},
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get upcoming tests for the student's grade
	 */
	async getUpcomingTests(req, res, next) {
		try {
			const userId = req.user.id;
			const user = await userService.getUserById(userId);

			if (!user) {
				throw new ErrorResponse("User not found", 404);
			}

			const studentProfile = await mongoose
				.model("Student")
				.findOne({ user: user._id })
				.populate("grade");

			if (!studentProfile) {
				throw new ErrorResponse("Student profile not found", 404);
			}

			const upcomingTests = await scheduledTestService.getUpcomingTestsByGrade(studentProfile.grade._id);

			res.status(200).json({
				success: true,
				data: upcomingTests,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get student's performance stats (avg, per subject)
	 */
	async getPerformanceStats(req, res, next) {
		try {
			const { id } = req.params;
			const userId = req.user.id;
			const studentId = id || userId;

			const performanceData = await testService.getStudentPerformanceStats(studentId);

			res.status(200).json({
				success: true,
				data: performanceData,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get the first available test for the student
	 * (for backward compatibility)
	 */
	async getAvailableTest(req, res, next) {
		try {
			const userId = req.user.id;

			const availableTests = await studentService.getAllAvailableTests(userId);

			if (availableTests && availableTests.length > 0) {
				const firstTest = availableTests[0];

				return res.status(200).json({
					success: true,
					data: firstTest,
					totalAvailable: availableTests.length,
				});
			}

			res.status(200).json({
				success: true,
				data: null,
				message: "No available tests found for this student.",
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get all past (taken) tests for student
	 */
	async getPastTests(req, res, next) {
		try {
			const userId = req.user.id;

			const studentTests = await StudentTest.find({
				student: userId,
				status: { $in: ["pending", "completed", "graded"] },
			})
				.populate({
					path: "scheduledTest",
					populate: [
						{
							path: "test",
							select: "title subject duration",
							populate: {
								path: "subject",
								select: "name",
							},
						},
					],
				})
				.sort({ submittedAt: -1 });

			const formattedTests = studentTests.map((test) => ({
				_id: test._id,
				testName: test.scheduledTest?.test?.title || "Unknown Test",
				subject: test.scheduledTest?.test?.subject?.name || "Unknown Subject",
				subjectId: test.scheduledTest?.test?.subject?._id,
				duration: test.scheduledTest?.test?.duration || 0,
				score: test.score,
				submittedAt: test.submittedAt,
				status: test.status,
			}));

			res.status(200).json({
				success: true,
				data: formattedTests,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get full test details (questions, answers, scores) for review
	 */
	async getTestDetails(req, res, next) {
		try {
			const { testId } = req.params;
			const userId = req.user.id;

			const studentTest = await StudentTest.findOne({
				_id: testId,
				student: userId,
			})
				.populate({
					path: "scheduledTest",
					populate: [
						{
							path: "test",
							select: "title subject duration questions",
							populate: [
								{ path: "subject", select: "name" },
								{
									path: "questions.question",
									model: "Question",
									select: "body type answers isMultiAnswer isTextAnswer difficulty gradingGuidelines",
								},
							],
						},
					],
				})
				.populate({
					path: "answers.question",
					model: "Question",
					select: "body type answers isMultiAnswer isTextAnswer difficulty gradingGuidelines",
				});

			if (!studentTest) return next(new ErrorResponse("Test not found", 404));

			const correctAnswers = studentTest.answers.filter((a) => a.isCorrect).length;
			const totalEarnedPoints = studentTest.answers.reduce((sum, a) => sum + (a.points || 0), 0);
			const maxPossiblePoints = studentTest.answers.reduce((sum, a) => sum + (a.maxPoints || 50), 0);

			const testDetails = {
				_id: studentTest._id,
				testName: studentTest.scheduledTest?.test?.title || "Unknown Test",
				subject: studentTest.scheduledTest?.test?.subject?.name || "Unknown Subject",
				duration: studentTest.scheduledTest?.test?.duration || 0,
				score: studentTest.score,
				submittedAt: studentTest.submittedAt,
				status: studentTest.status,
				correctAnswers,
				totalQuestions: studentTest.answers.length,
				totalPoints: totalEarnedPoints,
				maxPossiblePoints,
				calculatedPercentage: maxPossiblePoints > 0
					? Math.round((totalEarnedPoints / maxPossiblePoints) * 100)
					: 0,
				questions: studentTest.answers.map((answer) => {
					const q = answer.question;
					return {
						_id: q?._id,
						body: q?.body || "Question not available",
						type: q?.type || "multiple-choice",
						answers: q?.answers || [],
						isMultiAnswer: q?.isMultiAnswer || false,
						isTextAnswer: q?.isTextAnswer || false,
						answer: answer.answer,
						isCorrect: answer.isCorrect,
						points: answer.points || 0,
						maxPoints: answer.maxPoints || 50,
						feedback: answer.feedback || "",
						percentageScore:
							answer.maxPoints > 0
								? Math.round(((answer.points || 0) / answer.maxPoints) * 100)
								: 0,
					};
				}),
			};

			res.status(200).json({
				success: true,
				data: testDetails,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Submit test answers from student
	 * Calculates score, stores results, marks as pending
	 */
	async submitTest(req, res, next) {
		try {
			const { id } = req.params;
			const { answers } = req.body;
			const studentId = req.user.id;

			const scheduledTest = await ScheduledTest.findById(id).populate({
				path: "test",
				populate: {
					path: "questions.question",
					select: "text options correctAnswer type difficulty points",
				},
			});

			if (!scheduledTest) return next(new ErrorResponse("Test not found", 404));
			if (scheduledTest.status !== "active") return next(new ErrorResponse("Test is not available", 400));

			const student = await mongoose.model("Student").findOne({ user: studentId });
			if (!student) return next(new ErrorResponse("Student not found", 404));
			if (student.grade.toString() !== scheduledTest.grade.toString())
				return next(new ErrorResponse("Test is not for your grade", 403));

			const testQuestions = scheduledTest.test.questions;
			let score = 0;
			const formattedAnswers = [];

			for (const answer of answers) {
				const questionObj = testQuestions.find(
					(q) => q.question._id.toString() === answer.questionId
				);

				if (!questionObj) continue;

				const question = questionObj.question;
				const isCorrect =
					question.type === "multiple_choice"
						? question.correctAnswer === answer.answer
						: false;

				const maxPoints = questionObj.points || 50;
				let points = isCorrect ? maxPoints : 0;

				formattedAnswers.push({
					question: answer.questionId,
					answer: answer.answer,
					isCorrect,
					points,
					maxPoints,
				});
			}

			const totalScore = Math.round((score / testQuestions.length) * 100);

			const studentTest = await StudentTest.create({
				student: student._id,
				scheduledTest: scheduledTest._id,
				answers: formattedAnswers,
				score: totalScore,
				status: "pending",
				submittedAt: Date.now(),
			});

			res.status(201).json({
				success: true,
				data: studentTest,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Generate sample test data for development (mock tests + scores)
	 */
	async generateSampleData(req, res, next) {
		try {
			const userId = req.user.id;
			const user = await userService.getUserById(userId);
			if (!user || user.role !== "student")
				throw new ErrorResponse("User not found or not a student", 404);

			const subjectService = require("../services/subject.service");
			const allSubjects = await subjectService.getAllSubjects();
			if (!allSubjects || allSubjects.length === 0)
				throw new ErrorResponse("No subjects found", 404);

			const scheduledTests = await ScheduledTest.find()
				.populate({
					path: "test",
					populate: [
						{ path: "subject" },
						{ path: "questions.question", model: "Question" },
					],
				})
				.limit(10);

			const sampleData = [];

			for (const subject of allSubjects) {
				const scheduledTest = scheduledTests.find(
					(st) =>
						st.test &&
						st.test.subject &&
						st.test.subject._id.toString() === subject._id.toString()
				);

				const testToUse = scheduledTest || scheduledTests[0];
				if (!testToUse) continue;

				const studentTest = new StudentTest({
					student: userId,
					scheduledTest: testToUse._id,
					startedAt: new Date(Date.now() - 1000 * 60 * 30),
					submittedAt: new Date(),
					status: "completed",
					answers: [],
					score: Math.floor(Math.random() * 40) + 60,
					totalQuestions: testToUse.test.questions.length,
				});

				testToUse.test.questions.forEach((questionItem) => {
					const isCorrect = Math.random() > 0.3;
					studentTest.answers.push({
						question: questionItem.question._id,
						selectedAnswer: isCorrect
							? questionItem.question.correctAnswer
							: Math.floor(Math.random() * 4),
						isCorrect: isCorrect,
					});
				});

				await studentTest.save();
				sampleData.push({
					subject: subject.name,
					testId: studentTest._id,
				});
			}

			res.status(200).json({
				success: true,
				message: "Sample data generated",
				data: sampleData,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Admin/Teacher endpoint for full student performance breakdown
	 */
	async getStudentPerformance(req, res, next) {
		try {
			const { id } = req.params;
			const userId = req.user.id;
			const studentId = id || userId;

			const subjectService = require("../services/subject.service");
			const allSubjects = await subjectService.getAllSubjects();

			const completedTests = await StudentTest.find({
				student: studentId,
				status: "completed",
			}).populate({
				path: "scheduledTest",
				populate: {
					path: "test",
					populate: {
						path: "subject",
						select: "name",
					},
				},
			});

			const performanceData = await testService.getStudentPerformanceStats(studentId);

			res.status(200).json({
				success: true,
				data: performanceData,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Return all available tests (for modern frontend)
	 */
	async getAllAvailableTests(req, res, next) {
		try {
			const userId = req.user.id;

			const availableTests = await studentService.getAllAvailableTests(userId);

			res.status(200).json({
				success: true,
				data: availableTests || [],
				count: availableTests?.length || 0,
				message: availableTests?.length
					? undefined
					: "No available tests found for this student.",
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new StudentDashboardController();

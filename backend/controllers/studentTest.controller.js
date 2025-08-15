/**
 * SubmitTest Controller
 * ---------------------
 * Handles submission of a student's completed test.
 * - Validates input
 * - Checks if test is still active
 * - Calculates score based on provided answers
 * - Creates a StudentTest record
 * - Updates the ScheduledTest status
 */

const StudentTest = require("../models/StudentTest");
const ScheduledTest = require("../models/ScheduledTest");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

/**
 * @desc    Submit a test
 * @route   POST /api/student-tests
 * @access  Private (Student)
 */
exports.submitTest = asyncHandler(async (req, res, next) => {
	console.log("Received test submission request:", {
		body: req.body,
		user: req.user,
		method: req.method,
		path: req.path,
	});

	const { scheduledTest: scheduledTestId, answers } = req.body;
	const studentId = req.user.id;

	// Ensure required fields are provided
	if (!scheduledTestId || !answers) {
		console.log("Missing required fields:", { scheduledTestId, answers });
		return next(
			new ErrorResponse("Please provide scheduledTest ID and answers", 400)
		);
	}

	// Fetch the scheduled test and its associated questions
	const scheduledTest = await ScheduledTest.findById(scheduledTestId).populate({
		path: "test",
		populate: {
			path: "questions.question",
			select: "options answers",
		},
	});

	if (!scheduledTest) {
		console.log("Scheduled test not found:", scheduledTestId);
		return next(new ErrorResponse("Scheduled test not found", 404));
	}

	console.log("Found scheduled test:", {
		id: scheduledTest._id,
		title: scheduledTest.test?.title,
		questionCount: scheduledTest.test?.questions?.length,
	});

	// Check if the test has already expired
	const now = new Date();
	const testEndTime = new Date(
		scheduledTest.scheduledAt.getTime() + scheduledTest.duration * 60000
	);

	if (now > testEndTime) {
		return next(new ErrorResponse("Test has ended", 400));
	}

	// Process and evaluate answers
	let correctAnswers = 0;

	const processedAnswers = answers
		.map((answer) => {
			const question = scheduledTest.test.questions.find(
				(q) => q.question._id.toString() === answer.question
			);

			if (!question) return null;

			// Handle empty answers
			if (!answer.answer) {
				return {
					question: answer.question,
					answer: "",
					isCorrect: false,
				};
			}

			// Check if answer is correct
			const isCorrect = question.question.answers.some(
				(ans) => ans.body === answer.answer && ans.isCorrect
			);

			if (isCorrect) correctAnswers++;

			return {
				question: answer.question,
				answer: answer.answer,
				isCorrect,
			};
		})
		.filter((answer) => answer !== null); // Filter out invalid questions

	// Calculate final score as percentage
	const totalQuestions = scheduledTest.test.questions.length;
	const score = Math.round((correctAnswers / totalQuestions) * 100);

	// Save the completed test to the database
	const studentTest = await StudentTest.create({
		student: studentId,
		scheduledTest: scheduledTestId,
		answers: processedAnswers,
		score,
		status: "pending", // Waiting for teacher review
		submittedAt: now,
	});

	// Optionally mark scheduled test as completed (not always required)
	await ScheduledTest.findByIdAndUpdate(scheduledTestId, {
		status: "completed",
	});

	console.log("Test submission successful:", {
		studentId,
		testId: scheduledTestId,
		score,
		answersCount: processedAnswers.length,
	});

	// Return the created test result
	res.status(201).json({
		success: true,
		data: studentTest,
	});
});

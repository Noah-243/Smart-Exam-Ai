/**
 * Test Controller
 * --------------------------------
 * Handles all operations related to test creation, retrieval, update, deletion,
 * and integration with the Gemini AI service for automatic test generation.
 * 
 * Main Features:
 * - CRUD operations for tests
 * - AI-powered test suggestions using Gemini
 * - Retrieve AI-compatible questions
 * - Generate and save AI-generated tests
 */

const Test = require("../models/Test");
const Question = require("../models/Question");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const GeminiService = require("../services/gemini.service");

/**
 * @desc    Get all tests in the system
 * @route   GET /api/tests
 * @access  Private (Teacher, Admin)
 */
exports.getTests = async (req, res, next) => {
	const tests = await Test.find()
		.populate("grade", "name level")
		.populate("subject", "name")
		.populate("user", "name")
		.populate({
			path: "questions.question",
			select:
				"body answers isMultiAnswer isTextAnswer correctAnswer correctAnswers points",
		});

	res.status(200).json({
		success: true,
		data: tests,
	});
};

/**
 * @desc    Get a single test by ID
 * @route   GET /api/tests/:id
 * @access  Private (Teacher, Admin)
 */
exports.getTest = async (req, res, next) => {
	const test = await Test.findById(req.params.id)
		.populate("grade", "name level")
		.populate("subject", "name")
		.populate("user", "name")
		.populate("questions.question", "body answers isMultiAnswer isTextAnswer");

	if (!test) {
		return next(
			new ErrorResponse(`Test not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: test,
	});
};

/**
 * @desc    Create a new test
 * @route   POST /api/tests
 * @access  Private (Teacher, Admin)
 */
exports.createTest = async (req, res, next) => {
	req.body.user = req.user.id;

	if (req.body.questions) {
		req.body.questions = req.body.questions.map((q) => ({
			question: q.question || q._id,
			points: q.points,
		}));
	}

	const test = await Test.create(req.body);

	res.status(201).json({
		success: true,
		data: test,
	});
};

/**
 * @desc    Update an existing test
 * @route   PUT /api/tests/:id
 * @access  Private (Teacher, Admin)
 */
exports.updateTest = async (req, res, next) => {
	let test = await Test.findById(req.params.id);

	if (!test) {
		return next(
			new ErrorResponse(`Test not found with id of ${req.params.id}`, 404)
		);
	}

	if (test.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update this test`,
				401
			)
		);
	}

	test = await Test.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: test,
	});
};

/**
 * @desc    Delete a test
 * @route   DELETE /api/tests/:id
 * @access  Private (Teacher, Admin)
 */
exports.deleteTest = async (req, res, next) => {
	const test = await Test.findById(req.params.id);

	if (!test) {
		return next(
			new ErrorResponse(`Test not found with id of ${req.params.id}`, 404)
		);
	}

	if (test.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to delete this test`,
				401
			)
		);
	}

	await test.deleteOne();

	res.status(200).json({
		success: true,
		data: {},
	});
};

/**
 * @desc    Get questions for AI processing by grade and subject
 * @route   GET /api/tests/ai/questions/:gradeId/:subjectId
 * @access  Private (Teacher, Admin)
 */
exports.getQuestionsForAI = asyncHandler(async (req, res, next) => {
	const { gradeId, subjectId } = req.params;

	const questions = await Question.find({
		"gradeSubjects.grade": gradeId,
		"gradeSubjects.subject": subjectId,
	}).select("_id body type difficulty");

	const formattedQuestions = questions.map((question) => ({
		_id: question._id,
		text: question.body,
		type: question.type,
		difficulty: question.difficulty,
	}));

	res.status(200).json({
		success: true,
		count: formattedQuestions.length,
		data: formattedQuestions,
	});
});

/**
 * @desc    Generate test questions using AI (Gemini)
 * @route   POST /api/tests/ai/generate
 * @access  Private (Teacher, Admin)
 */
exports.generateAITest = asyncHandler(async (req, res, next) => {
	const {
		grade,
		subject,
		totalQuestions,
		multipleChoiceCount,
		openEndedCount,
		difficulty,
		additionalInstructions,
	} = req.body;

	if (!grade || !subject || !totalQuestions) {
		return next(
			new ErrorResponse("Grade, subject, and total questions are required", 400)
		);
	}

	try {
		const existingQuestions = await Question.find({
			"gradeSubjects.grade": grade,
			"gradeSubjects.subject": subject,
		}).select("_id body type difficulty");

		const questionsForAI = existingQuestions.map((q) => ({
			_id: q._id,
			text: q.body,
		}));

		const aiResult = await GeminiService.generateTest({
			existingQuestions: questionsForAI,
			requirements: {
				totalQuestions,
				multipleChoiceCount,
				openEndedCount,
				difficulty,
				grade,
				subject,
				additionalInstructions,
			},
		});

		res.status(200).json({
			success: true,
			data: aiResult,
		});
	} catch (error) {
		console.error("Error generating AI test:", error);
		return next(
			new ErrorResponse("Failed to generate AI test. Please try again.", 500)
		);
	}
});

/**
 * @desc    Create a test from AI-generated content
 * @route   POST /api/tests/ai/create
 * @access  Private (Teacher, Admin)
 */
exports.createAITest = asyncHandler(async (req, res, next) => {
	const { testData, selectedQuestionIds, newQuestions } = req.body;

	if (!testData || !testData.title || !testData.grade || !testData.subject) {
		return next(
			new ErrorResponse(
				"Test data with title, grade, and subject are required",
				400
			)
		);
	}

	try {
		const createdQuestionIds = [];

		if (newQuestions && newQuestions.length > 0) {
			for (const questionData of newQuestions) {
				const questionToCreate = {
					...questionData,
					user: req.user.id,
					gradeSubjects: [
						{
							grade: testData.grade,
							subject: testData.subject,
						},
					],
				};

				const createdQuestion = await Question.create(questionToCreate);
				createdQuestionIds.push(createdQuestion._id);
			}
		}

		const allQuestionIds = [
			...(selectedQuestionIds || []),
			...createdQuestionIds,
		];

		const testToCreate = {
			...testData,
			user: req.user.id,
			questions: allQuestionIds.map((questionId, index) => ({
				question: questionId,
				points: Math.round(100 / allQuestionIds.length),
			})),
		};

		const createdTest = await Test.create(testToCreate);

		const populatedTest = await Test.findById(createdTest._id)
			.populate("grade", "name level")
			.populate("subject", "name")
			.populate("user", "name")
			.populate({
				path: "questions.question",
				select: "body answers isMultiAnswer isTextAnswer type difficulty",
			});

		res.status(201).json({
			success: true,
			data: populatedTest,
			newQuestionsCreated: createdQuestionIds.length,
		});
	} catch (error) {
		console.error("Error creating AI test:", error);
		return next(
			new ErrorResponse("Failed to create AI test. Please try again.", 500)
		);
	}
});

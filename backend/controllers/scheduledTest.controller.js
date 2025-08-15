const scheduledTestService = require("../services/scheduledTest.service");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all scheduled tests
// @route   GET /api/scheduled-tests
// @access  Private (Teacher, Admin)
exports.getScheduledTests = asyncHandler(async (req, res, next) => {
	const scheduledTests = await scheduledTestService.getScheduledTests();

	res.status(200).json({
		success: true,
		data: scheduledTests,
	});
});

// @desc    Get single scheduled test
// @route   GET /api/scheduled-tests/:id
// @access  Private (Teacher, Admin, Student)
exports.getScheduledTest = asyncHandler(async (req, res, next) => {
	const scheduledTest = await scheduledTestService.getScheduledTestById(
		req.params.id
	);

	res.status(200).json({
		success: true,
		data: scheduledTest,
	});
});

// @desc    Create new scheduled test
// @route   POST /api/scheduled-tests
// @access  Private (Teacher, Admin)
exports.createScheduledTest = asyncHandler(async (req, res, next) => {
	const scheduledTest = await scheduledTestService.createScheduledTest(
		req.body
	);

	res.status(201).json({
		success: true,
		data: scheduledTest,
	});
});

// @desc    Update scheduled test
// @route   PUT /api/scheduled-tests/:id
// @access  Private (Teacher, Admin)
exports.updateScheduledTest = asyncHandler(async (req, res, next) => {
	const scheduledTest = await scheduledTestService.updateScheduledTest(
		req.params.id,
		req.body
	);

	res.status(200).json({
		success: true,
		data: scheduledTest,
	});
});

// @desc    Delete scheduled test
// @route   DELETE /api/scheduled-tests/:id
// @access  Private (Teacher, Admin)
exports.deleteScheduledTest = asyncHandler(async (req, res, next) => {
	await scheduledTestService.deleteScheduledTest(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});

// @desc    Get upcoming tests for a grade
// @route   GET /api/scheduled-tests/upcoming/:gradeId
// @access  Private (Teacher, Admin, Student)
exports.getUpcomingTests = asyncHandler(async (req, res, next) => {
	try {
		const tests = await scheduledTestService.getTestsByGrade(
			req.params.gradeId,
			{
				status: "scheduled",
				timeframe: "upcoming",
			}
		);

		res.status(200).json({
			success: true,
			data: tests,
		});
	} catch (error) {
		next(error);
	}
});

// @desc    Get past tests for a grade
// @route   GET /api/scheduled-tests/past/:gradeId
// @access  Private (Teacher, Admin, Student)
exports.getPastTests = asyncHandler(async (req, res, next) => {
	const pastTests = await scheduledTestService.getPastTests(req.params.gradeId);

	res.status(200).json({
		success: true,
		data: pastTests,
	});
});

// @desc    Get test results for a grade
// @route   GET /api/scheduled-tests/results/:gradeId
// @access  Private (Teacher, Admin, Student)
exports.getTestResults = asyncHandler(async (req, res, next) => {
	try {
		const results = await scheduledTestService.getTestResults({
			grade: req.params.gradeId,
		});

		res.status(200).json({
			success: true,
			data: results,
		});
	} catch (error) {
		next(error);
	}
});

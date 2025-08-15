const mongoose = require("mongoose");
const StudentTest = require("../models/StudentTest");
const Subject = require("../models/Subject");

/**
 * Get summarized subject performance data for a student
 * @route GET /api/student/performance-summary
 * @access Private (Student only)
 */
exports.getStudentPerformanceSummary = async (req, res) => {
	try {
		const studentId = req.user._id;
		console.log(`Getting performance summary for student ID: ${studentId}`);

		// First check if the student has any completed tests
		const testCount = await StudentTest.countDocuments({
			student: new mongoose.Types.ObjectId(studentId),
			status: { $in: ["completed", "graded"] },
		});

		console.log(
			`Found ${testCount} completed/graded tests for student ${studentId}`
		);

		// Aggregate data from studentTests collection
		const subjectPerformance = await StudentTest.aggregate([
			// Filter tests by student ID and include both completed AND graded tests
			{
				$match: {
					student: new mongoose.Types.ObjectId(studentId),
					status: { $in: ["completed", "graded"] },
				},
			},
			// Lookup scheduledTest
			{
				$lookup: {
					from: "scheduledtests",
					localField: "scheduledTest",
					foreignField: "_id",
					as: "scheduledTestDetails",
				},
			},
			{ $unwind: "$scheduledTestDetails" },
			// Lookup test from scheduledTest
			{
				$lookup: {
					from: "tests",
					localField: "scheduledTestDetails.test",
					foreignField: "_id",
					as: "testDetails",
				},
			},
			{ $unwind: "$testDetails" },
			// Group tests by subject
			{
				$group: {
					_id: "$testDetails.subject",
					testCount: { $sum: 1 },
					averageScore: { $avg: "$score" },
					highestScore: { $max: "$score" },
					lowestScore: { $min: "$score" },
					// Collect data for trend calculation
					recentScores: {
						$push: {
							score: "$score",
							date: "$submittedAt",
						},
					},
				},
			},
			// Look up subject info
			{
				$lookup: {
					from: "subjects",
					localField: "_id",
					foreignField: "_id",
					as: "subjectInfo",
				},
			},
			{ $unwind: "$subjectInfo" },
			// Format the output
			{
				$project: {
					_id: 1,
					id: "$_id",
					name: "$subjectInfo.name",
					testCount: 1,
					averageScore: 1,
					highestScore: 1,
					lowestScore: 1,
					recentScores: { $slice: ["$recentScores", -5] }, // Get up to 5 most recent tests
					hasData: { $gt: ["$testCount", 0] },
				},
			},
			// Sort by average score (highest first)
			{ $sort: { averageScore: -1 } },
		]);

		console.log(`Aggregation returned ${subjectPerformance.length} subjects`);
		if (subjectPerformance.length === 0) {
			console.log(
				"No subject performance data returned from aggregation, debugging pipeline..."
			);

			// Debug the first few steps of the pipeline to see where it's failing
			const studentTests = await StudentTest.find({
				student: new mongoose.Types.ObjectId(studentId),
				status: { $in: ["completed", "graded"] },
			})
				.populate({
					path: "scheduledTest",
					populate: {
						path: "test",
						populate: {
							path: "subject",
						},
					},
				})
				.limit(5);

			console.log(
				"Sample populated student tests:",
				studentTests.map((test) => ({
					id: test._id,
					status: test.status,
					score: test.score,
					scheduledTestId: test.scheduledTest?._id,
					testId: test.scheduledTest?.test?._id,
					subjectId: test.scheduledTest?.test?.subject?._id,
					subjectName: test.scheduledTest?.test?.subject?.name,
				}))
			);
		}

		// Calculate trends for each subject
		const subjectsWithTrends = subjectPerformance.map((subject) => {
			// Sort recent scores by date
			const sortedScores = subject.recentScores.sort(
				(a, b) => new Date(a.date) - new Date(b.date)
			);

			let trend = null;

			// Need at least 2 scores to calculate a trend
			if (sortedScores.length >= 2) {
				const latestScore = sortedScores[sortedScores.length - 1].score;
				const previousScore = sortedScores[sortedScores.length - 2].score;

				if (latestScore > previousScore) {
					trend = "up";
				} else if (latestScore < previousScore) {
					trend = "down";
				} else {
					trend = "flat";
				}
			}

			return {
				...subject,
				trend,
			};
		});

		// Get overall stats for dashboard
		const overallStats = await StudentTest.aggregate([
			{
				$match: {
					student: new mongoose.Types.ObjectId(studentId),
					status: { $in: ["completed", "graded"] },
				},
			},
			{
				$group: {
					_id: null,
					totalTestsTaken: { $sum: 1 },
					averageScore: { $avg: "$score" },
				},
			},
		]);

		// Format the stats
		const stats =
			overallStats.length > 0
				? {
						totalTestsTaken: overallStats[0].totalTestsTaken,
						averageScore: overallStats[0].averageScore,
				  }
				: {
						totalTestsTaken: 0,
						averageScore: 0,
				  };

		// Get all subjects to include even if no tests have been taken
		const allSubjects = await Subject.find({});

		// Add subjects that don't have test data yet
		const existingSubjectIds = subjectsWithTrends.map((subject) =>
			subject._id.toString()
		);

		const allSubjectsData = [
			...subjectsWithTrends,
			...allSubjects
				.filter(
					(subject) => !existingSubjectIds.includes(subject._id.toString())
				)
				.map((subject) => ({
					_id: subject._id,
					id: subject._id,
					name: subject.name,
					testCount: 0,
					averageScore: 0,
					highestScore: 0,
					lowestScore: 0,
					recentScores: [],
					hasData: false,
					trend: null,
				})),
		];

		// Before sending the response, log the data being sent
		console.log(
			`Returning performance data with ${allSubjectsData.length} subjects and stats:`,
			stats
		);

		res.status(200).json({
			success: true,
			data: {
				subjectPerformance: allSubjectsData,
				stats,
			},
		});
	} catch (error) {
		console.error("Error fetching student performance summary:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching performance data",
			error: error.message,
		});
	}
};

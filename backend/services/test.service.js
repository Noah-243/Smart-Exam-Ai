/**
 * 📝 Test Service Module
 *
 * Comprehensive test management service providing full test lifecycle operations:
 * - Test creation, retrieval, and management
 * - Question validation and points management
 * - Student performance analytics and tracking
 * - Test publishing and status management
 * - Grade and subject-based test filtering
 * - Advanced performance metrics and aggregation
 *
 * Features:
 * - Automatic points validation (total must equal 100)
 * - Comprehensive test data population
 * - Student performance tracking and analytics
 * - MongoDB aggregation for efficient data processing
 * - Subject-based performance analysis
 * - Recent test tracking and trend analysis
 * - Comprehensive error handling and logging
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const Test = require("../models/Test");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");
const StudentTest = require("../models/StudentTest");
const Subject = require("../models/Subject");

/**
 * 📝 TestService Class
 *
 * Handles all test-related business logic including creation, management,
 * and performance analytics.
 */
class TestService {
	/**
	 * 📋 Get All Tests
	 *
	 * Retrieves all tests with populated grade, subject, user, and question data.
	 * Includes comprehensive relationship information for dashboard display.
	 *
	 * @returns {Promise<Array>} Array of test objects with populated data
	 *
	 * @example
	 * const allTests = await testService.getTests();
	 * console.log(`Found ${allTests.length} tests`);
	 */
	async getTests() {
		console.log(`📋 Retrieving all tests with populated data`);

		try {
			const tests = await Test.find()
				.populate("grade", "name level")
				.populate("subject", "name")
				.populate("user", "name")
				.populate("questions.question", "body");

			console.log(`✅ Retrieved ${tests.length} tests successfully`);

			// Log distribution by subject and grade
			const subjectDistribution = tests.reduce((acc, test) => {
				const subject = test.subject?.name || "Unknown";
				acc[subject] = (acc[subject] || 0) + 1;
				return acc;
			}, {});

			console.log(`📊 Subject distribution:`, subjectDistribution);

			return tests;
		} catch (error) {
			console.error(`💥 Error retrieving tests:`, error.message);
			throw error;
		}
	}

	/**
	 * 🔍 Get Test by ID
	 *
	 * Retrieves a specific test with comprehensive populated data including
	 * questions, answers, and relationship information.
	 *
	 * @param {string} id - Test MongoDB ObjectId
	 * @returns {Promise<Object>} Test object with populated relationships
	 * @throws {ErrorResponse} 404 if test not found
	 *
	 * @example
	 * const test = await testService.getTestById('60d5ecb54e4b5c001f647c9a');
	 * console.log(`Test: ${test.title} (${test.questions.length} questions)`);
	 */
	async getTestById(id) {
		console.log(`🔍 Retrieving test by ID: ${id}`);

		try {
			const test = await Test.findById(id)
				.populate("grade", "name level")
				.populate("subject", "name")
				.populate("user", "name")
				.populate(
					"questions.question",
					"body answers isMultiAnswer isTextAnswer"
				);

			if (!test) {
				console.log(`❌ Test not found: ${id}`);
				throw new ErrorResponse(`Test not found with id of ${id}`, 404);
			}

			console.log(`✅ Test retrieved: "${test.title}"`);
			console.log(`📚 Subject: ${test.subject?.name || "Unknown"}`);
			console.log(
				`🎓 Grade: ${test.grade?.name || "Unknown"} (Level: ${
					test.grade?.level || "N/A"
				})`
			);
			console.log(`👤 Creator: ${test.user?.name || "Unknown"}`);
			console.log(`❓ Questions: ${test.questions?.length || 0}`);
			console.log(`⏱️ Duration: ${test.duration || "Not set"} minutes`);

			return test;
		} catch (error) {
			console.error(`💥 Error retrieving test ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 🆕 Create New Test
	 *
	 * Creates a new test with question validation and points verification.
	 * Ensures total points equal exactly 100 and formats questions properly.
	 *
	 * @param {Object} testData - Test creation data
	 * @param {string} testData.title - Test title
	 * @param {string} testData.description - Test description
	 * @param {string} testData.grade - Grade ObjectId
	 * @param {string} testData.subject - Subject ObjectId
	 * @param {Array} testData.questions - Array of question objects with points
	 * @param {number} testData.duration - Test duration in minutes
	 * @returns {Promise<Object>} Created test object
	 * @throws {ErrorResponse} 400 if validation fails
	 *
	 * @example
	 * const testData = {
	 *   title: 'Math Quiz',
	 *   questions: [{ question: questionId, points: 25 }, ...],
	 *   grade: gradeId,
	 *   subject: subjectId,
	 *   duration: 60
	 * };
	 * const test = await testService.createTest(testData);
	 */
	async createTest(testData) {
		console.log(`🆕 Creating new test: "${testData.title}"`);
		console.log(`📚 Subject: ${testData.subject}, Grade: ${testData.grade}`);
		console.log(`❓ Questions: ${testData.questions?.length || 0}`);
		console.log(`⏱️ Duration: ${testData.duration || "Not set"} minutes`);

		try {
			// Validate total points
			const totalPoints = testData.questions.reduce(
				(sum, q) => sum + q.points,
				0
			);

			console.log(`🔢 Calculating total points: ${totalPoints}`);

			if (totalPoints !== 100) {
				console.log(`❌ Invalid total points: ${totalPoints} (must be 100)`);
				throw new ErrorResponse(
					`Total points must equal 100. Current total: ${totalPoints}`,
					400
				);
			}

			console.log(`✅ Points validation passed: ${totalPoints}/100`);

			// Ensure questions are properly formatted
			const formattedQuestions = testData.questions.map((q, index) => {
				console.log(`  📝 Question ${index + 1}: ${q.points} points`);
				return {
					question: q.question || q._id, // Handle both formats
					points: q.points,
				};
			});

			const testToCreate = {
				...testData,
				questions: formattedQuestions,
			};

			console.log(`💾 Creating test document...`);
			const createdTest = await Test.create(testToCreate);

			console.log(`🎉 Test created successfully!`);
			console.log(`🆔 Test ID: ${createdTest._id}`);
			console.log(`📊 Final question count: ${createdTest.questions.length}`);

			return createdTest;
		} catch (error) {
			console.error(
				`💥 Error creating test "${testData.title}":`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * ✏️ Update Existing Test
	 *
	 * Updates test data with validation. If questions are updated,
	 * validates that total points still equal 100.
	 *
	 * @param {string} id - Test MongoDB ObjectId
	 * @param {Object} testData - Updated test data
	 * @returns {Promise<Object>} Updated test object
	 * @throws {ErrorResponse} 404 if test not found, 400 if validation fails
	 *
	 * @example
	 * const updates = { title: 'Updated Math Quiz', duration: 90 };
	 * const updatedTest = await testService.updateTest(testId, updates);
	 */
	async updateTest(id, testData) {
		console.log(`✏️ Updating test: ${id}`);
		console.log(`📝 Update fields:`, Object.keys(testData));

		try {
			// Validate total points if questions are being updated
			if (testData.questions) {
				const totalPoints = testData.questions.reduce(
					(sum, q) => sum + q.points,
					0
				);

				console.log(`🔢 Validating updated points: ${totalPoints}`);

				if (totalPoints !== 100) {
					console.log(
						`❌ Invalid total points after update: ${totalPoints} (must be 100)`
					);
					throw new ErrorResponse(
						`Total points must equal 100. Current total: ${totalPoints}`,
						400
					);
				}

				console.log(`✅ Points validation passed: ${totalPoints}/100`);
			}

			console.log(`💾 Updating test document...`);
			const test = await Test.findByIdAndUpdate(id, testData, {
				new: true,
				runValidators: true,
			});

			if (!test) {
				console.log(`❌ Test not found for update: ${id}`);
				throw new ErrorResponse(`Test not found with id of ${id}`, 404);
			}

			console.log(`✅ Test updated successfully: "${test.title}"`);

			if (testData.questions) {
				console.log(`📊 Updated question count: ${test.questions.length}`);
			}

			return test;
		} catch (error) {
			console.error(`💥 Error updating test ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 🗑️ Delete Test
	 *
	 * Permanently deletes a test from the database.
	 *
	 * @param {string} id - Test MongoDB ObjectId
	 * @returns {Promise<boolean>} Success confirmation
	 * @throws {ErrorResponse} 404 if test not found
	 *
	 * @example
	 * await testService.deleteTest('60d5ecb54e4b5c001f647c9a');
	 */
	async deleteTest(id) {
		console.log(`🗑️ Deleting test: ${id}`);

		try {
			const test = await Test.findById(id);

			if (!test) {
				console.log(`❌ Test not found for deletion: ${id}`);
				throw new ErrorResponse(`Test not found with id of ${id}`, 404);
			}

			console.log(`✅ Test found for deletion: "${test.title}"`);
			console.log(`📊 Questions to be deleted: ${test.questions?.length || 0}`);

			await test.deleteOne();

			console.log(`🗑️ Test deleted successfully`);

			return true;
		} catch (error) {
			console.error(`💥 Error deleting test ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 🎓 Get Tests by Grade
	 *
	 * Retrieves all published tests for a specific grade level.
	 *
	 * @param {string} gradeId - Grade MongoDB ObjectId
	 * @returns {Promise<Array>} Array of published tests for the grade
	 *
	 * @example
	 * const grade10Tests = await testService.getTestsByGrade(grade10Id);
	 */
	async getTestsByGrade(gradeId) {
		console.log(`🎓 Getting tests by grade: ${gradeId}`);

		try {
			const tests = await this.getTests({ grade: gradeId, isPublished: true });

			console.log(`✅ Found ${tests.length} published tests for grade`);

			return tests;
		} catch (error) {
			console.error(
				`💥 Error getting tests by grade ${gradeId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 📚 Get Tests by Subject
	 *
	 * Retrieves all published tests for a specific subject.
	 *
	 * @param {string} subjectId - Subject MongoDB ObjectId
	 * @returns {Promise<Array>} Array of published tests for the subject
	 *
	 * @example
	 * const mathTests = await testService.getTestsBySubject(mathSubjectId);
	 */
	async getTestsBySubject(subjectId) {
		console.log(`📚 Getting tests by subject: ${subjectId}`);

		try {
			const tests = await this.getTests({
				subject: subjectId,
				isPublished: true,
			});

			console.log(`✅ Found ${tests.length} published tests for subject`);

			return tests;
		} catch (error) {
			console.error(
				`💥 Error getting tests by subject ${subjectId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 👤 Get Tests by Creator
	 *
	 * Retrieves all tests created by a specific user (regardless of publication status).
	 *
	 * @param {string} creatorId - Creator user ObjectId
	 * @returns {Promise<Array>} Array of tests created by the user
	 *
	 * @example
	 * const myTests = await testService.getTestsByCreator(teacherId);
	 */
	async getTestsByCreator(creatorId) {
		console.log(`👤 Getting tests by creator: ${creatorId}`);

		try {
			const tests = await this.getTests({ creator: creatorId });

			console.log(`✅ Found ${tests.length} tests created by user`);

			return tests;
		} catch (error) {
			console.error(
				`💥 Error getting tests by creator ${creatorId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 📤 Publish Test
	 *
	 * Makes a test available to students by setting isPublished to true.
	 *
	 * @param {string} id - Test MongoDB ObjectId
	 * @returns {Promise<Object>} Updated test object
	 *
	 * @example
	 * await testService.publishTest('60d5ecb54e4b5c001f647c9a');
	 */
	async publishTest(id) {
		console.log(`📤 Publishing test: ${id}`);

		try {
			const test = await this.updateTest(id, { isPublished: true });

			console.log(`✅ Test published successfully: "${test.title}"`);

			return test;
		} catch (error) {
			console.error(`💥 Error publishing test ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 📥 Unpublish Test
	 *
	 * Removes a test from student availability by setting isPublished to false.
	 *
	 * @param {string} id - Test MongoDB ObjectId
	 * @returns {Promise<Object>} Updated test object
	 *
	 * @example
	 * await testService.unpublishTest('60d5ecb54e4b5c001f647c9a');
	 */
	async unpublishTest(id) {
		console.log(`📥 Unpublishing test: ${id}`);

		try {
			const test = await this.updateTest(id, { isPublished: false });

			console.log(`✅ Test unpublished successfully: "${test.title}"`);

			return test;
		} catch (error) {
			console.error(`💥 Error unpublishing test ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 📊 Get Student Performance Statistics
	 *
	 * Retrieves comprehensive performance statistics for a student including
	 * subject-specific analytics, trends, and recent test history.
	 *
	 * @param {string} studentId - Student user ObjectId
	 * @returns {Promise<Object>} Performance statistics object
	 * @throws {Error} If data retrieval fails
	 *
	 * @example
	 * const stats = await testService.getStudentPerformanceStats(studentId);
	 * console.log(`Overall average: ${stats.overallStats.averageScore}%`);
	 */
	async getStudentPerformanceStats(studentId) {
		console.log(`📊 Getting performance stats for student ${studentId}`);
		const startTime = Date.now();

		try {
			// Get all completed tests for this student
			console.log(`🔍 Retrieving completed tests...`);
			const completedTests = await StudentTest.find({
				student: studentId,
				status: "completed",
			})
				.populate({
					path: "scheduledTest",
					populate: {
						path: "test",
						populate: {
							path: "subject",
							select: "name",
						},
					},
				})
				.sort({ submittedAt: -1 });

			console.log(
				`✅ Found ${completedTests.length} completed tests for student ${studentId}`
			);

			// Log the subjects of completed tests
			const subjectNames = completedTests.map(
				(test) => test.scheduledTest?.test?.subject?.name || "Unknown"
			);
			console.log(`📚 Test subjects: ${[...new Set(subjectNames)].join(", ")}`);

			// Calculate overall stats
			const totalTests = completedTests.length;
			const totalScore = completedTests.reduce(
				(sum, test) => sum + test.score,
				0
			);
			const averageScore = totalTests > 0 ? totalScore / totalTests : 0;

			console.log(
				`📈 Overall stats: ${totalTests} tests, avg: ${averageScore.toFixed(
					2
				)}%`
			);

			// Get all subjects from the database
			const subjectService = require("./subject.service");
			const allSubjects = await subjectService.getAllSubjects();
			console.log(`📚 Found ${allSubjects.length} subjects in the system`);

			// Initialize subject scores map with all subjects
			const subjectScores = {};

			// First initialize with all subjects from database (even those without test data)
			allSubjects.forEach((subject) => {
				const subjectId = subject._id.toString();
				subjectScores[subjectId] = {
					id: subjectId,
					name: subject.name,
					totalScore: 0,
					testCount: 0,
					averageScore: 0,
					highestScore: 0,
					lowestScore: 0, // Changed from 100 to 0 for subjects without tests
					recentScores: [],
					hasData: false,
				};
			});

			// Process each test to gather subject data
			console.log(`🔄 Processing test data by subject...`);
			completedTests.forEach((test) => {
				const subject = test.scheduledTest?.test?.subject;
				if (subject && subject._id) {
					const subjectId = subject._id.toString();
					const subjectName = subject.name;

					// Update subject stats if not already initialized
					if (!subjectScores[subjectId]) {
						subjectScores[subjectId] = {
							id: subjectId,
							name: subjectName,
							totalScore: 0,
							testCount: 0,
							averageScore: 0,
							highestScore: 0,
							lowestScore: 100,
							recentScores: [],
							hasData: true,
						};
					}

					const stats = subjectScores[subjectId];
					stats.hasData = true;
					stats.testCount++;
					stats.totalScore += test.score;
					stats.averageScore = stats.totalScore / stats.testCount;
					stats.highestScore = Math.max(stats.highestScore, test.score);
					stats.lowestScore = Math.min(stats.lowestScore, test.score);
					stats.recentScores.push({
						score: test.score,
						date: test.submittedAt,
					});
				}
			});

			// Log subject performance summary
			const activeSubjects = Object.values(subjectScores).filter(
				(s) => s.hasData
			);
			console.log(
				`📊 Active subjects with test data: ${activeSubjects.length}`
			);
			activeSubjects.forEach((subject) => {
				console.log(
					`  📖 ${subject.name}: ${
						subject.testCount
					} tests, avg: ${subject.averageScore.toFixed(2)}%`
				);
			});

			const processingTime = Date.now() - startTime;
			console.log(`⚡ Performance stats calculated in ${processingTime}ms`);

			return {
				overallStats: {
					totalTestsTaken: totalTests,
					averageScore,
				},
				subjectPerformance: Object.values(subjectScores),
				recentTests: completedTests.slice(0, 5).map((test) => ({
					id: test._id,
					subject: test.scheduledTest?.test?.subject?.name || "Unknown",
					date: test.submittedAt,
					score: test.score,
				})),
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			console.error(
				`💥 Error getting student performance stats (${processingTime}ms):`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 📈 Get Optimized Student Performance Summary
	 *
	 * Retrieves student performance data using MongoDB aggregation for optimal
	 * performance. Includes trend analysis and efficient server-side processing.
	 *
	 * @param {string} studentId - Student user ObjectId
	 * @returns {Promise<Object>} Optimized performance summary object
	 * @throws {Error} If aggregation fails
	 *
	 * @example
	 * const summary = await testService.getStudentPerformanceSummary(studentId);
	 * console.log(`Best subject: ${summary.subjectPerformance[0].name}`);
	 */
	async getStudentPerformanceSummary(studentId) {
		console.log(
			`📈 Getting optimized performance summary for student ${studentId}`
		);
		const startTime = Date.now();

		try {
			// Convert string ID to MongoDB ObjectId
			console.log(`🔄 Converting student ID to ObjectId...`);
			const studentObjectId = mongoose.Types.ObjectId(studentId);

			// Use aggregation pipeline for efficient server-side processing
			console.log(`⚡ Starting MongoDB aggregation pipeline...`);
			const subjectPerformance = await StudentTest.aggregate([
				// Filter tests by student ID and only include completed tests
				{
					$match: {
						student: studentObjectId,
						status: "completed",
					},
				},
				// Group tests by subject
				{
					$lookup: {
						from: "scheduledtests",
						localField: "scheduledTest",
						foreignField: "_id",
						as: "scheduledTestDetails",
					},
				},
				{ $unwind: "$scheduledTestDetails" },
				{
					$lookup: {
						from: "tests",
						localField: "scheduledTestDetails.test",
						foreignField: "_id",
						as: "testDetails",
					},
				},
				{ $unwind: "$testDetails" },
				{
					$lookup: {
						from: "subjects",
						localField: "testDetails.subject",
						foreignField: "_id",
						as: "subjectInfo",
					},
				},
				{ $unwind: "$subjectInfo" },
				{
					$group: {
						_id: "$subjectInfo._id",
						name: { $first: "$subjectInfo.name" },
						testCount: { $sum: 1 },
						totalScore: { $sum: "$score" },
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
				// Project final fields
				{
					$project: {
						_id: 1,
						id: "$_id",
						name: 1,
						testCount: 1,
						averageScore: 1,
						highestScore: 1,
						lowestScore: 1,
						// Get up to 5 most recent tests
						recentScores: { $slice: ["$recentScores", -5] },
						hasData: { $gt: ["$testCount", 0] },
					},
				},
				// Sort by average score (highest first)
				{ $sort: { averageScore: -1 } },
			]);

			console.log(
				`📊 Aggregation completed: ${subjectPerformance.length} subjects with data`
			);

			// Calculate trends for each subject
			console.log(`📈 Calculating trends for each subject...`);
			const subjectsWithTrends = subjectPerformance.map((subject) => {
				// Sort recent scores by date (oldest first for trend calculation)
				const sortedScores = [...subject.recentScores].sort(
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

			// Calculate overall stats in a single query
			console.log(`📊 Calculating overall statistics...`);
			const overallStats = await StudentTest.aggregate([
				{
					$match: {
						student: studentObjectId,
						status: "completed",
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

			// Get all subjects to include even if no tests have been taken
			console.log(`📚 Loading all subjects for complete coverage...`);
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

			console.log(
				`📋 Total subjects included: ${allSubjectsData.length} (${
					allSubjects.length - existingSubjectIds.length
				} without data)`
			);

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

			// Get recent tests
			console.log(`⏰ Retrieving recent test history...`);
			const recentTests = await StudentTest.find({
				student: studentObjectId,
				status: "completed",
			})
				.sort({ submittedAt: -1 })
				.limit(5)
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

			const formattedRecentTests = recentTests.map((test) => ({
				id: test._id,
				subject: test.scheduledTest?.test?.subject?.name || "Unknown",
				date: test.submittedAt,
				score: test.score,
			}));

			const processingTime = Date.now() - startTime;
			console.log(
				`🎉 Optimized performance summary completed in ${processingTime}ms`
			);
			console.log(
				`📊 Summary: ${stats.totalTestsTaken} tests, avg: ${
					stats.averageScore?.toFixed(2) || 0
				}%`
			);
			console.log(
				`📈 Active subjects: ${subjectsWithTrends.length}, Total subjects: ${allSubjectsData.length}`
			);

			// Return combined data
			return {
				overallStats: stats,
				subjectPerformance: allSubjectsData,
				recentTests: formattedRecentTests,
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			console.error(
				`💥 Error getting optimized student performance summary (${processingTime}ms):`,
				error.message
			);
			throw error;
		}
	}
}

// Export singleton instance
module.exports = new TestService();

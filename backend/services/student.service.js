/**
 * 📚 Student Service Module
 *
 * Provides comprehensive student management functionality including:
 * - Student profile management and retrieval
 * - Academic performance tracking and statistics
 * - Exam result management and analysis
 * - Development test creation and scheduling
 * - Grade-based student operations
 *
 * Features:
 * - Student data with grade and exam result population
 * - Performance analytics by subject and overall
 * - Automatic test generation for development
 * - Grade-based student filtering
 * - Comprehensive error handling and logging
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const Student = require("../models/Student");
const Grade = require("../models/Grade");
const ScheduledTest = require("../models/ScheduledTest");
const Test = require("../models/Test");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const ErrorResponse = require("../utils/errorResponse");

/**
 * 🎓 StudentService Class
 *
 * Handles all student-related business logic including profile management,
 * academic performance tracking, and development utilities.
 */
class StudentService {
	/**
	 * 🔍 Retrieve Student by ID
	 *
	 * Fetches a student with populated grade and exam results data.
	 * Includes detailed exam history with test and subject information.
	 *
	 * @param {string} id - Student MongoDB ObjectId
	 * @returns {Promise<Object>} Student object with populated relationships
	 * @throws {ErrorResponse} 404 if student not found
	 *
	 * @example
	 * const student = await studentService.getStudentById('60d5ecb54e4b5c001f647c9a');
	 */
	async getStudentById(id) {
		console.log(`🔍 Retrieving student with ID: ${id}`);

		try {
			const student = await Student.findById(id)
				.populate("grade", "name level")
				.populate({
					path: "examResults",
					populate: {
						path: "test",
						select: "title subject",
						populate: {
							path: "subject",
							select: "name",
						},
					},
				});

			if (!student) {
				console.log(`❌ Student not found with ID: ${id}`);
				throw new ErrorResponse("Student not found", 404);
			}

			console.log(
				`✅ Student retrieved successfully: ${student.user || "Unknown"}`
			);
			console.log(
				`📊 Grade: ${student.grade?.name || "No grade"} (Level: ${
					student.grade?.level || "N/A"
				})`
			);
			console.log(`📈 Exam Results Count: ${student.examResults?.length || 0}`);

			return student;
		} catch (error) {
			console.error(`💥 Error retrieving student ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 📊 Calculate Student Performance Statistics
	 *
	 * Generates comprehensive performance analytics including overall stats
	 * and subject-specific breakdowns with averages, highs, and lows.
	 *
	 * @param {string} studentId - Student MongoDB ObjectId
	 * @returns {Promise<Object>} Performance statistics object
	 * @throws {ErrorResponse} If student not found
	 *
	 * @example
	 * const stats = await studentService.getStudentStats('60d5ecb54e4b5c001f647c9a');
	 * console.log(stats.overall.averageScore); // Overall average
	 * console.log(stats.bySubject.Mathematics.averageScore); // Math average
	 */
	async getStudentStats(studentId) {
		console.log(
			`📊 Calculating performance statistics for student: ${studentId}`
		);
		const startTime = Date.now();

		try {
			const student = await this.getStudentById(studentId);

			// Calculate overall performance metrics
			const totalExams = student.examResults.length;
			console.log(`📝 Total exams taken: ${totalExams}`);

			const averageScore =
				totalExams > 0
					? student.examResults.reduce((acc, result) => acc + result.score, 0) /
					  totalExams
					: 0;

			console.log(`🎯 Overall average score: ${averageScore.toFixed(2)}%`);

			// Initialize subject-specific statistics tracking
			const subjectStats = {};
			let subjectCount = 0;

			// Process each exam result for subject analytics
			student.examResults.forEach((result) => {
				const subjectName = result.test.subject.name;

				if (!subjectStats[subjectName]) {
					subjectStats[subjectName] = {
						totalExams: 0,
						totalScore: 0,
						averageScore: 0,
						highestScore: 0,
						lowestScore: 100,
					};
					subjectCount++;
				}

				const stats = subjectStats[subjectName];
				stats.totalExams++;
				stats.totalScore += result.score;
				stats.averageScore = stats.totalScore / stats.totalExams;
				stats.highestScore = Math.max(stats.highestScore, result.score);
				stats.lowestScore = Math.min(stats.lowestScore, result.score);
			});

			console.log(`📚 Subjects analyzed: ${subjectCount}`);

			// Log subject performance summary
			Object.entries(subjectStats).forEach(([subject, stats]) => {
				console.log(
					`  📖 ${subject}: ${
						stats.totalExams
					} exams, avg: ${stats.averageScore.toFixed(2)}%`
				);
			});

			const processingTime = Date.now() - startTime;
			console.log(`⚡ Statistics calculated in ${processingTime}ms`);

			return {
				overall: {
					totalExams,
					averageScore,
					recentExams: student.examResults.slice(-5),
				},
				bySubject: subjectStats,
			};
		} catch (error) {
			console.error(
				`💥 Error calculating stats for student ${studentId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 📝 Update Student Exam Results
	 *
	 * Adds a new exam result to the student's academic record.
	 * Maintains chronological order of exam history.
	 *
	 * @param {string} studentId - Student MongoDB ObjectId
	 * @param {Object} examResult - Exam result data to add
	 * @param {string} examResult.test - Test ID reference
	 * @param {number} examResult.score - Score achieved (0-100)
	 * @param {Date} examResult.dateTaken - When exam was taken
	 * @returns {Promise<Object>} Updated student object
	 * @throws {ErrorResponse} 404 if student not found
	 *
	 * @example
	 * const result = { test: testId, score: 85, dateTaken: new Date() };
	 * await studentService.updateStudentExamResults(studentId, result);
	 */
	updateStudentExamResults = async (studentId, examResult) => {
		console.log(`📝 Adding exam result for student: ${studentId}`);
		console.log(`🎯 Score: ${examResult.score}%, Test: ${examResult.test}`);

		try {
			const student = await Student.findById(studentId);
			if (!student) {
				console.log(`❌ Student not found: ${studentId}`);
				throw new ErrorResponse("Student not found", 404);
			}

			// Add the new exam result
			student.examResults.push(examResult);
			await student.save();

			console.log(`✅ Exam result added successfully`);
			console.log(`📊 Total exam results: ${student.examResults.length}`);

			return student;
		} catch (error) {
			console.error(
				`💥 Error updating exam results for student ${studentId}:`,
				error.message
			);
			throw error;
		}
	};

	/**
	 * 🎓 Get Students by Grade
	 *
	 * Retrieves all students enrolled in a specific grade level.
	 * Includes user and grade information for each student.
	 *
	 * @param {string} gradeId - Grade MongoDB ObjectId
	 * @returns {Promise<Array>} Array of student objects with populated data
	 *
	 * @example
	 * const grade10Students = await studentService.getStudentsByGrade(grade10Id);
	 * console.log(`Found ${grade10Students.length} students in Grade 10`);
	 */
	getStudentsByGrade = async (gradeId) => {
		console.log(`🎓 Retrieving students for grade: ${gradeId}`);

		try {
			const students = await Student.find({ grade: gradeId })
				.populate("user", "name email")
				.populate("grade", "name");

			console.log(`✅ Found ${students.length} students in grade`);

			if (students.length > 0) {
				console.log(`📚 Grade: ${students[0].grade?.name || "Unknown"}`);
				students.forEach((student, index) => {
					console.log(
						`  👤 ${index + 1}. ${student.user?.name || "Unknown"} (${
							student.user?.email || "No email"
						})`
					);
				});
			}

			return students;
		} catch (error) {
			console.error(
				`💥 Error retrieving students for grade ${gradeId}:`,
				error.message
			);
			throw error;
		}
	};

	/**
	 * 🧪 Development: Ensure Available Test for Student
	 *
	 * Development utility to ensure a student has an available test.
	 * Can check for existing tests or force-create new ones for testing purposes.
	 * Automatically generates math questions and schedules tests when needed.
	 *
	 * @param {string} studentId - Student user ID (not Student model ID)
	 * @param {Object} options - Configuration options
	 * @param {boolean} options.forceCreate - Force creation of new test even if one exists
	 * @returns {Promise<Object|null>} Test availability result or null if none found
	 * @throws {ErrorResponse} If student not found or creation fails
	 *
	 * @example
	 * // Check for existing test
	 * const result = await studentService.ensureUpcomingTest(userId);
	 *
	 * // Force create new test
	 * const newTest = await studentService.ensureUpcomingTest(userId, { forceCreate: true });
	 */
	async ensureUpcomingTest(studentId, options = {}) {
		console.log(`🧪 [DEV] Ensuring upcoming test for student: ${studentId}`);
		console.log(`⚙️ Options:`, JSON.stringify(options, null, 2));
		const startTime = Date.now();

		try {
			// Retrieve student with grade information
			console.log(`🔍 Looking up student profile...`);
			const student = await Student.findOne({ user: studentId }).populate(
				"grade"
			);

			if (!student) {
				console.log(`❌ Student not found with user ID: ${studentId}`);
				throw new ErrorResponse(
					`Student not found with user id ${studentId}`,
					404
				);
			}

			console.log(
				`✅ Student found: Grade ${student.grade?.name || "Unknown"} (Level: ${
					student.grade?.level || "N/A"
				})`
			);

			// Check for existing available tests (unless forcing creation)
			if (!options.forceCreate) {
				console.log(`🔍 Checking for existing available tests...`);
				const now = new Date();

				// Look for ongoing tests (started but not ended)
				const existingTest = await ScheduledTest.findOne({
					grade: student.grade._id,
					status: "scheduled",
					// Test has started (scheduled time is in the past)
					scheduledAt: { $lte: now },
					// Test has not ended (scheduled time + duration > now)
					$expr: {
						$gt: [
							{
								$add: [
									"$scheduledAt",
									{ $multiply: ["$duration", 60000] }, // Convert duration from minutes to milliseconds
								],
							},
							now,
						],
					},
				}).populate({
					path: "test",
					select: "title subject questions duration",
					populate: {
						path: "subject",
						select: "name",
					},
				});

				if (existingTest) {
					const endTime = new Date(
						existingTest.scheduledAt.getTime() + existingTest.duration * 60000
					);
					console.log(`✅ Found existing test: ${existingTest._id}`);
					console.log(
						`📝 Test: "${existingTest.test?.title || "Unknown"}" (${
							existingTest.test?.subject?.name || "Unknown subject"
						})`
					);
					console.log(
						`⏰ Started: ${existingTest.scheduledAt.toLocaleString()}`
					);
					console.log(`⏱️ Ends: ${endTime.toLocaleString()}`);
					console.log(
						`⌛ Remaining: ${Math.round((endTime - now) / (1000 * 60))} minutes`
					);

					return {
						hasExistingTest: true,
						test: existingTest,
					};
				}

				console.log(`🔍 No existing available test found`);
			} else {
				console.log(`🔧 Force creation enabled - skipping existing test check`);
			}

			// Return null if not forcing creation and no existing test found
			if (!options.forceCreate) {
				console.log(
					`⚠️ No existing test found and automatic creation not requested`
				);
				return null;
			}

			// Proceed with test creation
			console.log(`🏗️ Creating new test automatically...`);

			// Import development configuration
			const devConfig = require("../config/development");
			console.log(`⚙️ Loaded development config`);

			// Find a teacher or admin to assign as test creator
			console.log(`👨‍🏫 Looking for teacher/admin to assign as test creator...`);
			const User = require("../models/User");
			const teacher = await User.findOne({
				role: { $in: ["teacher", "admin"] },
			});

			if (!teacher) {
				console.log(`❌ No teacher or admin found`);
				throw new ErrorResponse(
					"No teacher or admin found to assign as test creator",
					404
				);
			}

			console.log(`✅ Found creator: ${teacher.name} (${teacher.role})`);

			// Get or create Mathematics subject
			console.log(`📚 Setting up Mathematics subject...`);
			let subject = await Subject.findOne({ name: "Mathematics" });
			if (!subject) {
				console.log(`📚 Creating new Mathematics subject...`);
				subject = await Subject.create({ name: "Mathematics" });
			}
			console.log(`✅ Subject ready: ${subject.name} (ID: ${subject._id})`);

			// Prepare question data for math quiz
			console.log(`❓ Preparing math questions...`);
			const questionData = [
				{
					body: "What is 2 + 2?",
					type: "multiple-choice",
					difficulty: "easy",
					options: [
						{ text: "3", isCorrect: false },
						{ text: "4", isCorrect: true },
						{ text: "5", isCorrect: false },
						{ text: "6", isCorrect: false },
					],
					answers: [
						{
							body: "4",
							isCorrect: true,
							isOpenEnded: false,
						},
					],
					isMultiAnswer: false,
					isTextAnswer: false,
					gradeSubjects: [
						{
							grade: student.grade._id,
							subject: subject._id,
						},
					],
					user: teacher._id,
				},
				{
					body: "What is 5 × 5?",
					type: "multiple-choice",
					difficulty: "easy",
					options: [
						{ text: "15", isCorrect: false },
						{ text: "20", isCorrect: false },
						{ text: "25", isCorrect: true },
						{ text: "30", isCorrect: false },
					],
					answers: [
						{
							body: "25",
							isCorrect: true,
							isOpenEnded: false,
						},
					],
					isMultiAnswer: false,
					isTextAnswer: false,
					gradeSubjects: [
						{
							grade: student.grade._id,
							subject: subject._id,
						},
					],
					user: teacher._id,
				},
				{
					body: "What is 10 - 3?",
					type: "multiple-choice",
					difficulty: "easy",
					options: [
						{ text: "5", isCorrect: false },
						{ text: "6", isCorrect: false },
						{ text: "7", isCorrect: true },
						{ text: "8", isCorrect: false },
					],
					answers: [
						{
							body: "7",
							isCorrect: true,
							isOpenEnded: false,
						},
					],
					isMultiAnswer: false,
					isTextAnswer: false,
					gradeSubjects: [
						{
							grade: student.grade._id,
							subject: subject._id,
						},
					],
					user: teacher._id,
				},
				{
					body: "What is 4 × 4?",
					type: "multiple-choice",
					difficulty: "easy",
					options: [
						{ text: "12", isCorrect: false },
						{ text: "14", isCorrect: false },
						{ text: "16", isCorrect: true },
						{ text: "18", isCorrect: false },
					],
					answers: [
						{
							body: "16",
							isCorrect: true,
							isOpenEnded: false,
						},
					],
					isMultiAnswer: false,
					isTextAnswer: false,
					gradeSubjects: [
						{
							grade: student.grade._id,
							subject: subject._id,
						},
					],
					user: teacher._id,
				},
			];

			// Create or find questions
			console.log(`🔄 Creating/finding ${questionData.length} questions...`);
			const questions = await Promise.all(
				questionData.map(async (q, index) => {
					console.log(`  📝 Processing question ${index + 1}: "${q.body}"`);
					const question = await Question.findOneAndUpdate(
						{ body: q.body },
						q,
						{
							upsert: true,
							new: true,
						}
					);
					console.log(`    ✅ Question ready: ${question._id}`);
					return {
						question: question._id,
						points: 25, // Each question worth 25 points (total 100)
					};
				})
			);

			console.log(`✅ All questions prepared successfully`);

			// Create the test
			console.log(`📋 Creating test...`);
			const testTime = new Date();
			const testDuration = devConfig?.autoTestDuration || 30;
			const titlePrefix = devConfig?.autoTestTitlePrefix
				? `${devConfig.autoTestTitlePrefix}: `
				: "";

			const testData = {
				title: `${titlePrefix}Math Quiz (${testTime.toLocaleTimeString()})`,
				description: "A quick test of basic arithmetic operations",
				grade: student.grade._id,
				subject: subject._id,
				questions: questions,
				totalPoints: 100,
				comments:
					"This test was automatically generated and is available immediately",
				user: teacher._id,
				duration: testDuration,
				isPublished: true,
			};

			const test = await Test.create(testData);
			console.log(`✅ Test created: ${test._id} - "${test.title}"`);
			console.log(`⏱️ Duration: ${testDuration} minutes`);
			console.log(
				`📊 Questions: ${questions.length} (${test.totalPoints} points total)`
			);

			// Schedule the test to start immediately
			console.log(`📅 Scheduling test to start immediately...`);
			const scheduledAt = new Date();
			const endTime = new Date(scheduledAt.getTime() + testDuration * 60000);

			const scheduledTest = await ScheduledTest.create({
				test: test._id,
				grade: student.grade._id,
				teacher: teacher._id,
				scheduledAt,
				duration: testDuration,
				status: "scheduled",
			});

			const processingTime = Date.now() - startTime;
			console.log(`🎉 Test creation completed successfully!`);
			console.log(`📋 Scheduled Test ID: ${scheduledTest._id}`);
			console.log(`⏰ Started: ${scheduledAt.toLocaleString()}`);
			console.log(`⏱️ Ends: ${endTime.toLocaleString()}`);
			console.log(`🚀 Total processing time: ${processingTime}ms`);

			return {
				hasExistingTest: false,
				test: scheduledTest,
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			console.error(
				`💥 Error ensuring upcoming test (${processingTime}ms):`,
				error.message
			);
			console.error(`🔍 Student ID: ${studentId}`);
			console.error(`⚙️ Options:`, JSON.stringify(options, null, 2));
			throw error;
		}
	}

	/**
	 * 🧪 Get All Available Tests for Student
	 *
	 * Retrieves all currently available tests for a student based on their grade.
	 * Returns tests that are scheduled, have started, and haven't ended yet.
	 *
	 * @param {string} studentId - Student user ID
	 * @returns {Promise<Array>} Array of available scheduled tests
	 */
	async getAllAvailableTests(studentId) {
		console.log(`🔍 Getting all available tests for student: ${studentId}`);

		try {
			// Retrieve student with grade information
			const student = await Student.findOne({ user: studentId }).populate(
				"grade"
			);

			if (!student) {
				console.log(`❌ Student not found with user ID: ${studentId}`);
				throw new ErrorResponse(
					`Student not found with user id ${studentId}`,
					404
				);
			}

			console.log(
				`✅ Student found: Grade ${student.grade?.name || "Unknown"} (Level: ${
					student.grade?.level || "N/A"
				})`
			);

			const now = new Date();

			// Look for all ongoing tests (started but not ended)
			const availableTests = await ScheduledTest.find({
				grade: student.grade._id,
				status: "scheduled",
				// Test has started (scheduled time is in the past)
				scheduledAt: { $lte: now },
				// Test has not ended (scheduled time + duration > now)
				$expr: {
					$gt: [
						{
							$add: [
								"$scheduledAt",
								{ $multiply: ["$duration", 60000] }, // Convert duration from minutes to milliseconds
							],
						},
						now,
					],
				},
			}).populate({
				path: "test",
				select: "title subject questions duration",
				populate: {
					path: "subject",
					select: "name",
				},
			});

			console.log(`🎯 Found ${availableTests.length} available tests`);

			// Log details for each test
			availableTests.forEach((test, index) => {
				const endTime = new Date(
					test.scheduledAt.getTime() + test.duration * 60000
				);
				console.log(
					`📝 Test ${index + 1}: "${test.test?.title || "Unknown"}" (${
						test.test?.subject?.name || "Unknown subject"
					})`
				);
				console.log(`⏰ Started: ${test.scheduledAt.toLocaleString()}`);
				console.log(`⏱️ Ends: ${endTime.toLocaleString()}`);
				console.log(
					`⌛ Remaining: ${Math.round((endTime - now) / (1000 * 60))} minutes`
				);
			});

			return availableTests;
		} catch (error) {
			console.error(
				`💥 Error getting available tests for student ${studentId}:`,
				error.message
			);
			throw error;
		}
	}
}

// Export singleton instance
module.exports = new StudentService();

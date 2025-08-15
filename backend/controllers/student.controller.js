/**
 * Student Controller
 * Handles student-specific operations and academic records management
 *
 * Features:
 * - Student profile management
 * - Exam results tracking and updates
 * - Grade-based student queries
 * - Student performance statistics
 * - Academic progress monitoring
 *
 * @module controllers/student.controller
 * @author Exemind-AI Team
 */

const studentService = require("../services/student.service");
const asyncHandler = require("../middleware/async");

/**
 * Get student by ID with detailed information
 * Returns complete student profile and academic data
 *
 * @desc    Get student by ID
 * @route   GET /api/students/:id
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getStudent = asyncHandler(async (req, res) => {
	console.log("\n👨‍🎓 =============== GET STUDENT ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Requester: ${req.user?.name} (${req.user?.role})`);
	console.log(`🎯 Student ID: ${req.params.id}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔍 Fetching student details...`);

		const student = await studentService.getStudentById(req.params.id);

		console.log(`✅ Student retrieved successfully`);
		console.log(`   👤 Name: ${student.user?.name || "N/A"}`);
		console.log(`   📧 Email: ${student.user?.email || "N/A"}`);
		console.log(`   🎓 Grade: ${student.grade?.name || "N/A"}`);
		console.log(`   📊 Exam Records: ${student.examResults?.length || 0}`);
		console.log("👨‍🎓 =========================================\n");

		res.status(200).json({
			success: true,
			data: student,
			meta: {
				examRecordsCount: student.examResults?.length || 0,
				lastAccessed: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error(`❌ Failed to get student ${req.params.id}:`, error.message);
		console.log("👨‍🎓 =========================================\n");
		throw error;
	}
});

/**
 * Update student exam results
 * Records new exam performance and updates academic records
 *
 * @desc    Update student exam results
 * @route   PUT /api/students/:id/exam-results
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.updateExamResults = asyncHandler(async (req, res) => {
	console.log("\n📊 =============== UPDATE EXAM RESULTS ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Updater: ${req.user?.name} (${req.user?.role})`);
	console.log(`🎯 Student ID: ${req.params.id}`);
	console.log(`📝 New Results: ${JSON.stringify(req.body)}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔄 Updating student exam results...`);

		const student = await studentService.updateStudentExamResults(
			req.params.id,
			req.body
		);

		console.log(`✅ Exam results updated successfully`);
		console.log(`   👤 Student: ${student.user?.name || "N/A"}`);
		console.log(
			`   📊 Total exam records: ${student.examResults?.length || 0}`
		);
		console.log(`   📈 Latest score: ${req.body.score || "N/A"}%`);
		console.log(`   📚 Subject: ${req.body.subject || "N/A"}`);
		console.log("📊 ===============================================\n");

		res.status(200).json({
			success: true,
			data: student,
			message: "Exam results updated successfully",
			meta: {
				updatedAt: new Date().toISOString(),
				totalExamResults: student.examResults?.length || 0,
			},
		});
	} catch (error) {
		console.error(
			`❌ Failed to update exam results for student ${req.params.id}:`,
			error.message
		);
		console.log("📊 ===============================================\n");
		throw error;
	}
});

/**
 * Get students by grade
 * Returns all students enrolled in a specific grade
 *
 * @desc    Get students by grade
 * @route   GET /api/students/grade/:gradeId
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getStudentsByGrade = asyncHandler(async (req, res) => {
	console.log("\n🎓 =============== GET STUDENTS BY GRADE ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Requester: ${req.user?.name} (${req.user?.role})`);
	console.log(`🎯 Grade ID: ${req.params.gradeId}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔍 Fetching students for grade...`);

		const students = await studentService.getStudentsByGrade(
			req.params.gradeId
		);

		console.log(`✅ Students retrieved successfully`);
		console.log(`   📊 Students found: ${students.length}`);
		console.log(`   🎓 Grade ID: ${req.params.gradeId}`);

		// Log student distribution info
		if (students.length > 0) {
			const avgExamResults =
				students.reduce(
					(sum, student) => sum + (student.examResults?.length || 0),
					0
				) / students.length;
			console.log(
				`   📈 Average exam records per student: ${avgExamResults.toFixed(1)}`
			);
		}
		console.log("🎓 ===============================================\n");

		res.status(200).json({
			success: true,
			data: students,
			meta: {
				count: students.length,
				gradeId: req.params.gradeId,
				averageExamRecords:
					students.length > 0
						? (
								students.reduce(
									(sum, student) => sum + (student.examResults?.length || 0),
									0
								) / students.length
						  ).toFixed(1)
						: 0,
			},
		});
	} catch (error) {
		console.error(
			`❌ Failed to get students for grade ${req.params.gradeId}:`,
			error.message
		);
		console.log("🎓 ===============================================\n");
		throw error;
	}
});

/**
 * Get student performance statistics
 * Returns comprehensive analytics about student academic performance
 *
 * @desc    Get student statistics
 * @route   GET /api/students/:id/stats
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getStudentStats = asyncHandler(async (req, res) => {
	console.log("\n📈 =============== GET STUDENT STATS ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Requester: ${req.user?.name} (${req.user?.role})`);
	console.log(`🎯 Student ID: ${req.params.id}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`📊 Generating student performance statistics...`);

		const stats = await studentService.getStudentStats(req.params.id);

		console.log(`✅ Student statistics generated successfully`);
		console.log(`   👤 Student ID: ${req.params.id}`);
		console.log(`   📊 Stats overview:`);
		console.log(`     📝 Total exams: ${stats.totalExams || 0}`);
		console.log(`     📈 Average score: ${stats.averageScore || 0}%`);
		console.log(`     🏆 Best score: ${stats.bestScore || 0}%`);
		console.log(`     📉 Lowest score: ${stats.lowestScore || 0}%`);
		console.log(`     📚 Subjects covered: ${stats.subjectCount || 0}`);
		console.log("📈 ============================================\n");

		res.status(200).json({
			success: true,
			data: stats,
			meta: {
				generatedAt: new Date().toISOString(),
				studentId: req.params.id,
				dataType: "performance_analytics",
			},
		});
	} catch (error) {
		console.error(
			`❌ Failed to get statistics for student ${req.params.id}:`,
			error.message
		);
		console.log("📈 ============================================\n");
		throw error;
	}
});

/**
 * Grade Controller
 * Handles grade management and student-grade association operations for Exemind-AI
 *
 * Features:
 * - Grade listing with student counts
 * - Student enrollment and transfers between grades
 * - Grade-specific student analytics
 * - Academic level management
 *
 * @module controllers/grade.controller
 * @author Exemind-AI Team
 */

const Grade = require("../models/Grade");
const User = require("../models/User");
const Student = require("../models/Student");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

/**
 * Get all grades with student counts
 * Returns complete list of grades with enrollment statistics
 *
 * @desc    Get all grades
 * @route   GET /api/grades
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getGrades = async (req, res, next) => {
	console.log("\n🎓 =============== GET GRADES ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(
		`👤 User: ${req.user?.name || "Anonymous"} (${req.user?.role || "Public"})`
	);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔄 Fetching all grades with student counts...`);

		// First get all grades sorted by level
		const grades = await Grade.find().sort({ level: 1 });
		console.log(`   ✅ Found ${grades.length} grades`);

		// Then get student counts for each grade using the Student model
		console.log(`   📊 Calculating student counts for each grade...`);
		const gradesWithCounts = await Promise.all(
			grades.map(async (grade) => {
				const studentCount = await Student.countDocuments({
					grade: grade._id,
				});
				console.log(`     🎓 ${grade.name}: ${studentCount} students`);
				return {
					...grade.toObject(),
					studentCount,
				};
			})
		);

		const totalStudents = gradesWithCounts.reduce(
			(sum, grade) => sum + grade.studentCount,
			0
		);

		console.log(`✅ Grades data compiled successfully`);
		console.log(`   📈 Total grades: ${grades.length}`);
		console.log(`   👨‍🎓 Total students: ${totalStudents}`);
		console.log(
			`   📊 Average students per grade: ${
				Math.round(totalStudents / grades.length) || 0
			}`
		);
		console.log("🎓 =========================================\n");

		res.status(200).json({
			success: true,
			count: grades.length,
			data: gradesWithCounts,
			meta: {
				totalStudents,
				averageStudentsPerGrade: Math.round(totalStudents / grades.length) || 0,
			},
		});
	} catch (error) {
		console.error(`❌ Failed to get grades:`, error.message);
		console.log("🎓 =========================================\n");
		next(error);
	}
};

/**
 * Get student counts aggregated by grade
 * Provides optimized student distribution analytics
 *
 * @desc    Get student counts for all grades
 * @route   GET /api/grades/student-counts
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getStudentCountsByGrade = asyncHandler(async (req, res, next) => {
	console.log("\n📊 =============== STUDENT COUNTS BY GRADE ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Admin User: ${req.user?.name} (${req.user?.role})`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔄 Starting student count aggregation...`);

		// Get all grades
		console.log(`   📚 Fetching all grades...`);
		const grades = await Grade.find();
		console.log(`   ✅ Found ${grades.length} grades`);

		// Create a map to store grade ID -> student count
		const studentCountMap = {};

		// Use aggregate to count students per grade for better performance
		console.log(`   📊 Aggregating student counts using MongoDB pipeline...`);
		const studentCountsAgg = await Student.aggregate([
			{
				$group: {
					_id: "$grade",
					count: { $sum: 1 },
				},
			},
		]);

		console.log(
			`   ✅ Aggregation completed: ${studentCountsAgg.length} grade groups found`
		);

		// Convert the aggregation results to a map
		studentCountsAgg.forEach((item) => {
			if (item._id) {
				studentCountMap[item._id.toString()] = item.count;
				console.log(`     📊 Grade ${item._id}: ${item.count} students`);
			}
		});

		// Create the final result with grade info and counts
		console.log(`   🔗 Merging grade information with student counts...`);
		const result = grades.map((grade) => {
			const gradeId = grade._id.toString();
			const studentCount = studentCountMap[gradeId] || 0;
			return {
				_id: gradeId,
				name: grade.name,
				level: grade.level,
				studentCount,
			};
		});

		const totalStudents = result.reduce(
			(sum, grade) => sum + grade.studentCount,
			0
		);
		const maxEnrollment = Math.max(...result.map((g) => g.studentCount));
		const minEnrollment = Math.min(...result.map((g) => g.studentCount));

		console.log(`✅ Student counts by grade compiled successfully`);
		console.log(`   📈 Total students across all grades: ${totalStudents}`);
		console.log(
			`   📊 Enrollment range: ${minEnrollment} - ${maxEnrollment} students`
		);
		console.log(
			`   🎯 Most enrolled grade: ${
				result.find((g) => g.studentCount === maxEnrollment)?.name || "N/A"
			}`
		);
		console.log("📊 =====================================================\n");

		res.status(200).json({
			success: true,
			data: result,
			meta: {
				totalStudents,
				maxEnrollment,
				minEnrollment,
				gradesCount: grades.length,
			},
		});
	} catch (error) {
		console.error(`❌ Failed to get student counts:`, error.message);
		console.log("📊 =====================================================\n");
		next(error);
	}
});

/**
 * Get grade with populated student information
 * Returns detailed grade data including enrolled students
 *
 * @desc    Get grade with students
 * @route   GET /api/grades/:id/students
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getGradeWithStudents = asyncHandler(async (req, res, next) => {
	console.log("\n🎓 =============== GET GRADE WITH STUDENTS ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 User: ${req.user?.name} (${req.user?.role})`);
	console.log(`🎯 Grade ID: ${req.params.id}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔍 Fetching grade with populated student data...`);

		const grade = await Grade.findById(req.params.id).populate({
			path: "students",
			populate: {
				path: "user",
				select: "name email role",
			},
		});

		if (!grade) {
			console.log(`❌ Grade not found: ${req.params.id}`);
			return next(
				new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404)
			);
		}

		console.log(`✅ Grade retrieved successfully`);
		console.log(`   🎓 Grade: ${grade.name} (Level: ${grade.level})`);
		console.log(`   👨‍🎓 Students enrolled: ${grade.students?.length || 0}`);
		console.log(
			`   📊 Student details: ${
				grade.students?.length ? "Available" : "No students"
			}`
		);
		console.log("🎓 =================================================\n");

		res.status(200).json({
			success: true,
			data: grade,
			meta: {
				studentsCount: grade.students?.length || 0,
				gradeLevel: grade.level,
			},
		});
	} catch (error) {
		console.error(`❌ Failed to get grade with students:`, error.message);
		console.log("🎓 =================================================\n");
		next(error);
	}
});

/**
 * Add new student to a grade
 * Creates student user account and enrolls them in specified grade
 *
 * @desc    Add student to grade
 * @route   POST /api/grades/:id/students
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.addStudentToGrade = asyncHandler(async (req, res, next) => {
	console.log("\n👨‍🎓 =============== ADD STUDENT TO GRADE ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Admin User: ${req.user?.name} (${req.user?.role})`);
	console.log(`🎯 Grade ID: ${req.params.id}`);
	console.log(`📧 Student Email: ${req.body.email}`);
	console.log(`👤 Student Name: ${req.body.name}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔍 Verifying grade exists...`);
		const grade = await Grade.findById(req.params.id);

		if (!grade) {
			console.log(`❌ Grade not found: ${req.params.id}`);
			return next(
				new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404)
			);
		}

		console.log(`✅ Grade found: ${grade.name} (Level: ${grade.level})`);

		const { name, email, studentId } = req.body;

		console.log(`🔄 Creating student user account...`);
		console.log(`   📧 Email: ${email}`);
		console.log(`   🆔 Student ID: ${studentId || "Auto-generated"}`);

		// Create student user
		const student = await User.create({
			name,
			email,
			studentId,
			password: "changeme123", // Default password - should be changed on first login
			role: "student",
		});

		console.log(`✅ Student user created with ID: ${student._id}`);

		// Add student to grade
		console.log(`🔗 Enrolling student in grade...`);
		grade.students.push(student._id);
		await grade.save();

		console.log(`✅ Student enrollment completed successfully`);
		console.log(`   👤 Student: ${student.name} (${student.email})`);
		console.log(`   🎓 Enrolled in: ${grade.name}`);
		console.log(`   📊 Grade now has: ${grade.students.length} students`);
		console.log("👨‍🎓 ===============================================\n");

		res.status(201).json({
			success: true,
			data: student,
			message: `Student ${name} successfully enrolled in ${grade.name}`,
			meta: {
				gradeStudentsCount: grade.students.length,
				defaultPassword: "changeme123",
			},
		});
	} catch (error) {
		console.error(`❌ Failed to add student to grade:`, error.message);
		console.log("👨‍🎓 ===============================================\n");
		next(error);
	}
});

/**
 * Transfer student between grades
 * Moves student enrollment from one grade to another
 *
 * @desc    Transfer student between grades
 * @route   POST /api/grades/transfer-student
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.transferStudent = asyncHandler(async (req, res, next) => {
	console.log("\n🔄 =============== TRANSFER STUDENT ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Admin User: ${req.user?.name} (${req.user?.role})`);
	console.log(`👨‍🎓 Student ID: ${req.body.studentId}`);
	console.log(`📤 From Grade: ${req.body.fromGradeId}`);
	console.log(`📥 To Grade: ${req.body.toGradeId}`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		const { studentId, fromGradeId, toGradeId } = req.body;

		console.log(`🔍 Validating source grade...`);
		// Remove from old grade
		const fromGrade = await Grade.findById(fromGradeId);
		if (!fromGrade) {
			console.log(`❌ Source grade not found: ${fromGradeId}`);
			return next(new ErrorResponse(`Source grade not found`, 404));
		}
		console.log(
			`   ✅ Source grade: ${fromGrade.name} (${fromGrade.students.length} students)`
		);

		console.log(`🔍 Validating target grade...`);
		// Add to new grade
		const toGrade = await Grade.findById(toGradeId);
		if (!toGrade) {
			console.log(`❌ Target grade not found: ${toGradeId}`);
			return next(new ErrorResponse(`Target grade not found`, 404));
		}
		console.log(
			`   ✅ Target grade: ${toGrade.name} (${toGrade.students.length} students)`
		);

		console.log(`🔄 Removing student from source grade...`);
		const originalFromCount = fromGrade.students.length;
		fromGrade.students = fromGrade.students.filter(
			(id) => id.toString() !== studentId
		);
		await fromGrade.save();
		console.log(
			`   ✅ Removed from ${fromGrade.name} (${originalFromCount} → ${fromGrade.students.length} students)`
		);

		console.log(`🔄 Adding student to target grade...`);
		const originalToCount = toGrade.students.length;
		toGrade.students.push(studentId);
		await toGrade.save();
		console.log(
			`   ✅ Added to ${toGrade.name} (${originalToCount} → ${toGrade.students.length} students)`
		);

		console.log(`✅ Student transfer completed successfully`);
		console.log(`   👨‍🎓 Student ID: ${studentId}`);
		console.log(`   🔄 Transfer: ${fromGrade.name} → ${toGrade.name}`);
		console.log(`   📊 Enrollment changes: -1 source, +1 target`);
		console.log("🔄 ============================================\n");

		res.status(200).json({
			success: true,
			message: "Student transferred successfully",
			data: {
				studentId,
				fromGrade: {
					id: fromGradeId,
					name: fromGrade.name,
					newStudentCount: fromGrade.students.length,
				},
				toGrade: {
					id: toGradeId,
					name: toGrade.name,
					newStudentCount: toGrade.students.length,
				},
			},
		});
	} catch (error) {
		console.error(`❌ Failed to transfer student:`, error.message);
		console.log("🔄 ============================================\n");
		next(error);
	}
});

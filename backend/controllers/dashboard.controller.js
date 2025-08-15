/**
 * Dashboard Controller
 * Handles dashboard analytics and statistics for Exemind-AI admin panel
 *
 * Features:
 * - Comprehensive system statistics aggregation
 * - User analytics and demographics
 * - Question bank analytics by subject and grade
 * - Test statistics and activity tracking
 * - Grade-wise student distribution
 * - Recent activity feeds
 *
 * @module controllers/dashboard.controller
 * @author Exemind-AI Team
 */

const userService = require("../services/user.service");
const questionService = require("../services/question.service");
const testService = require("../services/test.service");
const gradeService = require("../services/grade.service");
const Student = require("../models/Student");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Get comprehensive dashboard statistics
 * Aggregates data from multiple services to provide admin overview
 *
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.getDashboardStats = async (req, res, next) => {
	console.log("\n📊 =============== DASHBOARD STATS ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 Admin User: ${req.user?.name} (${req.user?.role})`);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔄 Starting dashboard data aggregation...`);
		const startTime = Date.now();

		// Fetch data from multiple services in parallel for better performance
		console.log(`   📡 Fetching data from services in parallel...`);
		const [users, questionData, tests, grades, totalQuestionCount] =
			await Promise.all([
				userService.getDashboardUsers(),
				questionService.getQuestions({}, 1, 100), // Get first 100 questions for recent activity
				testService.getTests(),
				gradeService.getAllGrades(),
				questionService.getTotalQuestionCount(), // Get the total question count
			]);

		console.log(`   ✅ Base data fetched successfully`);
		console.log(`     👥 Users: ${users?.all?.length || 0}`);
		console.log(`     ❓ Questions: ${totalQuestionCount}`);
		console.log(`     📝 Tests: ${tests?.length || 0}`);
		console.log(`     🎓 Grades: ${grades?.length || 0}`);

		// Extract questions array from the question data
		const questions = questionData.questions || [];

		// Get student counts for all grades using aggregation
		console.log(`   📊 Calculating student distribution by grade...`);
		const studentCountsAgg = await Student.aggregate([
			{
				$group: {
					_id: "$grade",
					count: { $sum: 1 },
				},
			},
		]);

		console.log(
			`   ✅ Student aggregation completed: ${studentCountsAgg.length} grade groups`
		);

		// Create a map of grade ID to student count for efficient lookup
		const studentCountMap = {};
		studentCountsAgg.forEach((item) => {
			if (item._id) {
				studentCountMap[item._id.toString()] = item.count;
			}
		});

		// Add student counts to grades
		console.log(`   🔗 Merging student counts with grade data...`);
		const gradesWithStudentCount = grades.map((grade) => {
			const gradeId = grade._id.toString();
			const studentCount = studentCountMap[gradeId] || 0;
			return {
				...grade.toObject(),
				studentCount,
			};
		});

		// Generate analytics for questions by subject and grade
		console.log(`   📈 Generating question analytics...`);
		const questionsBySubject =
			await questionService.getQuestionCountBySubject();
		const questionsByGrade = await questionService.getQuestionCountByGrade();

		console.log(
			`     📚 Question analytics: ${questionsBySubject.length} subjects, ${questionsByGrade.length} grades`
		);

		// Prepare recent activity data
		console.log(`   📅 Preparing recent activity feeds...`);
		const recentUsers = users.all.slice(-5).reverse();
		const recentQuestions = questions.slice(-5).reverse();

		console.log(
			`     📈 Recent activity: ${recentUsers.length} users, ${recentQuestions.length} questions`
		);

		// Compile comprehensive statistics object
		const stats = {
			users,
			questions: {
				total: totalQuestionCount,
				bySubject: questionsBySubject,
				byGrade: questionsByGrade,
			},
			tests: {
				total: tests.length,
			},
			recentActivity: {
				users: recentUsers,
				questions: recentQuestions,
			},
			grades: {
				items: gradesWithStudentCount,
				levels: [...new Set(grades.map((grade) => grade.level))].sort(),
			},
		};

		const processingTime = Date.now() - startTime;

		console.log(`✅ Dashboard statistics compiled successfully!`);
		console.log(`   ⏱️ Total processing time: ${processingTime}ms`);
		console.log(`   📊 Statistics summary:`);
		console.log(`     👥 Total users: ${stats.users?.totalUsers || 0}`);
		console.log(`     ❓ Total questions: ${stats.questions.total}`);
		console.log(`     📝 Total tests: ${stats.tests.total}`);
		console.log(`     🎓 Grade levels: ${stats.grades.levels.length}`);
		console.log(
			`     📈 Performance: ${Math.round(processingTime)}ms response time`
		);
		console.log("📊 ===============================================\n");

		res.status(200).json({
			success: true,
			data: stats,
			meta: {
				generatedAt: new Date().toISOString(),
				processingTime: processingTime,
				dataFreshness: "real-time",
			},
		});
	} catch (err) {
		console.error(`❌ Dashboard statistics generation failed:`, err.message);
		console.error(`   💥 Error type: ${err.name}`);
		console.error(`   📝 Error details: ${err.message}`);
		console.error(`   📚 Stack trace:`, err.stack);
		console.log("📊 ===============================================\n");
		next(err);
	}
};

/**
 * User Controller
 * ------------------------------------------------------------------------------
 * Handles all administrative operations related to users in the Exemind-AI system.
 *
 * Main Responsibilities:
 * - Fetching user data for management
 * - Generating dashboard analytics (student/teacher/admin counts, new users, etc.)
 * - Logs activity and audit trails for admin interactions
 *
 * Connected Services:
 * - userService: Provides the business logic and data access for users
 *
 * @module controllers/user.controller
 * @author Exemind-AI Team
 */

const userService = require("../services/user.service");

/**
 * UserController
 * ------------------------------------------------------------------------------
 * This class acts as the REST controller for user-related admin operations.
 * Each method is designed to be used as an Express route handler.
 */
class UserController {
	/**
	 * GET /api/users
	 * ------------------------------------------------------------------------------
	 * Fetch all users in the system with optional filters and pagination.
	 * Useful for admin views where user management is necessary.
	 *
	 * Logs: Admin info, query params, IP address, role distribution.
	 *
	 * @async
	 * @function getUsers
	 * @param {Object} req - Express request object (may include filters)
	 * @param {Object} res - Express response object (returns user data)
	 * @param {Function} next - Express error middleware
	 */
	async getUsers(req, res, next) {
		console.log("\n👥 =============== GET USERS ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`👤 Admin User: ${req.user?.name} (${req.user?.id})`);
		console.log(`🔍 Query Params: ${JSON.stringify(req.query)}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

		try {
			console.log(`🔄 Fetching users with filters...`);

			const users = await userService.getUsers(req.query);

			console.log(`✅ Users retrieved successfully`);
			console.log(`   📊 Users count: ${users.length || 0}`);

			// Generate a role distribution summary (e.g., how many students/teachers/admins)
			console.log(
				`   🎭 Roles distribution: ${
					users.reduce((acc, user) => {
						acc[user.role] = (acc[user.role] || 0) + 1;
						return acc;
					}, {}) || "N/A"
				}`
			);
			console.log("👥 =========================================\n");

			res.status(200).json({
				success: true,
				data: users,
				count: users.length,
			});
		} catch (error) {
			console.error(`❌ Failed to get users:`, error.message);
			console.log("👥 =========================================\n");
			next(error);
		}
	}

	/**
	 * GET /api/dashboard/users
	 * ------------------------------------------------------------------------------
	 * Get aggregated data for dashboard display:
	 * - Total users
	 * - Role-based breakdown (students, teachers, admins)
	 * - New users this month
	 *
	 * Returns: JSON summary for admin analytics
	 *
	 * @async
	 * @function getDashboardData
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object (contains dashboard stats)
	 * @param {Function} next - Express error middleware
	 */
	async getDashboardData(req, res, next) {
		console.log("\n📊 =============== DASHBOARD DATA ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`👤 Admin User: ${req.user?.name} (${req.user?.id})`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

		try {
			console.log(`🔄 Generating user dashboard statistics...`);

			const data = await userService.getDashboardUsers();

			console.log(`✅ Dashboard data generated successfully`);
			console.log(`   📈 Total users: ${data.totalUsers || 0}`);
			console.log(`   👨‍🎓 Students: ${data.studentsCount || 0}`);
			console.log(`   👨‍🏫 Teachers: ${data.teachersCount || 0}`);
			console.log(`   👨‍💼 Admins: ${data.adminsCount || 0}`);
			console.log(`   📅 New users this month: ${data.newUsersThisMonth || 0}`);
			console.log("📊 ==========================================\n");

			res.status(200).json({
				success: true,
				data,
				message: "Dashboard data retrieved successfully",
			});
		} catch (error) {
			console.error(`❌ Failed to get dashboard data:`, error.message);
			console.log("📊 ==========================================\n");
			next(error);
		}
	}
}

module.exports = new UserController();

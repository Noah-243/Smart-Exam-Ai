/**
 * Authentication Controller
 * Handles user authentication operations for Exemind-AI
 *
 * Features:
 * - User registration and login
 * - JWT token management
 * - Password management
 * - Profile updates
 * - Student-specific login enhancements
 *
 * @module controllers/auth.controller
 * @author Exemind-AI Team
 */

const userService = require("../services/user.service");
const studentService = require("../services/student.service");
const ErrorResponse = require("../utils/errorResponse");
const { sendTokenResponse } = require("../utils/auth");
const asyncHandler = require("../middleware/async");
const devConfig = require("../config/development");

/**
 * Authentication Controller Class
 * Manages all authentication-related HTTP endpoints
 */
class AuthController {
	/**
	 * Register a new user
	 * Creates user account and returns JWT token
	 *
	 * @desc    Register user
	 * @route   POST /api/auth/register
	 * @access  Public
	 * @param   {Object} req - Express request object
	 * @param   {Object} res - Express response object
	 * @param   {Function} next - Express next middleware function
	 */
	async register(req, res, next) {
		console.log("\n👤 =============== USER REGISTRATION ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);
		console.log(`📧 Email: ${req.body.email}`);
		console.log(`👤 Name: ${req.body.name}`);
		console.log(`🎭 Role: ${req.body.role}`);
		console.log(
			`📱 User Agent: ${req.headers["user-agent"]?.substring(0, 50)}...`
		);

		try {
			// Log registration attempt
			console.log(`🔄 Creating user account...`);

			const user = await userService.createUser(req.body);

			console.log(`✅ User registered successfully!`);
			console.log(`   🆔 User ID: ${user._id}`);
			console.log(`   📧 Email: ${user.email}`);
			console.log(`   🎭 Role: ${user.role}`);
			console.log(`   📅 Created: ${user.createdAt}`);
			console.log("👤 ============================================\n");

			// Send success response with JWT token
			sendTokenResponse(user, 200, res);
		} catch (error) {
			console.error(
				`❌ Registration failed for ${req.body.email}:`,
				error.message
			);
			console.log("👤 ============================================\n");
			next(error);
		}
	}

	/**
	 * Login existing user
	 * Validates credentials and returns JWT token
	 * For students, ensures test availability
	 *
	 * @desc    Login user
	 * @route   POST /api/auth/login
	 * @access  Public
	 * @param   {Object} req - Express request object
	 * @param   {Object} res - Express response object
	 * @param   {Function} next - Express next middleware function
	 */
	async login(req, res, next) {
		console.log("\n🔐 =============== USER LOGIN ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);
		console.log(`📧 Email: ${req.body.email}`);
		console.log(
			`📱 User Agent: ${req.headers["user-agent"]?.substring(0, 50)}...`
		);

		try {
			const { email, password } = req.body;

			// Validate input
			if (!email || !password) {
				console.log(`❌ Login failed: Missing email or password`);
				throw new ErrorResponse("Please provide email and password", 400);
			}

			console.log(`🔍 Looking up user: ${email}`);
			const user = await userService.getUserByEmail(email, true);

			if (!user) {
				console.log(`❌ Login failed: User not found for email ${email}`);
				throw new ErrorResponse("Invalid credentials", 401);
			}

			console.log(`✅ User found: ${user.name} (${user.role})`);
			console.log(`🔑 Validating password...`);

			if (!(await user.matchPassword(password))) {
				console.log(`❌ Login failed: Invalid password for ${email}`);
				throw new ErrorResponse("Invalid credentials", 401);
			}

			console.log(`✅ Password validated successfully`);
			console.log(`🎭 User role: ${user.role}`);

			// Special handling for student users
			if (user.role === "student") {
				console.log(
					`🎓 Student login detected - ensuring test availability...`
				);
				try {
					// Always ensure there's an available test for the student
					// This will create a test if none exists, or use an existing one
					const testResult = await studentService.ensureUpcomingTest(user._id, {
						forceCreate: false,
					});

					if (testResult) {
						const status = testResult.hasExistingTest
							? "Using existing test"
							: "Created new test";
						console.log(`   📝 Test status: ${status}`);
						console.log(`   🆔 Test ID: ${testResult.testId || "N/A"}`);
					} else {
						console.log(`   ⚠️ No test available and none created`);
					}
				} catch (testError) {
					// Log the error but don't prevent login
					console.error(
						`   ❌ Error managing student test:`,
						testError.message
					);
					console.log(`   ➡️ Proceeding with login despite test error`);
				}
			}

			console.log(`✅ Login successful for ${user.email}`);
			console.log(`   🆔 User ID: ${user._id}`);
			console.log(`   🎭 Role: ${user.role}`);
			console.log(`   📅 Last login: ${new Date().toISOString()}`);
			console.log("🔐 =========================================\n");

			sendTokenResponse(user, 200, res);
		} catch (error) {
			console.error(`❌ Login error for ${req.body.email}:`, error.message);
			console.log("🔐 =========================================\n");
			next(error);
		}
	}

	/**
	 * Logout user
	 * Clears authentication cookie and invalidates session
	 *
	 * @desc    Log user out / clear cookie
	 * @route   GET /api/auth/logout
	 * @access  Private
	 * @param   {Object} req - Express request object
	 * @param   {Object} res - Express response object
	 * @param   {Function} next - Express next middleware function
	 */
	async logout(req, res, next) {
		console.log("\n🚪 =============== USER LOGOUT ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`👤 User ID: ${req.user?.id || "Unknown"}`);
		console.log(`📧 User Email: ${req.user?.email || "Unknown"}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

		try {
			console.log(`🔄 Clearing authentication cookie...`);

			// Clear the authentication cookie
			res.cookie("token", "none", {
				expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
				httpOnly: true,
			});

			console.log(`✅ User logged out successfully`);
			console.log(`   🍪 Cookie cleared`);
			console.log(`   ⏰ Session ended at: ${new Date().toISOString()}`);
			console.log("🚪 =========================================\n");

			res.status(200).json({
				success: true,
				data: {},
				message: "Logged out successfully",
			});
		} catch (error) {
			console.error(`❌ Logout error for user ${req.user?.id}:`, error.message);
			console.log("🚪 =========================================\n");
			next(error);
		}
	}

	/**
	 * Get current authenticated user profile
	 * Returns user information for authenticated requests
	 *
	 * @desc    Get current logged in user
	 * @route   GET /api/auth/me
	 * @access  Private
	 * @param   {Object} req - Express request object
	 * @param   {Object} res - Express response object
	 * @param   {Function} next - Express next middleware function
	 */
	async getMe(req, res, next) {
		console.log("\n👤 =============== GET USER PROFILE ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`👤 User ID: ${req.user?.id}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

		try {
			console.log(`🔍 Fetching user profile...`);

			const user = await userService.getUserById(req.user.id);

			if (!user) {
				console.log(`❌ User not found: ${req.user.id}`);
				throw new ErrorResponse("User not found", 404);
			}

			console.log(`✅ Profile retrieved successfully`);
			console.log(`   📧 Email: ${user.email}`);
			console.log(`   👤 Name: ${user.name}`);
			console.log(`   🎭 Role: ${user.role}`);
			console.log(`   📅 Last updated: ${user.updatedAt}`);
			console.log("👤 ==========================================\n");

			res.status(200).json({
				success: true,
				data: user,
			});
		} catch (error) {
			console.error(
				`❌ Error fetching profile for user ${req.user?.id}:`,
				error.message
			);
			console.log("👤 ==========================================\n");
			next(error);
		}
	}

	/**
	 * Update user password
	 * Changes password after validating current password
	 *
	 * @desc    Update password
	 * @route   PUT /api/auth/updatepassword
	 * @access  Private
	 * @param   {Object} req - Express request object
	 * @param   {Object} res - Express response object
	 * @param   {Function} next - Express next middleware function
	 */
	async updatePassword(req, res, next) {
		console.log("\n🔐 =============== PASSWORD UPDATE ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`👤 User ID: ${req.user?.id}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

		try {
			const { currentPassword, newPassword } = req.body;

			// Validate input
			if (!currentPassword || !newPassword) {
				console.log(`❌ Password update failed: Missing required fields`);
				throw new ErrorResponse("Please provide current and new password", 400);
			}

			if (newPassword.length < 6) {
				console.log(`❌ Password update failed: New password too short`);
				throw new ErrorResponse(
					"New password must be at least 6 characters",
					400
				);
			}

			console.log(`🔍 Fetching user for password verification...`);
			const user = await userService.getUserById(req.user.id);

			if (!user) {
				console.log(`❌ User not found: ${req.user.id}`);
				throw new ErrorResponse("User not found", 404);
			}

			console.log(`🔑 Validating current password...`);
			if (!(await user.matchPassword(currentPassword))) {
				console.log(`❌ Password update failed: Current password incorrect`);
				throw new ErrorResponse("Current password is incorrect", 401);
			}

			console.log(`✅ Current password validated`);
			console.log(`🔄 Updating password...`);

			await userService.updatePassword(req.user.id, newPassword);

			console.log(`✅ Password updated successfully`);
			console.log(`   👤 User: ${user.email}`);
			console.log(`   ⏰ Updated at: ${new Date().toISOString()}`);
			console.log("🔐 ==========================================\n");

			res.status(200).json({
				success: true,
				message: "Password updated successfully",
			});
		} catch (error) {
			console.error(
				`❌ Password update error for user ${req.user?.id}:`,
				error.message
			);
			console.log("🔐 ==========================================\n");
			next(error);
		}
	}

	/**
	 * Update user profile information
	 * Updates user profile data (excludes password)
	 *
	 * @desc    Update user profile
	 * @route   PUT /api/auth/updateprofile
	 * @access  Private
	 * @param   {Object} req - Express request object
	 * @param   {Object} res - Express response object
	 * @param   {Function} next - Express next middleware function
	 */
	async updateProfile(req, res, next) {
		console.log("\n👤 =============== PROFILE UPDATE ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`👤 User ID: ${req.user?.id}`);
		console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);
		console.log(
			`🔄 Update fields: ${Object.keys(req.body)
				.filter((key) => key !== "password")
				.join(", ")}`
		);

		try {
			// Remove password from update data for security
			const { password, ...updateData } = req.body;

			if (password) {
				console.log(`⚠️ Password field ignored - use /updatepassword endpoint`);
			}

			if (Object.keys(updateData).length === 0) {
				console.log(`❌ Profile update failed: No valid fields to update`);
				throw new ErrorResponse("No valid fields provided for update", 400);
			}

			console.log(`🔄 Updating user profile...`);

			const user = await userService.updateUser(req.user.id, updateData);

			if (!user) {
				console.log(`❌ User not found: ${req.user.id}`);
				throw new ErrorResponse("User not found", 404);
			}

			console.log(`✅ Profile updated successfully`);
			console.log(`   📧 Email: ${user.email}`);
			console.log(`   👤 Name: ${user.name}`);
			console.log(`   🎭 Role: ${user.role}`);
			console.log(`   ⏰ Updated at: ${new Date().toISOString()}`);
			console.log("👤 ==========================================\n");

			res.status(200).json({
				success: true,
				data: user,
				message: "Profile updated successfully",
			});
		} catch (error) {
			console.error(
				`❌ Profile update error for user ${req.user?.id}:`,
				error.message
			);
			console.log("👤 ==========================================\n");
			next(error);
		}
	}
}

module.exports = new AuthController();

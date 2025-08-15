/**
 * Authentication Routes
 * Handles user authentication endpoints for Exemind-AI
 *
 * Features:
 * - User registration and login
 * - Password management
 * - Profile updates
 * - Session management
 * - JWT token handling
 *
 * @module routes/auth.routes
 * @author Exemind-AI Team
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
	register,
	login,
	logout,
	getMe,
	updatePassword,
	updateProfile,
} = require("../controllers/auth.controller");

// ===== PUBLIC AUTHENTICATION ROUTES =====

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    {string} name - User's full name
 * @body    {string} email - User's email address
 * @body    {string} password - User's password
 * @body    {string} role - User role (student/teacher/admin)
 * @returns {Object} User data with JWT token
 */
router.post("/register", (req, res, next) => {
	console.log("\n🔐 =============== AUTH REGISTRATION ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`📧 Email: ${req.body.email}`);
	console.log(`👤 Name: ${req.body.name}`);
	console.log(`🎭 Role: ${req.body.role}`);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log(`🌐 User-Agent: ${req.get("User-Agent")}`);
	console.log("🔐 ================================================\n");

	register(req, res, next);
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 * @body    {string} email - User's email address
 * @body    {string} password - User's password
 * @returns {Object} User data with JWT token
 */
router.post("/login", (req, res, next) => {
	console.log("\n🔐 =============== AUTH LOGIN ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`📧 Email: ${req.body.email}`);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log(`🌐 User-Agent: ${req.get("User-Agent")}`);
	console.log(`🔒 Login attempt initiated`);
	console.log("🔐 ==========================================\n");

	login(req, res, next);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear token
 * @access  Public
 * @returns {Object} Success message
 */
router.post("/logout", (req, res, next) => {
	console.log("\n🔐 =============== AUTH LOGOUT ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log(`🚪 Logout request initiated`);
	console.log("🔐 ===========================================\n");

	logout(req, res, next);
});

// ===== PROTECTED AUTHENTICATION ROUTES =====

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user profile
 * @access  Private (JWT required)
 * @returns {Object} Current user profile data
 */
router.get("/me", protect, (req, res, next) => {
	console.log("\n🔐 =============== GET USER PROFILE ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 User: ${req.user?.name} (${req.user?.email})`);
	console.log(`🎭 Role: ${req.user?.role}`);
	console.log(`🆔 User ID: ${req.user?._id}`);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log("🔐 ================================================\n");

	getMe(req, res, next);
});

/**
 * @route   PUT /api/auth/updatepassword
 * @desc    Update user password
 * @access  Private (JWT required)
 * @body    {string} currentPassword - Current password for verification
 * @body    {string} newPassword - New password to set
 * @returns {Object} Success message with new token
 */
router.put("/updatepassword", protect, (req, res, next) => {
	console.log("\n🔐 =============== UPDATE PASSWORD ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 User: ${req.user?.name} (${req.user?.email})`);
	console.log(`🎭 Role: ${req.user?.role}`);
	console.log(`🔒 Password update requested`);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log(`🌐 User-Agent: ${req.get("User-Agent")}`);
	console.log("🔐 ===============================================\n");

	updatePassword(req, res, next);
});

/**
 * @route   PUT /api/auth/updateprofile
 * @desc    Update user profile information
 * @access  Private (JWT required)
 * @body    {string} [name] - Updated user name
 * @body    {string} [email] - Updated email address
 * @returns {Object} Updated user profile data
 */
router.put("/updateprofile", protect, (req, res, next) => {
	console.log("\n🔐 =============== UPDATE PROFILE ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`👤 User: ${req.user?.name} (${req.user?.email})`);
	console.log(`🎭 Role: ${req.user?.role}`);
	console.log(
		`📝 Profile fields to update: ${Object.keys(req.body).join(", ")}`
	);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log("🔐 ==============================================\n");

	updateProfile(req, res, next);
});

module.exports = router;

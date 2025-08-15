/**
 * Authentication Middleware
 * Provides JWT-based authentication and role-based authorization for Exemind-AI
 *
 * Features:
 * - JWT token verification
 * - User authentication validation
 * - Role-based access control
 * - Request context logging
 * - Security event monitoring
 *
 * @module middleware/auth
 * @author Exemind-AI Team
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Protection Middleware
 * Verifies JWT token and populates req.user with authenticated user data
 *
 * @async
 * @function protect
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} When token is invalid, expired, or user not found
 */
const protect = async (req, res, next) => {
	console.log("\n🔐 =============== AUTH MIDDLEWARE ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`🌐 ${req.method} ${req.originalUrl}`);
	console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);
	console.log(
		`🌍 User-Agent: ${req.get("User-Agent")?.substring(0, 50) || "Unknown"}...`
	);

	try {
		let token;

		// Check for token in Authorization header (Bearer token)
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
			console.log(`🎫 Token source: Authorization header`);
		}
		// Check for token in cookies as fallback
		else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
			console.log(`🎫 Token source: HTTP cookie`);
		}

		// Validate token presence
		if (!token) {
			console.log(`❌ Authentication failed: No token provided`);
			console.log(`   📍 Endpoint: ${req.originalUrl}`);
			console.log(`   🔗 IP: ${req.ip || req.connection.remoteAddress}`);
			console.log("🔐 ===============================================\n");

			res.status(401);
			throw new Error("Not authorized, no token provided");
		}

		console.log(`🔍 Verifying JWT token...`);
		console.log(`   📏 Token length: ${token.length} characters`);
		console.log(`   🔤 Token prefix: ${token.substring(0, 20)}...`);

		// Verify JWT token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(`✅ JWT verification successful`);
		console.log(`   🆔 User ID from token: ${decoded.id}`);
		console.log(
			`   ⏰ Token issued at: ${new Date(decoded.iat * 1000).toISOString()}`
		);
		console.log(
			`   ⏰ Token expires at: ${new Date(decoded.exp * 1000).toISOString()}`
		);

		// Find user by ID from decoded token
		console.log(`🔍 Looking up user in database...`);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			console.log(`❌ Authentication failed: User not found`);
			console.log(`   🆔 Token user ID: ${decoded.id}`);
			console.log(`   📍 Endpoint: ${req.originalUrl}`);
			console.log("🔐 ===============================================\n");

			res.status(401);
			throw new Error("User not found");
		}

		console.log(`✅ User authentication successful`);
		console.log(`   👤 User: ${user.name} (${user.email})`);
		console.log(`   🎭 Role: ${user.role}`);
		console.log(`   🆔 User ID: ${user._id}`);
		console.log(`   📅 Last login: ${user.lastLogin || "N/A"}`);
		console.log(
			`   ✅ Account status: ${user.isActive ? "Active" : "Inactive"}`
		);

		// Attach user to request object for use in subsequent middleware/routes
		req.user = user;
		console.log(`🔗 User context attached to request`);
		console.log("🔐 ===============================================\n");

		next();
	} catch (error) {
		console.error(`❌ Authentication middleware error:`, error.message);
		console.log(`   💥 Error type: ${error.name}`);
		console.log(`   📍 Endpoint: ${req.originalUrl}`);
		console.log(`   🔗 IP: ${req.ip || req.connection.remoteAddress}`);

		// Handle specific JWT errors
		if (error.name === "JsonWebTokenError") {
			console.error(`   🔴 JWT Error: Invalid token format or signature`);
		} else if (error.name === "TokenExpiredError") {
			console.error(`   🔴 JWT Error: Token expired at ${error.expiredAt}`);
		} else if (error.name === "NotBeforeError") {
			console.error(`   🔴 JWT Error: Token not active until ${error.date}`);
		}

		console.log("🔐 ===============================================\n");

		res.status(401);
		next(error);
	}
};

/**
 * Role-Based Authorization Middleware
 * Restricts access to specific user roles
 *
 * @function authorize
 * @param {...string} roles - Allowed roles for the endpoint
 * @returns {Function} Express middleware function
 * @example authorize('admin', 'teacher') - Only admins and teachers allowed
 */
const authorize = (...roles) => {
	return (req, res, next) => {
		console.log("\n🛡️ =============== AUTHORIZATION CHECK ===============");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🌐 ${req.method} ${req.originalUrl}`);
		console.log(`🎭 Required roles: ${roles.join(", ")}`);
		console.log(
			`👤 User: ${req.user?.name || "Unknown"} (${
				req.user?.email || "Unknown"
			})`
		);
		console.log(`🔍 User role: ${req.user?.role || "None"}`);
		console.log(`🔗 IP: ${req.ip || req.connection.remoteAddress}`);

		// Validate user context exists (should be set by protect middleware)
		if (!req.user) {
			console.log(`❌ Authorization failed: No user context found`);
			console.log(
				`   ⚠️ Middleware order issue: protect() should run before authorize()`
			);
			console.log("🛡️ ==================================================\n");

			return next(new Error("User not found"));
		}

		// Check if user's role is in the allowed roles list
		if (!roles.includes(req.user.role)) {
			console.log(`❌ Authorization failed: Insufficient permissions`);
			console.log(`   🎭 User role: ${req.user.role}`);
			console.log(`   🚫 Required roles: ${roles.join(", ")}`);
			console.log(`   📍 Attempted endpoint: ${req.originalUrl}`);
			console.log(`   👤 User: ${req.user.name} (${req.user.email})`);
			console.log("🛡️ ==================================================\n");

			return next(
				new Error(
					`User role ${req.user.role} is not authorized to access this route`
				)
			);
		}

		console.log(`✅ Authorization successful`);
		console.log(`   👤 User: ${req.user.name}`);
		console.log(`   🎭 Role: ${req.user.role} (authorized)`);
		console.log(`   📍 Access granted to: ${req.originalUrl}`);
		console.log("🛡️ ==================================================\n");

		next();
	};
};

module.exports = { protect, authorize };

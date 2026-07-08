/**
 * Exemind-AI Backend Server
 * ===================================
 * This is the main entry point for the backend server of the Exemind-AI platform,
 * a smart exam and learning management system. It orchestrates routing, middleware,
 * database connections, error handling, and server startup.
 *
 *   Core Responsibilities:
 * - Set up and configure an Express server
 * - Connect to the MongoDB database
 * - Register and mount all application routes (auth, users, questions, tests, etc.)
 * - Apply global middleware for security, performance, and error handling
 * - Manage AI-driven features like automated grading and test generation
 * - Handle CORS, rate limiting, and environment-specific configurations
 * - Start and monitor the backend server
 *
 *    Middleware Used:
 * - `morgan` for logging HTTP requests
 * - `cors` for managing cross-origin access
 * - `rate-limit` to prevent API abuse
 * - `express.json` and `express.urlencoded` for parsing large request bodies
 * - `cookie-parser` for handling auth tokens via cookies
 *
 *   Key Modules:
 * - AI integration for grading and question generation
 * - Teacher and student dashboards
 * - Secure authentication and role-based access
 * - Route separation by feature and user role
 *
 *   Routes Include:
 * - /api/auth               → Authentication & login
 * - /api/users              → User management
 * - /api/questions          → Questions CRUD
 * - /api/tests              → Test creation & AI features
 * - /api/dashboard          → Data analytics
 * - /api/student-tests      → Student submissions
 * - /api/teacher/tests      → Teacher test evaluations
 * - ... and more
 *
 *   Startup Process:
 * - Loads environment variables
 * - Connects to MongoDB
 * - Configures middleware and rate limits
 * - Mounts all routes
 * - Handles uncaught exceptions and graceful shutdown
 *
 *   Environment Variables Required:
 * - PORT
 * - MONGODB_URI
 * - JWT_SECRET
 * - JWT_EXPIRE
 * - JWT_COOKIE_EXPIRE
 * - RATE_LIMIT_WINDOW
 * - RATE_LIMIT_MAX
 * - NODE_ENV
 *
 * @file server.js
 * @author Smart Exam Platform 
 * @version 1.0.0
 */


const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./database/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ===== ROUTE IMPORTS =====
// Authentication and user management
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Core content management
const questionRoutes = require("./routes/question.routes");
const subjectRoutes = require("./routes/subject.routes");
const gradeRoutes = require("./routes/grade.routes");
const testRoutes = require("./routes/test.routes");

// Dashboard and analytics
const dashboardRoutes = require("./routes/dashboard.routes");
const scheduledTestRoutes = require("./routes/scheduledTest.routes");
const studentDashboardRoutes = require("./routes/studentDashboard.routes");
const teacherDashboardRoutes = require("./routes/teacherDashboard.routes");

// Test execution and grading
const studentTestRoutes = require("./routes/studentTest.routes");
const teacherTestRoutes = require("./routes/teacherTest.routes");

// User-specific routes
const teacherRoutes = require("./routes/teacher.routes");
const studentRoutes = require("./routes/studentRoutes");

/**
 * Initialize Express application
 */
const app = express();

console.log("🚀 Starting Exemind-AI Backend Server...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 Port: ${process.env.PORT || 5000}`);

/**
 * DATABASE CONNECTION
 * Connect to MongoDB database
 */
console.log("🔗 Connecting to database...");
connectDB();

/**
 * MIDDLEWARE CONFIGURATION
 */

// HTTP request logging middleware
console.log("🔧 Configuring middleware...");
if (process.env.NODE_ENV === "development") {
	// Use 'dev' format in development for colored output
	app.use(morgan("dev"));
	console.log("📝 Morgan logging: Development mode (colored)");
} else {
	// Use 'combined' format in production for detailed logs
	app.use(morgan("combined"));
	console.log("📝 Morgan logging: Production mode (detailed)");
}

/**
 * CORS Configuration
 * Enable Cross-Origin Resource Sharing with security restrictions
 */
app.use(
	cors({
		origin: function (origin, callback) {
			console.log(`🌐 CORS request from origin: ${origin || "no-origin"}`);

			const allowedOrigins = [
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"https://smart-exam-ai-frontend.onrender.com",
			];

			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.includes(origin)) {
				console.log("✅ CORS: Origin allowed");
				return callback(null, true);
			}

			console.log("❌ CORS: Origin not allowed:", origin);
			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"Access-Control-Allow-Credentials",
	],
		exposedHeaders: [
			"Content-Length",
			"X-Requested-With",
			"Access-Control-Allow-Credentials",
		],
			optionsSuccessStatus: 200,
	})
);

console.log("🛡️ CORS configured with security restrictions");

/**
 * SECURITY MIDDLEWARE
 * Helmet is commented out due to potential conflicts with development
 */
// app.use(
// 	helmet({
// 		crossOriginResourcePolicy: { policy: "cross-origin" },
// 		crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
// 	})
// );

/**
 * RATE LIMITING
 * Prevent abuse by limiting requests per IP
 */
const limiter = rateLimit({
	windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // Convert minutes to milliseconds
	max: process.env.RATE_LIMIT_MAX, // Limit each IP to max requests per windowMs
});
app.use("/api", limiter);
console.log(
	`⏱️ Rate limiting: ${process.env.RATE_LIMIT_MAX || 100} requests per ${process.env.RATE_LIMIT_WINDOW || 15
	} minutes`
);

/**
 * BODY PARSING MIDDLEWARE
 * Parse JSON and URL-encoded data with size limits
 */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
console.log("📦 Body parser configured (50MB limit)");

/**
 * API ROUTES CONFIGURATION
 * Mount all route handlers with their respective prefixes
 */
console.log("🛣️ Configuring API routes...");

// Authentication and user management
app.use("/api/auth", authRoutes);
console.log("  ✓ /api/auth - Authentication routes");

app.use("/api/users", userRoutes);
console.log("  ✓ /api/users - User management routes");

// Core content management
app.use("/api/questions", questionRoutes);
console.log("  ✓ /api/questions - Question management routes");

app.use("/api/subjects", subjectRoutes);
console.log("  ✓ /api/subjects - Subject management routes");

app.use("/api/grades", gradeRoutes);
console.log("  ✓ /api/grades - Grade level management routes");

app.use("/api/tests", testRoutes);
console.log("  ✓ /api/tests - Test management routes");

// Dashboard and analytics
app.use("/api/dashboard", dashboardRoutes);
console.log("  ✓ /api/dashboard - Dashboard analytics routes");

app.use("/api/scheduled-tests", scheduledTestRoutes);
console.log("  ✓ /api/scheduled-tests - Test scheduling routes");

app.use("/api/student-dashboard", studentDashboardRoutes);
console.log("  ✓ /api/student-dashboard - Student dashboard routes");

app.use("/api/teacher-dashboard", teacherDashboardRoutes);
console.log("  ✓ /api/teacher-dashboard - Teacher dashboard routes");

// Test execution and grading
app.use("/api/student-tests", studentTestRoutes);
console.log("  ✓ /api/student-tests - Student test execution routes");

app.use("/api/teacher/tests", teacherTestRoutes);
console.log("  ✓ /api/teacher/tests - Teacher test management routes");

// User-specific routes
app.use("/api/teachers", teacherRoutes);
console.log("  ✓ /api/teachers - Teacher-specific routes");

app.use("/api/student", studentRoutes);
console.log("  ✓ /api/student - Student-specific routes");

// Teacher specialized routes
app.use("/api/teacher/answers", require("./routes/teacherAnswer.routes"));
console.log("  ✓ /api/teacher/answers - Teacher answer management routes");

app.use("/api/teacher/questions", require("./routes/teacherQuestion.routes"));
console.log("  ✓ /api/teacher/questions - Teacher question management routes");

/**
 * ERROR HANDLING MIDDLEWARE
 * Handle 404 errors and general application errors
 */
console.log("🛡️ Configuring error handling...");
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

/**
 * SERVER STARTUP
 * Start the Express server and listen for connections
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`\n🎉 Exemind-AI Backend Server Successfully Started!`);
	console.log(`🌐 Server running on: http://localhost:${PORT}`);
	console.log(`📅 Started at: ${new Date().toISOString()}`);
	console.log(`🔄 Process ID: ${process.pid}`);
	console.log(
		`💾 Memory usage: ${Math.round(
			process.memoryUsage().heapUsed / 1024 / 1024
		)}MB`
	);
	console.log(`\n📡 API Base URL: http://localhost:${PORT}/api`);
	console.log(`📚 Available endpoints:`);
	console.log(`  - Authentication: /api/auth`);
	console.log(`  - Questions: /api/questions`);
	console.log(`  - Tests: /api/tests`);
	console.log(`  - Users: /api/users`);
	console.log(`  - Dashboard: /api/dashboard`);
	console.log(`\n🔍 Monitor logs above for request details...`);
});

/**
 * GRACEFUL SHUTDOWN HANDLERS
 * Handle application shutdown gracefully
 */
process.on("SIGTERM", () => {
	console.log("\n🛑 SIGTERM received. Shutting down gracefully...");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("\n🛑 SIGINT received. Shutting down gracefully...");
	process.exit(0);
});

process.on("uncaughtException", (error) => {
	console.error("💥 Uncaught Exception:", error);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
	process.exit(1);
});

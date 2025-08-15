/**
 * Admin User Checker Script
 *
 * This script connects to a MongoDB database and checks whether a default admin user exists.
 * If the admin user (with email `admin@example.com`) does not exist, it creates one with a default password.
 *
 * Useful for seeding an initial admin user in development or testing environments.
 *
 * Functionality:
 * - Connects to MongoDB using MONGODB_URI from `.env`
 * - Searches for an admin user by email
 * - Logs admin user info if found
 * - Creates a new admin user if not found
 * - Disconnects from the database after operation
 *
 * Dependencies:
 * - mongoose: For MongoDB connection and querying
 * - dotenv: Loads environment variables from .env
 * - User model: The Mongoose schema for users
 */

const mongoose = require("mongoose");
const User = require("../../models/User");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Main function to check for an admin user.
 * If not found, creates a new default admin with hardcoded credentials.
 *
 * @returns {Promise<void>}
 */
const checkAdmin = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Look for existing admin user by email
		const admin = await User.findOne({ email: "admin@example.com" });
		if (admin) {
			// Admin exists – log details
			console.log("Admin user found:");
			console.log({
				id: admin._id,
				name: admin.name,
				email: admin.email,
				role: admin.role,
				hasPassword: !!admin.password,
			});
		} else {
			// Admin not found – create new admin
			console.log("No admin user found");
			console.log("Creating new admin user...");
			const newAdmin = await User.create({
				name: "Admin User",
				email: "admin@example.com",
				password: "123456",
				role: "admin",
			});
			console.log("New admin user created:", {
				id: newAdmin._id,
				name: newAdmin.name,
				email: newAdmin.email,
				role: newAdmin.role,
			});
		}

		// Disconnect after operation
		await mongoose.disconnect();
	} catch (error) {
		// Handle connection or query errors
		console.error("Error:", error);
	}
};

// Run the admin check immediately when the script is called
checkAdmin();

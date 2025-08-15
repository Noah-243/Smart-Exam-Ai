/**
 * Create Admin User Script
 *
 * This script connects to MongoDB and ensures a fresh admin user is created
 * with a default email and password. It deletes any existing admin with the
 * same email and verifies that the new password works using the model's
 * `matchPassword` method.
 *
 * Intended for development/testing environments where repeatable admin setup is needed.
 *
 * Functionality:
 * - Loads environment variables from `.env`
 * - Connects to MongoDB
 * - Deletes existing admin (if any)
 * - Creates a new admin user with hardcoded credentials
 * - Verifies the password works using `matchPassword`
 * - Disconnects from MongoDB after execution
 *
 * Dependencies:
 * - mongoose: For DB connection and schema operations
 * - dotenv: Loads environment variables from file
 * - path: Resolves path to .env file
 * - User: Mongoose model for users (must have `matchPassword` method defined)
 */

const mongoose = require("mongoose");
const User = require("../../models/User");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Main function to delete any existing admin user and create a fresh one.
 * Also verifies that the password is valid using matchPassword.
 *
 * @returns {Promise<void>}
 */
const createAdmin = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Delete existing admin (if present)
		await User.deleteOne({ email: "admin@example.com" });
		console.log("Deleted existing admin user if any");

		// Create new admin user
		const admin = await User.create({
			name: "Admin User",
			email: "admin@example.com",
			password: "123456",
			role: "admin",
		});

		console.log("Admin user created successfully");

		// Attempt to verify that password hashing and comparison works
		const verifyAdmin = await User.findOne({
			email: "admin@example.com",
		}).select("+password"); // Explicitly include password field
		if (verifyAdmin && (await verifyAdmin.matchPassword("123456"))) {
			console.log("Admin user verified - password is working correctly");
		} else {
			console.log("Warning: Admin user verification failed");
		}

		// Print login credentials
		console.log("\nYou can now log in with:");
		console.log("Email: admin@example.com");
		console.log("Password: 123456");

		await mongoose.disconnect();
	} catch (error) {
		console.error("Error:", error);
	}
};

// Execute the function immediately when the script is run
createAdmin();

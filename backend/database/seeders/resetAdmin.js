/**
 * Reset Admin User Script
 *
 * This script connects to MongoDB and ensures that an admin user with email `admin@example.com` exists
 * and has the password reset to a predefined default ("123456").
 * 
 * If the admin already exists, it hashes the new password and updates it.
 * If the admin does not exist, it creates a new admin user with the hashed password.
 *
 * Functionality:
 * - Loads environment variables from .env
 * - Connects to MongoDB
 * - Checks if an admin user exists
 * - Resets the password or creates the admin user with hashed password
 * - Prints login details
 *
 * Dependencies:
 * - mongoose: For MongoDB interaction
 * - dotenv: Loads environment variables
 * - bcryptjs: For hashing passwords securely
 * - path: For resolving file paths
 * - User: Mongoose model
 */

const mongoose = require("mongoose");
const User = require("../../models/User");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Resets the admin user's password to "123456", or creates the admin if not found.
 * The password is securely hashed using bcrypt before saving.
 *
 * @returns {Promise<void>}
 */
const resetAdmin = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Try to find the admin user
		let admin = await User.findOne({ email: "admin@example.com" });

		if (admin) {
			console.log("Admin user found, resetting password...");

			// Generate hashed password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash("123456", salt);

			// Update the password for the existing admin
			admin = await User.findByIdAndUpdate(
				admin._id,
				{
					password: hashedPassword,
				},
				{ new: true }
			);

			console.log("Admin password reset successfully");
			console.log({
				id: admin._id,
				name: admin.name,
				email: admin.email,
				role: admin.role,
				hasPassword: !!admin.password,
			});
		} else {
			console.log("No admin user found");

			// Create a new admin user with hashed password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash("123456", salt);

			const newAdmin = await User.create({
				name: "Admin User",
				email: "admin@example.com",
				password: hashedPassword,
				role: "admin",
			});

			console.log("New admin user created:", {
				id: newAdmin._id,
				name: newAdmin.name,
				email: newAdmin.email,
				role: newAdmin.role,
				hasPassword: !!newAdmin.password,
			});
		}

		await mongoose.disconnect();

		// Final output
		console.log("\nYou can now log in with:");
		console.log("Email: admin@example.com");
		console.log("Password: 123456");
	} catch (error) {
		console.error("Error:", error);
	}
};

// Run the function immediately when this file is executed
resetAdmin();

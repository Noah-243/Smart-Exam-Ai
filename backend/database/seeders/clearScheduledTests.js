/**
 * Clear Scheduled Tests Script
 *
 * This script connects to the MongoDB database and removes all documents
 * from the `ScheduledTest` collection. It is useful for resetting the test schedule
 * during development or testing phases.
 *
 * Functionality:
 * - Loads environment variables from `.env`
 * - Connects to MongoDB using MONGODB_URI
 * - Deletes all entries from the ScheduledTest collection
 * - Logs success or error messages to the console
 * - Exits the process with status code 0 (success) or 1 (failure)
 *
 * Dependencies:
 * - mongoose: For MongoDB connection and data operations
 * - dotenv: To load environment variables
 * - colors: For colored console logging
 * - ScheduledTest: Mongoose model for scheduled tests
 */

const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const ScheduledTest = require("../../models/ScheduledTest");

// Load environment variables from .env file
dotenv.config({ path: "./.env" });

// Connect to MongoDB using the URI from environment variables
mongoose.connect(process.env.MONGODB_URI);

/**
 * Deletes all scheduled tests from the database.
 * Logs result and exits the Node process.
 *
 * @returns {Promise<void>}
 */
const clearScheduledTests = async () => {
	try {
		await ScheduledTest.deleteMany(); // Delete all documents from the collection
		console.log("Scheduled tests deleted successfully".yellow);
		process.exit(0); // Exit with success
	} catch (error) {
		console.error("Error:", error); // Log the error
		process.exit(1); // Exit with failure
	}
};

// Immediately invoke the function
clearScheduledTests();

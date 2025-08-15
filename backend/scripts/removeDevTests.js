/**
 * Remove DEV TEST Data Script
 *
 * This script connects to the MongoDB database and removes all test documents
 * whose title starts with "DEV TEST", including their associated scheduled tests.
 *
 * Use Case:
 * - After seeding or testing features with fake/dev data (e.g., "DEV TEST - Math"),
 *   this script can be used to clean up test records from the production or staging database.
 *
 * Functionality:
 * - Connects to MongoDB using the connection string from the `.env` file.
 * - Finds all `Test` documents whose title starts with "DEV TEST"
 * - Deletes all `ScheduledTest` entries that are linked to those test IDs
 * - Deletes the `Test` documents themselves
 * - Disconnects from MongoDB
 *
 * How to run:
 *   node scripts/removeDevTests.js
 *
 * @file scripts/removeDevTests.js
 * @author Smart Exam Platform Team
 */

const mongoose = require("mongoose");
const Test = require("../models/Test");
const ScheduledTest = require("../models/ScheduledTest");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

async function removeDevTests() {
	try {
		console.log("Connecting to MongoDB...");
		// Establish connection to the MongoDB database using URI from environment
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Find all Test documents with title starting with "DEV TEST"
		const tests = await Test.find({ title: { $regex: /^DEV TEST/ } });
		const testIds = tests.map((test) => test._id);

		console.log(`Found ${tests.length} DEV TEST items`);

		// If such test IDs exist, remove all related scheduled tests
		if (testIds.length > 0) {
			const scheduledTestResult = await ScheduledTest.deleteMany({
				test: { $in: testIds },
			});
			console.log(
				`Deleted ${scheduledTestResult.deletedCount} scheduled DEV TEST items`
			);
		}

		// Now delete the test documents themselves
		const testResult = await Test.deleteMany({
			title: { $regex: /^DEV TEST/ },
		});
		console.log(`Deleted ${testResult.deletedCount} DEV TEST items`);

		// Disconnect from the MongoDB database
		mongoose.disconnect();
		console.log("Disconnected from MongoDB");
	} catch (error) {
		// Handle and log any errors during execution
		console.error("Error:", error);
	}
}

// Run the cleanup operation
removeDevTests();

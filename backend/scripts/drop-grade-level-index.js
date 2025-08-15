/**
 * @file dropLevelUniqueIndex.js
 * @description 
 * This script connects to a MongoDB database and removes a unique index on the "level" field 
 * from the "grades" collection, if such an index exists. It is typically used in scenarios where 
 * the unique constraint on the level field is no longer valid due to business logic changes or 
 * data model updates in the "Grade" schema.
 *
 * Usage:
 * 1. Make sure the environment variable `MONGODB_URI` is set in a `.env` file.
 * 2. Run this script with Node.js: `node dropLevelUniqueIndex.js`
 *
 * Dependencies:
 * - dotenv: Loads environment variables from a .env file.
 * - mongoose: Used for MongoDB object modeling and connection management.
 *
 * Operations:
 * - Connects to MongoDB.
 * - Retrieves the list of current indexes on the 'grades' collection.
 * - Identifies and drops the unique index on the "level" field if it exists.
 * - Disconnects from MongoDB after the operation.
 *
 * @author Smart Exam Platform Team 
 * @version 1.0
 */

// Load environment variables from .env file
require("dotenv").config();

// Import required modules
const mongoose = require("mongoose");
const Grade = require("../models/Grade"); // This is imported for context but not used directly in this script

/**
 * Drops the unique index on the 'level' field of the 'grades' collection if it exists.
 */
async function dropLevelUniqueIndex() {
	try {
		// Connect to MongoDB using URI from .env
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Access the raw 'grades' collection directly
		const collection = mongoose.connection.collection("grades");

		// Get list of current indexes in the collection
		const indexes = await collection.indexes();
		console.log("Current indexes:", indexes);

		// Check if a unique index on 'level' field exists
		const levelIndex = indexes.find(
			(index) => index.key && index.key.level === 1 && index.unique
		);

		// If found, drop it
		if (levelIndex) {
			console.log("Found level unique index, dropping it...");
			await collection.dropIndex("level_1");
			console.log("Successfully dropped level_1 unique index");
		} else {
			console.log("No unique index on level field found");
		}

		console.log("Finished processing indexes");
	} catch (error) {
		// Log any error during the process
		console.error("Error:", error);
	} finally {
		// Always disconnect from the database
		await mongoose.disconnect();
		console.log("Disconnected from MongoDB");
	}
}

// Execute the function
dropLevelUniqueIndex();

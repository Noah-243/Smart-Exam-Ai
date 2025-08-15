/**
 * Scheduled Test Model Schema
 * 
 * This Mongoose schema defines the structure for scheduling tests for specific grades and teachers.
 * It represents the scheduling metadata of a test without duplicating the test content itself.
 * 
 * Features:
 * - Links a test to a grade and a teacher
 * - Includes scheduling time, status, and duration
 * - Tracks creation and update timestamps automatically
 * 
 * Fields:
 * - test: Reference to the original Test document
 * - grade: Reference to the Grade the test is assigned to
 * - teacher: Reference to the User (teacher) who scheduled it
 * - scheduledAt: Date and time when the test is scheduled to take place
 * - status: Status of the test (scheduled, completed, cancelled)
 * - duration: Duration of the test in minutes
 * 
 * @module models/ScheduledTest
 */

const mongoose = require("mongoose");

// Define the schema for a scheduled test
const scheduledTestSchema = new mongoose.Schema(
	{
		// Reference to the Test being scheduled
		test: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Test",
			required: true,
		},

		// Reference to the Grade (class level) the test is scheduled for
		grade: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Grade",
			required: true,
		},

		// Reference to the Teacher (User) who scheduled the test
		teacher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Scheduled date and time for the test
		scheduledAt: {
			type: Date,
			required: true,
		},

		// Current status of the test schedule
		status: {
			type: String,
			enum: ["scheduled", "completed", "cancelled"],
			default: "scheduled",
		},

		// Duration of the test in minutes
		duration: {
			type: Number,
			required: true,
		},
	},
	{
		// Automatically add createdAt and updatedAt fields
		timestamps: true,
	}
);

// Export the model with the collection name 'ScheduledTest'
module.exports = mongoose.model("ScheduledTest", scheduledTestSchema);

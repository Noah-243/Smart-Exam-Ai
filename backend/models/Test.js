/**
 * Test Model Schema
 *
 * This schema represents a test (exam) created by a teacher.
 * It contains metadata such as grade, subject, duration, and the list of questions with assigned points.
 * 
 * Features:
 * - Linked to grade, subject, and teacher (user)
 * - Supports total score calculation before saving
 * - Includes publication status and timestamps
 * - Indexed for optimized query performance
 * 
 * @module models/Test
 */

const mongoose = require("mongoose");

// Define Test schema
const testSchema = new mongoose.Schema({
	// Title of the test
	title: {
		type: String,
		required: [true, "Please add a test title"],
		trim: true,
	},

	// Optional description of the test
	description: {
		type: String,
		trim: true,
	},

	// Linked grade (e.g., 10th Grade)
	grade: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Grade",
		required: true,
	},

	// Linked subject (e.g., Math, History)
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true,
	},

	// Array of test questions with individual point values
	questions: [
		{
			question: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Question",
				required: true,
			},
			points: {
				type: Number,
				required: true,
				min: 0,
				max: 100,
			},
		},
	],

	// Total points (automatically calculated before save)
	totalPoints: {
		type: Number,
		default: 100,
	},

	// Optional comments for internal use
	comments: {
		type: String,
		trim: true,
	},

	// Reference to the user (teacher) who created the test
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},

	// Duration of the test in minutes
	duration: {
		type: Number,
		required: true,
	},

	// Whether the test is published and available for scheduling
	isPublished: {
		type: Boolean,
		default: false,
	},

	// Timestamp for creation (default: now)
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Indexes for efficient querying
testSchema.index({ grade: 1, subject: 1 }); // Queries for tests by grade and subject
testSchema.index({ user: 1 }); // Queries for tests created by a specific teacher
testSchema.index({ isPublished: 1 }); // Queries for published/unpublished tests
testSchema.index({ createdAt: -1 }); // Sorting and queries by most recent tests

/**
 * Pre-save hook
 * Automatically calculate totalPoints before saving the document
 */
testSchema.pre("save", function (next) {
	this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
	next();
});

// Export the Test model
module.exports = mongoose.model("Test", testSchema);

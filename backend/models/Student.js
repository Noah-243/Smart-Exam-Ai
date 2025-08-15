/**
 * 🎓 Student Model Module
 *
 * Defines the Student MongoDB schema and model with comprehensive functionality:
 * - Student profile management and grade assignment
 * - Exam results tracking and analytics
 * - User account linking and relationship management
 * - Performance calculation and metrics
 * - Academic progress monitoring
 *
 * Features:
 * - User account integration via reference
 * - Grade level assignment and tracking
 * - Comprehensive exam results storage
 * - Automatic average score calculation
 * - Performance indexes for efficient queries
 * - Answer-level detail tracking
 * - Timestamps for audit trail
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const mongoose = require("mongoose");

/**
 * 📝 Exam Result Subdocument Schema
 *
 * Embedded schema for storing individual exam results
 * with detailed answer tracking and performance metrics.
 */
const examResultSchema = new mongoose.Schema({
	/**
	 * Reference to the test taken
	 * @type {ObjectId}
	 * @ref Test
	 * @required
	 */
	test: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Test",
		required: true,
	},

	/**
	 * Score achieved on the test (0-100)
	 * @type {Number}
	 * @required
	 * @min 0
	 * @max 100
	 */
	score: {
		type: Number,
		required: true,
		min: 0,
		max: 100,
	},

	/**
	 * When the test was taken
	 * @type {Date}
	 * @default Date.now
	 */
	takenAt: {
		type: Date,
		default: Date.now,
	},

	/**
	 * Individual answers given during the test
	 * @type {Array}
	 */
	answers: [
		{
			/**
			 * Reference to the question answered
			 * @type {ObjectId}
			 * @ref Question
			 */
			question: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Question",
			},

			/**
			 * Answer provided by the student
			 * @type {String}
			 */
			selectedAnswer: String,

			/**
			 * Whether the answer was correct
			 * @type {Boolean}
			 */
			isCorrect: Boolean,
		},
	],
});

/**
 * 🎓 Student Schema Definition
 *
 * Comprehensive student schema with user integration, grade assignment,
 * and exam results tracking.
 */
const studentSchema = new mongoose.Schema(
	{
		/**
		 * Reference to the associated user account
		 * @type {ObjectId}
		 * @ref User
		 * @required
		 */
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		/**
		 * Student's assigned grade level
		 * @type {ObjectId}
		 * @ref Grade
		 * @required
		 */
		grade: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Grade",
			required: true,
		},

		/**
		 * Array of exam results for this student
		 * @type {Array}
		 * @subdocument examResultSchema
		 */
		examResults: [examResultSchema],
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields
		toJSON: { virtuals: true }, // Include virtuals when converting to JSON
		toObject: { virtuals: true }, // Include virtuals when converting to Object
	}
);

/**
 * 📊 Database Indexes for Performance Optimization
 *
 * Indexes on frequently queried fields to improve query performance.
 */
studentSchema.index({ grade: 1 }); // Index for grade queries
studentSchema.index({ user: 1 }); // Index for user queries

console.log(`📊 Student model indexes created for performance optimization`);

/**
 * 📈 Virtual: Average Score
 *
 * Calculates the student's average score across all exam results.
 * Returns 0 if no exams have been taken.
 *
 * @virtual
 * @returns {string} Average score formatted to 2 decimal places
 */
studentSchema.virtual("averageScore").get(function () {
	if (!this.examResults.length) {
		console.log(
			`📈 Average score calculated for student ${this._id}: 0 (no exams)`
		);
		return "0.00";
	}

	const sum = this.examResults.reduce((acc, result) => acc + result.score, 0);
	const average = (sum / this.examResults.length).toFixed(2);

	console.log(
		`📈 Average score calculated for student ${this._id}: ${average}% (${this.examResults.length} exams)`
	);

	return average;
});

/**
 * 🔧 Pre-save Middleware: Validation and Logging
 *
 * Validates student data and logs creation/updates.
 *
 * @middleware
 */
studentSchema.pre("save", function (next) {
	console.log(`🎓 Pre-save middleware: Student ${this._id || "new"}`);
	console.log(`👤 User: ${this.user}, Grade: ${this.grade}`);
	console.log(`📊 Exam results: ${this.examResults.length}`);

	next();
});

/**
 * 🔧 Post-save Middleware: Success Logging
 *
 * Logs successful student creation/updates for audit purposes.
 *
 * @middleware
 */
studentSchema.post("save", function (doc) {
	if (doc.isNew) {
		console.log(`🎉 New student created successfully`);
		console.log(`🆔 Student ID: ${doc._id}`);
		console.log(`👤 User: ${doc.user}, Grade: ${doc.grade}`);
	} else {
		console.log(`✏️ Student updated successfully: ${doc._id}`);
		console.log(`📊 Total exam results: ${doc.examResults.length}`);
		if (doc.examResults.length > 0) {
			console.log(`📈 Current average: ${doc.averageScore}%`);
		}
	}
});

/**
 * 🗑️ Pre-remove Middleware: Cleanup Logging
 *
 * Logs student deletion for audit purposes.
 *
 * @middleware
 */
studentSchema.pre("deleteOne", { document: true, query: false }, function () {
	console.log(`🗑️ Deleting student: ${this._id}`);
	console.log(`👤 User: ${this.user}, Grade: ${this.grade}`);
	console.log(`📊 Exam results to be lost: ${this.examResults.length}`);
	console.log(`⚠️ Note: Associated user account should be handled separately`);
});

// Create and export the Student model
const Student = mongoose.model("Student", studentSchema);

console.log(
	`📚 Student model registered with schema validation and middleware`
);

module.exports = Student;

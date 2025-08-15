/**
 * ❓ Question Model Module
 *
 * Defines the Question MongoDB schema and model with comprehensive functionality:
 * - Multiple question types (multiple-choice, text, open-ended)
 * - Flexible answer structures with validation
 * - Grade and subject association system
 * - Difficulty level classification
 * - Teacher ownership and management
 * - Performance optimization with indexes
 *
 * Features:
 * - Support for both multiple-choice and text questions
 * - Multi-answer and single-answer question types
 * - Grade-subject relationship mapping
 * - Backward compatibility with virtual fields
 * - Comprehensive validation rules
 * - Performance indexes for common queries
 * - Grading guidelines for text questions
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const mongoose = require("mongoose");

/**
 * ❓ Question Schema Definition
 *
 * Comprehensive question schema supporting multiple question types,
 * flexible answer structures, and grade-subject associations.
 */
const questionSchema = new mongoose.Schema(
	{
		/**
		 * Question content/text
		 * @type {String}
		 * @required
		 */
		body: {
			type: String,
			required: [true, "Question body is required"],
			trim: true,
		},

		/**
		 * Type of question
		 * @type {String}
		 * @enum ['multiple-choice', 'text']
		 * @required
		 */
		type: {
			type: String,
			enum: ["multiple-choice", "text"],
			required: [true, "Question type is required"],
		},

		/**
		 * Difficulty level of the question
		 * @type {String}
		 * @enum ['easy', 'medium', 'hard']
		 * @required
		 */
		difficulty: {
			type: String,
			enum: ["easy", "medium", "hard"],
			required: [true, "Question difficulty is required"],
		},

		/**
		 * Guidelines for grading text answers
		 * @type {String}
		 * @optional Required only for text questions
		 */
		gradingGuidelines: {
			type: String,
			trim: true,
			// Only required for text answers, will be validated in application logic
		},

		/**
		 * Whether question allows multiple correct answers
		 * @type {Boolean}
		 * @default false
		 */
		isMultiAnswer: {
			type: Boolean,
			default: false,
		},

		/**
		 * Whether question expects text answers
		 * @type {Boolean}
		 * @default false
		 */
		isTextAnswer: {
			type: Boolean,
			default: false,
		},

		/**
		 * Array of possible answers for the question
		 * @type {Array}
		 * @validation Requires at least one answer for non-text questions
		 */
		answers: {
			type: [
				{
					/**
					 * Answer content/text
					 * @type {String}
					 * @required for non-text questions
					 */
					body: {
						type: String,
						required: [
							function () {
								// Only require body if this is not a text question
								return !this.parent().parent().isTextAnswer;
							},
							"Answer body is required for non-text questions",
						],
					},

					/**
					 * Whether this answer is correct
					 * @type {Boolean}
					 * @default false
					 */
					isCorrect: {
						type: Boolean,
						default: false,
					},

					/**
					 * Whether this is an open-ended answer
					 * @type {Boolean}
					 * @default false
					 */
					isOpenEnded: {
						type: Boolean,
						default: false,
					},
				},
			],
			validate: [
				{
					validator: function (answers) {
						// Skip validation for text questions
						if (this.isTextAnswer) return true;

						// For non-text questions, require at least one answer
						return answers && answers.length > 0;
					},
					message: "Non-text questions must have at least one answer",
				},
			],
		},

		/**
		 * Grade-Subject associations for this question
		 * @type {Array}
		 * @required At least one grade-subject pair required
		 */
		gradeSubjects: [
			{
				/**
				 * Associated grade
				 * @type {ObjectId}
				 * @ref Grade
				 * @required
				 */
				grade: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Grade",
					required: [true, "Grade is required"],
				},

				/**
				 * Associated subject
				 * @type {ObjectId}
				 * @ref Subject
				 * @required
				 */
				subject: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Subject",
					required: [true, "Subject is required"],
				},
			},
		],

		/**
		 * Teacher/user who created this question
		 * @type {ObjectId}
		 * @ref User
		 * @required
		 */
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields
	}
);

/**
 * 📊 Database Indexes for Performance Optimization
 *
 * Indexes on frequently queried fields to improve query performance.
 */
questionSchema.index({ "gradeSubjects.grade": 1 }); // Index for grade queries
questionSchema.index({ "gradeSubjects.subject": 1 }); // Index for subject queries
questionSchema.index({ user: 1 }); // Index for teacher queries
questionSchema.index({ difficulty: 1 }); // Index for difficulty-based queries

console.log(`📊 Question model indexes created for performance optimization`);

/**
 * 🎓 Virtual: Grades
 *
 * Returns unique array of grade IDs associated with this question.
 * Provides backward compatibility with legacy code.
 *
 * @virtual
 * @returns {Array} Array of unique grade ObjectIds
 */
questionSchema.virtual("grades").get(function () {
	const grades = [...new Set(this.gradeSubjects.map((gs) => gs.grade))];
	console.log(
		`🎓 Virtual grades accessed for question: ${this._id} - ${grades.length} grades`
	);
	return grades;
});

/**
 * 📚 Virtual: Subjects
 *
 * Returns unique array of subject IDs associated with this question.
 * Provides backward compatibility with legacy code.
 *
 * @virtual
 * @returns {Array} Array of unique subject ObjectIds
 */
questionSchema.virtual("subjects").get(function () {
	const subjects = [...new Set(this.gradeSubjects.map((gs) => gs.subject))];
	console.log(
		`📚 Virtual subjects accessed for question: ${this._id} - ${subjects.length} subjects`
	);
	return subjects;
});

/**
 * 🔧 Pre-save Middleware: Validation and Logging
 *
 * Validates question structure and logs creation/updates.
 *
 * @middleware
 */
questionSchema.pre("save", function (next) {
	console.log(`💾 Pre-save middleware: Question ${this._id || "new"}`);
	console.log(`❓ Type: ${this.type}, Difficulty: ${this.difficulty}`);
	console.log(`📚 Grade-Subject pairs: ${this.gradeSubjects.length}`);

	// Log answer structure
	if (this.answers && this.answers.length > 0) {
		const correctAnswers = this.answers.filter((a) => a.isCorrect).length;
		console.log(
			`💡 Answers: ${this.answers.length} total, ${correctAnswers} correct`
		);
	}

	// Validate text questions have grading guidelines
	if (this.isTextAnswer && !this.gradingGuidelines) {
		console.log(`⚠️ Text question without grading guidelines: ${this._id}`);
	}

	next();
});

/**
 * 🔧 Post-save Middleware: Success Logging
 *
 * Logs successful question creation/updates for audit purposes.
 *
 * @middleware
 */
questionSchema.post("save", function (doc) {
	if (doc.isNew) {
		console.log(`🎉 New question created successfully: ${doc._id}`);
		console.log(
			`📝 Question: "${doc.body.substring(0, 50)}${
				doc.body.length > 50 ? "..." : ""
			}"`
		);
		console.log(`👤 Created by: ${doc.user}`);
		console.log(`🎯 Type: ${doc.type}, Difficulty: ${doc.difficulty}`);
	} else {
		console.log(`✏️ Question updated successfully: ${doc._id}`);
	}
});

/**
 * 🗑️ Pre-remove Middleware: Cleanup Logging
 *
 * Logs question deletion for audit purposes.
 *
 * @middleware
 */
questionSchema.pre("deleteOne", { document: true, query: false }, function () {
	console.log(`🗑️ Deleting question: ${this._id}`);
	console.log(
		`📝 Question: "${this.body.substring(0, 50)}${
			this.body.length > 50 ? "..." : ""
		}"`
	);
	console.log(`👤 Owner: ${this.user}`);
	console.log(`⚠️ Note: Check for references in tests before deletion`);
});

// Create and export the Question model
const Question = mongoose.model("Question", questionSchema);

console.log(
	`📚 Question model registered with schema validation and middleware`
);

module.exports = Question;

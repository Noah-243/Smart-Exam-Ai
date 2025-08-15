/**
 * Answer Model Schema
 * 
 * This Mongoose schema defines the structure for storing students' answers to test questions.
 * It links each answer to a question, a student, and a specific student test instance.
 * 
 * Features:
 * - Tracks whether the answer is correct
 * - Allows feedback and grading metadata
 * - Supports automatic timestamps
 * 
 * Fields:
 * - question: Reference to the original question
 * - student: Reference to the user (student) who answered
 * - studentTest: Reference to the test instance this answer belongs to
 * - answer: The actual answer content (text)
 * - isCorrect: Boolean flag indicating if the answer is correct
 * - feedback: Optional feedback provided by the grader or system
 * - points: Score assigned to this answer (0–10 range)
 * - graded: Indicates whether the answer has been graded
 * - gradedAt: Timestamp of when the grading occurred
 * 
 * @module models/Answer
 */

const mongoose = require("mongoose");

// Define the schema for a student's answer to a test question
const answerSchema = new mongoose.Schema(
	{
		// Reference to the related question
		question: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Question",
			required: true,
		},

		// Reference to the student (User model)
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Reference to the specific student test this answer belongs to
		studentTest: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "StudentTest",
			required: true,
		},

		// The answer content provided by the student (text or selected choice)
		answer: {
			type: String,
			default: "",
		},

		// Indicates if the answer is correct (used for auto-graded or reviewed answers)
		isCorrect: {
			type: Boolean,
			default: false,
		},

		// Optional feedback or explanation from teacher or AI
		feedback: {
			type: String,
			default: "",
		},

		// Points awarded for this answer, range 0–10
		points: {
			type: Number,
			default: 0,
			min: 0,
			max: 10,
		},

		// Whether the answer has been reviewed/graded
		graded: {
			type: Boolean,
			default: false,
		},

		// Timestamp for when the grading occurred
		gradedAt: {
			type: Date,
		},
	},
	{
		// Automatically include createdAt and updatedAt timestamps
		timestamps: true,
	}
);

// Export the model with the collection name 'Answer'
module.exports = mongoose.model("Answer", answerSchema);

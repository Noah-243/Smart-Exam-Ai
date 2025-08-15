/**
 * Student Test Model Schema
 *
 * This schema represents a student's submitted test attempt.
 * It stores the student's answers, test result details, and metadata such as grading and submission times.
 *
 * Features:
 * - Links to the student (User) and scheduled test (ScheduledTest)
 * - Contains all answers given by the student with scoring and feedback
 * - Tracks test score, grading status, and timestamps
 *
 * Fields:
 * - student: Reference to the User (student) who took the test
 * - scheduledTest: Reference to the ScheduledTest assigned
 * - answers: Array of answers including correctness, feedback, and points
 * - score: Final score of the test (0–100)
 * - status: State of the test (pending, completed, graded, failed)
 * - submittedAt: When the student submitted the test
 * - gradedAt: When the test was graded
 *
 * @module models/StudentTest
 */

const mongoose = require("mongoose");

const studentTestSchema = new mongoose.Schema(
	{
		// Reference to the student (User model)
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Reference to the scheduled test instance
		scheduledTest: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ScheduledTest",
			required: true,
		},

		// Array of student's answers to the test questions
		answers: [
			{
				_id: false, // Prevents automatic _id generation for subdocuments

				// Reference to the question being answered
				question: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Question",
					required: true,
				},

				// Student's answer content (text or selected option)
				answer: {
					type: String,
					default: "",
				},

				// Whether the answer is correct
				isCorrect: {
					type: Boolean,
					default: false,
				},

				// Optional feedback (AI or teacher generated)
				feedback: {
					type: String,
					default: "",
				},

				// Points earned by the student for this answer
				points: {
					type: Number,
					default: 0,
					min: 0,
				},

				// Maximum possible points for the question
				maxPoints: {
					type: Number,
					default: 50,
					min: 0,
				},
			},
		],

		// Total score from all answers (0–100 scale)
		score: {
			type: Number,
			min: 0,
			max: 100,
			required: true,
		},

		// General feedback for the test as a whole
		feedback: {
			type: String,
			default: "",
		},

		// Status of the test lifecycle
		status: {
			type: String,
			enum: ["pending", "completed", "graded", "failed"],
			default: "pending",
		},

		// Date and time when the test was submitted
		submittedAt: {
			type: Date,
			default: Date.now,
		},

		// Date and time when the test was graded
		gradedAt: {
			type: Date,
		},
	},
	{
		// Automatically add createdAt and updatedAt fields
		timestamps: true,
	}
);

// Export the model
module.exports = mongoose.model("StudentTest", studentTestSchema);

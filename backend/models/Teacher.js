/**
 * Teacher Model Schema
 * 
 * This schema represents a teacher entity in the system.
 * It links each teacher to a user, teaching assignments (subjects + grades),
 * and their specializations.
 * 
 * Features:
 * - Embedded teaching assignments with references to subjects and grades
 * - Specializations for advanced filtering and categorization
 * - Utility methods for checking if a teacher teaches a specific subject or grade
 * 
 * @module models/Teacher
 */

const mongoose = require("mongoose");

// Sub-schema for teaching assignments: subject + grades list
const teachingAssignmentSchema = new mongoose.Schema({
	// Subject the teacher is assigned to
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true,
	},

	// Grades the teacher teaches the subject to
	grades: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Grade",
		},
	],
});

// Main Teacher schema
const teacherSchema = new mongoose.Schema(
	{
		// Reference to the User document (login/profile)
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		// Array of teaching assignments (subject + grades)
		teachingAssignments: [teachingAssignmentSchema],

		// List of teacher's academic specializations
		specializations: [
			{
				type: String,
				required: true,
			},
		],
	},
	{
		// Automatically include createdAt and updatedAt timestamps
		timestamps: true,
	}
);

/**
 * @method teachesGrade
 * Check if the teacher teaches a specific grade
 * @param {ObjectId} gradeId - Grade ID to check
 * @returns {boolean} True if teacher teaches the grade
 */
teacherSchema.methods.teachesGrade = function (gradeId) {
	return this.teachingAssignments.some((assignment) =>
		assignment.grades.some((grade) => grade.equals(gradeId))
	);
};

/**
 * @method teachesSubject
 * Check if the teacher teaches a specific subject
 * @param {ObjectId} subjectId - Subject ID to check
 * @returns {boolean} True if teacher teaches the subject
 */
teacherSchema.methods.teachesSubject = function (subjectId) {
	return this.teachingAssignments.some((assignment) =>
		assignment.subject.equals(subjectId)
	);
};

// Export the Teacher model
const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;

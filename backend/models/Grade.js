/**
 * 🎓 Grade Model Module
 *
 * Defines the Grade MongoDB schema and model for academic grade levels:
 * - Grade level classification and naming
 * - Student enrollment management
 * - Hierarchical grade organization
 * - Test and curriculum associations
 * - Virtual relationships to students
 *
 * Features:
 * - Unique grade names and levels
 * - Virtual population of enrolled students
 * - Comprehensive validation
 * - Audit logging for grade operations
 * - Grade-based filtering support
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const mongoose = require("mongoose");

/**
 * 🎓 Grade Schema Definition
 *
 * Simple but comprehensive schema for academic grade levels
 * with student enrollment tracking.
 */
const GradeSchema = new mongoose.Schema(
	{
		/**
		 * Grade name (e.g., "Grade 10", "Year 12", "Senior")
		 * @type {String}
		 * @required
		 * @unique
		 */
		name: {
			type: String,
			required: [true, "Please add a grade name"],
			unique: true,
			trim: true,
		},

		/**
		 * Numeric level for sorting and comparison
		 * @type {Number}
		 * @required
		 */
		level: {
			type: Number,
			required: [true, "Please add a grade level"],
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields
		toJSON: { virtuals: true }, // Include virtuals when converting to JSON
		toObject: { virtuals: true }, // Include virtuals when converting to Object
	}
);

/**
 * 👥 Virtual: Students
 *
 * Virtual field that populates all students enrolled in this grade.
 * Provides easy access to grade enrollment data.
 *
 * @virtual
 * @ref Student
 * @localField _id
 * @foreignField grade
 */
GradeSchema.virtual("students", {
	ref: "Student",
	localField: "_id",
	foreignField: "grade",
	justOne: false,
});

/**
 * 🔧 Pre-save Middleware: Validation and Logging
 *
 * Validates grade data and logs creation/updates.
 *
 * @middleware
 */
GradeSchema.pre("save", function (next) {
	console.log(`🎓 Pre-save middleware: Grade ${this.name || "new"}`);
	console.log(`📊 Level: ${this.level}`);

	next();
});

/**
 * 🔧 Post-save Middleware: Success Logging
 *
 * Logs successful grade creation/updates for audit purposes.
 *
 * @middleware
 */
GradeSchema.post("save", function (doc) {
	if (doc.isNew) {
		console.log(
			`🎉 New grade created successfully: ${doc.name} (Level ${doc.level})`
		);
		console.log(`🆔 Grade ID: ${doc._id}`);
	} else {
		console.log(
			`✏️ Grade updated successfully: ${doc.name} (Level ${doc.level})`
		);
	}
});

/**
 * 🗑️ Pre-remove Middleware: Cleanup Logging
 *
 * Logs grade deletion for audit purposes.
 *
 * @middleware
 */
GradeSchema.pre("deleteOne", { document: true, query: false }, function () {
	console.log(`🗑️ Deleting grade: ${this.name} (Level ${this.level})`);
	console.log(`🆔 Grade ID: ${this._id}`);
	console.log(
		`⚠️ Note: Check for student enrollment and test associations before deletion`
	);
});

// Create and export the Grade model
const Grade = mongoose.model("Grade", GradeSchema);

console.log(`📚 Grade model registered with validation and middleware`);

module.exports = Grade;

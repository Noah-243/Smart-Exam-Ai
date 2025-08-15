/**
 * Subject Model
 * MongoDB schema for academic subjects in Exemind-AI system
 *
 * Features:
 * - Unique subject names with validation
 * - Optional subject descriptions
 * - Trimmed text fields for data consistency
 * - Automatic timestamp generation
 *
 * @module models/Subject
 * @author Exemind-AI Team
 */

const mongoose = require("mongoose");

/**
 * Subject Schema Definition
 * Defines the structure for academic subjects
 */
const subjectSchema = new mongoose.Schema(
	{
		/**
		 * Subject Name
		 * Required unique identifier for the academic subject
		 * @type {String}
		 * @required
		 * @unique
		 * @example "Mathematics", "English Literature", "Computer Science"
		 */
		name: {
			type: String,
			required: [true, "Please add a subject name"],
			unique: true,
			trim: true,
			maxlength: [100, "Subject name cannot exceed 100 characters"],
			minlength: [2, "Subject name must be at least 2 characters"],
		},

		/**
		 * Subject Description
		 * Optional detailed description of the subject content and scope
		 * @type {String}
		 * @optional
		 * @example "Advanced mathematical concepts including calculus and statistics"
		 */
		description: {
			type: String,
			trim: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
	},
	{
		/**
		 * Schema Options
		 * Automatically add createdAt and updatedAt timestamps
		 */
		timestamps: true,

		/**
		 * Transform function for JSON serialization
		 * Customize the output when converting to JSON
		 */
		toJSON: {
			transform: function (doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

/**
 * Pre-save middleware
 * Capitalize first letter of subject name for consistency
 */
subjectSchema.pre("save", function (next) {
	if (this.isModified("name")) {
		// Capitalize first letter of each word for consistency
		this.name = this.name.replace(/\w\S*/g, (txt) => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}
	next();
});

/**
 * Static Methods
 */

/**
 * Find subject by name (case-insensitive)
 * @param {String} name - Subject name to search for
 * @returns {Promise<Object|null>} Subject document or null
 */
subjectSchema.statics.findByName = function (name) {
	return this.findOne({
		name: new RegExp(`^${name}$`, "i"),
	});
};

/**
 * Get subjects count
 * @returns {Promise<Number>} Total number of subjects
 */
subjectSchema.statics.getCount = function () {
	return this.countDocuments();
};

/**
 * Instance Methods
 */

/**
 * Get formatted subject name with description
 * @returns {String} Formatted string representation
 */
subjectSchema.methods.getDisplayName = function () {
	return this.description ? `${this.name} - ${this.description}` : this.name;
};

/**
 * Export the Subject model
 * Creates and exports the Subject model based on the schema
 */
module.exports = mongoose.model("Subject", subjectSchema);

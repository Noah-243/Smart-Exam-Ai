/**
 * 👤 User Model Module
 *
 * Defines the User MongoDB schema and model with comprehensive functionality:
 * - User authentication and authorization
 * - Role-based access control (student, teacher, admin)
 * - Profile linking to Student/Teacher models
 * - Password hashing and validation
 * - JWT token generation and management
 * - Email validation and uniqueness
 * - Relationship management with test data
 *
 * Features:
 * - Automatic password hashing with bcrypt
 * - JWT token generation for authentication
 * - Password comparison methods
 * - Role-based profile linking via refPath
 * - Virtual relationships to student tests
 * - Comprehensive validation and constraints
 * - Timestamps for audit trail
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * 👤 User Schema Definition
 *
 * Comprehensive user schema with role-based access control and profile linking.
 * Supports students, teachers, and administrators with appropriate constraints.
 */
const userSchema = new mongoose.Schema(
	{
		/**
		 * User's full name
		 * @type {String}
		 * @required
		 */
		name: {
			type: String,
			required: [true, "Please provide a name"],
			trim: true,
		},

		/**
		 * User's email address (unique identifier)
		 * @type {String}
		 * @required
		 * @unique
		 */
		email: {
			type: String,
			required: [true, "Please provide an email"],
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email",
			],
		},

		/**
		 * User's password (hashed automatically)
		 * @type {String}
		 * @required
		 * @select false (excluded from queries by default)
		 */
		password: {
			type: String,
			required: [true, "Please provide a password"],
			minlength: 6,
			select: false,
		},

		/**
		 * User's role in the system
		 * @type {String}
		 * @enum ['student', 'teacher', 'admin']
		 * @default 'student'
		 */
		role: {
			type: String,
			enum: ["student", "teacher", "admin"],
			default: "student",
		},

		/**
		 * Type of profile linked to this user
		 * @type {String}
		 * @enum ['Student', 'Teacher']
		 * @required for non-admin users
		 */
		profileType: {
			type: String,
			enum: ["Student", "Teacher"],
			required: function () {
				return this.role !== "admin";
			},
		},

		/**
		 * Reference to the linked profile document
		 * @type {ObjectId}
		 * @ref Determined by profileType via refPath
		 * @required for non-admin users
		 */
		profileId: {
			type: mongoose.Schema.Types.ObjectId,
			refPath: "profileType",
			required: function () {
				return this.role !== "admin";
			},
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields
		toJSON: { virtuals: true }, // Include virtuals when converting to JSON
		toObject: { virtuals: true }, // Include virtuals when converting to Object
	}
);

/**
 * 🔐 Pre-save Middleware: Password Hashing
 *
 * Automatically hashes the password using bcrypt before saving to database.
 * Only runs when password field is modified to avoid unnecessary hashing.
 *
 * @middleware
 * @async
 */
userSchema.pre("save", async function (next) {
	console.log(`🔐 Pre-save middleware: User ${this.email}`);

	// Only hash the password if it has been modified (or is new)
	if (!this.isModified("password")) {
		console.log(`⏭️ Password not modified, skipping hash for: ${this.email}`);
		return next();
	}

	try {
		console.log(`🔒 Hashing password for user: ${this.email}`);
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		console.log(`✅ Password hashed successfully for: ${this.email}`);
		next();
	} catch (error) {
		console.error(
			`💥 Error hashing password for ${this.email}:`,
			error.message
		);
		next(error);
	}
});

/**
 * 🎫 Generate Signed JWT Token
 *
 * Creates and returns a JWT token for user authentication.
 * Token includes user ID and expires according to environment settings.
 *
 * @method
 * @returns {string} Signed JWT token
 *
 * @example
 * const user = await User.findById(userId);
 * const token = user.getSignedJwtToken();
 * res.cookie('token', token, { httpOnly: true });
 */
userSchema.methods.getSignedJwtToken = function () {
	console.log(
		`🎫 Generating JWT token for user: ${this.email} (ID: ${this._id})`
	);

	try {
		const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRE,
		});

		console.log(`✅ JWT token generated successfully for: ${this.email}`);
		console.log(`⏰ Token expires in: ${process.env.JWT_EXPIRE}`);

		return token;
	} catch (error) {
		console.error(
			`💥 Error generating JWT token for ${this.email}:`,
			error.message
		);
		throw error;
	}
};

/**
 * 🔍 Password Comparison Method
 *
 * Compares a plain text password with the hashed password in the database.
 * Used for authentication during login.
 *
 * @method
 * @async
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 *
 * @example
 * const user = await User.findOne({ email }).select('+password');
 * const isMatch = await user.matchPassword(password);
 * if (isMatch) {
 *   // User authenticated successfully
 * }
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
	console.log(`🔍 Comparing password for user: ${this.email}`);

	try {
		const isMatch = await bcrypt.compare(enteredPassword, this.password);

		if (isMatch) {
			console.log(`✅ Password match successful for: ${this.email}`);
		} else {
			console.log(`❌ Password match failed for: ${this.email}`);
		}

		return isMatch;
	} catch (error) {
		console.error(
			`💥 Error comparing password for ${this.email}:`,
			error.message
		);
		throw error;
	}
};

/**
 * 📊 Virtual: Taken Tests
 *
 * Virtual field that populates all tests taken by this user.
 * Only relevant for student users, links to StudentTest collection.
 *
 * @virtual
 * @ref StudentTest
 * @localField _id
 * @foreignField student
 */
userSchema.virtual("takenTests", {
	ref: "StudentTest",
	localField: "_id",
	foreignField: "student",
});

/**
 * 🔧 Post-save Middleware: Logging
 *
 * Logs successful user creation/updates for audit purposes.
 *
 * @middleware
 */
userSchema.post("save", function (doc) {
	if (doc.isNew) {
		console.log(`🎉 New user created successfully: ${doc.email} (${doc.role})`);
		console.log(`🆔 User ID: ${doc._id}`);
		console.log(`📅 Created at: ${doc.createdAt}`);

		if (doc.profileType && doc.profileId) {
			console.log(
				`🔗 Profile linked: ${doc.profileType} (ID: ${doc.profileId})`
			);
		}
	} else {
		console.log(`✏️ User updated successfully: ${doc.email}`);
		console.log(`📅 Updated at: ${doc.updatedAt}`);
	}
});

/**
 * 🗑️ Pre-remove Middleware: Cleanup Logging
 *
 * Logs user deletion for audit purposes.
 *
 * @middleware
 */
userSchema.pre("deleteOne", { document: true, query: false }, function () {
	console.log(`🗑️ Deleting user: ${this.email} (${this.role})`);
	console.log(`🆔 User ID: ${this._id}`);

	if (this.profileType && this.profileId) {
		console.log(
			`⚠️ Note: Associated ${this.profileType} profile should be cleaned up separately`
		);
	}
});

// Create and export the User model
const User = mongoose.model("User", userSchema);

console.log(`📚 User model registered with schema validation and middleware`);

module.exports = User;

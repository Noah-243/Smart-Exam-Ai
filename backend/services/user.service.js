/**
 * 👥 User Service Module
 *
 * Comprehensive user management service providing full user lifecycle operations:
 * - User account creation with role-based profile linking
 * - User authentication and authorization support
 * - Profile management for students and teachers
 * - Password management and security
 * - Dashboard analytics and user statistics
 * - Role-based user filtering and retrieval
 *
 * Features:
 * - Transaction-based user creation with profile linking
 * - Automatic profile creation for students and teachers
 * - Role-based data population and access control
 * - Password hashing and validation
 * - Dashboard metrics and user analytics
 * - Comprehensive error handling and logging
 *
 * @author Smart Exam Platform Team
 * @version 1.0.0
 * @since 2024
 */

const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");

/**
 * 👥 UserService Class
 *
 * Handles all user-related business logic including account management,
 * authentication support, and role-based operations.
 */
class UserService {
	/**
	 * 🆕 Create New User Account
	 *
	 * Creates a new user with role-based profile linking using MongoDB transactions.
	 * Automatically creates associated Student or Teacher profiles based on role.
	 * Ensures data consistency through transaction management.
	 *
	 * @param {Object} userData - User registration data
	 * @param {string} userData.name - User's full name
	 * @param {string} userData.email - User's email address
	 * @param {string} userData.password - User's password (will be hashed)
	 * @param {string} userData.role - User role: 'student', 'teacher', or 'admin'
	 * @param {string} userData.grade - Grade ID (required for students)
	 * @param {string} userData.specialization - Specialization (required for teachers)
	 * @param {Array} userData.teachingAssignments - Teaching assignments (optional for teachers)
	 * @param {boolean} validateBeforeSave - Whether to validate before saving
	 * @returns {Promise<Object>} Created user object
	 * @throws {ErrorResponse} If validation fails or transaction fails
	 *
	 * @example
	 * const studentData = {
	 *   name: 'John Doe',
	 *   email: 'john@example.com',
	 *   password: 'password123',
	 *   role: 'student',
	 *   grade: '60d5ecb54e4b5c001f647c9a'
	 * };
	 * const user = await userService.createUser(studentData);
	 */
	async createUser(userData, validateBeforeSave = false) {
		console.log(`🆕 Creating new user account: ${userData.email}`);
		console.log(`👤 Name: ${userData.name}, Role: ${userData.role}`);
		const startTime = Date.now();

		// Start a MongoDB session for transaction
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Extract profile-specific data if present
			const { grade, specialization, teachingAssignments, ...userDataOnly } =
				userData;

			// Create user with a temporary profile ID that will be updated later
			const tempProfileId = new mongoose.Types.ObjectId();
			console.log(`🔗 Generated temp profile ID: ${tempProfileId}`);

			// Set profileType based on role
			if (userData.role === "student" || userData.role === "teacher") {
				userDataOnly.profileType =
					userData.role === "student" ? "Student" : "Teacher";
				userDataOnly.profileId = tempProfileId;
				console.log(`📋 Profile type set: ${userDataOnly.profileType}`);
			}

			// Create the user
			console.log(`💾 Creating user document...`);
			const user = new User(userDataOnly);
			await user.save({ validateBeforeSave, session });
			console.log(`✅ User created with ID: ${user._id}`);

			// Create the appropriate profile based on role
			if (userData.role === "student") {
				if (!grade) {
					console.log(`❌ Grade missing for student account`);
					throw new ErrorResponse(
						"Grade is required for student accounts",
						400
					);
				}

				// Create student profile
				console.log(`🎓 Creating student profile with grade: ${grade}`);
				await Student.create(
					[
						{
							_id: tempProfileId,
							user: user._id,
							grade: grade,
						},
					],
					{ session }
				);

				console.log(`✅ Student profile created for user ${user.name}`);
			} else if (userData.role === "teacher") {
				if (!specialization) {
					console.log(`❌ Specialization missing for teacher account`);
					throw new ErrorResponse(
						"Specialization is required for teacher accounts",
						400
					);
				}

				// Create teacher profile with default empty teachingAssignments if not provided
				console.log(
					`👨‍🏫 Creating teacher profile with specialization: ${specialization}`
				);
				await Teacher.create(
					[
						{
							_id: tempProfileId,
							user: user._id,
							specialization: specialization,
							teachingAssignments: teachingAssignments || [],
						},
					],
					{ session }
				);

				console.log(`✅ Teacher profile created for user ${user.name}`);
				console.log(
					`📚 Teaching assignments: ${
						(teachingAssignments || []).length
					} subjects`
				);
			}

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			const processingTime = Date.now() - startTime;
			console.log(
				`🎉 User creation completed successfully in ${processingTime}ms`
			);
			console.log(`🆔 Final user ID: ${user._id}`);

			return user;
		} catch (error) {
			// Abort transaction on error
			await session.abortTransaction();
			session.endSession();

			const processingTime = Date.now() - startTime;
			console.error(
				`💥 User creation failed (${processingTime}ms):`,
				error.message
			);
			console.error(`📧 Attempted email: ${userData.email}`);
			console.error(`👤 Attempted role: ${userData.role}`);
			throw error;
		}
	}

	/**
	 * 🔍 Get User by ID
	 *
	 * Retrieves a user by ID with populated profile data based on role.
	 * Includes password field and role-specific profile information.
	 *
	 * @param {string} id - User MongoDB ObjectId
	 * @returns {Promise<Object>} User object with populated profile
	 * @throws {ErrorResponse} 404 if user not found
	 *
	 * @example
	 * const user = await userService.getUserById('60d5ecb54e4b5c001f647c9a');
	 * console.log(user.profile); // Student or Teacher profile data
	 */
	async getUserById(id) {
		console.log(`🔍 Retrieving user by ID: ${id}`);

		try {
			const user = await User.findById(id).select("+password");
			if (!user) {
				console.log(`❌ User not found with ID: ${id}`);
				throw new ErrorResponse("User not found", 404);
			}

			console.log(`✅ User found: ${user.name} (${user.email})`);
			console.log(`👤 Role: ${user.role}`);

			if (user.profileType && user.profileId) {
				console.log(
					`🔗 Loading ${user.profileType} profile: ${user.profileId}`
				);
				let populateOptions = {};

				if (user.role === "student") {
					populateOptions = { path: "grade", select: "name" };
				} else if (user.role === "teacher") {
					populateOptions = {
						path: "teachingAssignments",
						populate: {
							path: "subject grades",
							select: "name",
						},
					};
				}

				const profile = await mongoose
					.model(user.profileType)
					.findById(user.profileId)
					.populate(populateOptions);

				if (profile) {
					user._doc.profile = profile;
					console.log(`✅ Profile loaded successfully`);

					if (user.role === "student" && profile.grade) {
						console.log(`🎓 Student grade: ${profile.grade.name}`);
					} else if (user.role === "teacher" && profile.teachingAssignments) {
						console.log(
							`👨‍🏫 Teaching assignments: ${profile.teachingAssignments.length}`
						);
					}
				} else {
					console.log(
						`⚠️ Profile not found for ${user.profileType}: ${user.profileId}`
					);
				}
			}

			return user;
		} catch (error) {
			console.error(`💥 Error retrieving user ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 📧 Get User by Email
	 *
	 * Retrieves a user by email address. Optionally includes password field
	 * for authentication purposes.
	 *
	 * @param {string} email - User's email address
	 * @param {boolean} includePassword - Whether to include password field
	 * @returns {Promise<Object|null>} User object or null if not found
	 *
	 * @example
	 * const user = await userService.getUserByEmail('john@example.com', true);
	 * if (user && user.matchPassword(password)) { // authenticate }
	 */
	async getUserByEmail(email, includePassword = false) {
		console.log(`📧 Looking up user by email: ${email}`);
		console.log(`🔒 Include password: ${includePassword}`);

		try {
			const query = User.findOne({ email });
			if (includePassword) {
				query.select("+password");
			}

			const user = await query;

			if (user) {
				console.log(`✅ User found: ${user.name} (ID: ${user._id})`);
				console.log(`👤 Role: ${user.role}`);
			} else {
				console.log(`❌ No user found with email: ${email}`);
			}

			return user;
		} catch (error) {
			console.error(
				`💥 Error retrieving user by email ${email}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * ✏️ Update User Information
	 *
	 * Updates user data and associated profile information.
	 * Supports updating both user fields and profile-specific data.
	 *
	 * @param {string} id - User MongoDB ObjectId
	 * @param {Object} updateData - Data to update
	 * @param {Object} updateData.profile - Profile-specific data to update
	 * @returns {Promise<Object>} Updated user object
	 * @throws {ErrorResponse} 404 if user or profile not found
	 *
	 * @example
	 * const updates = {
	 *   name: 'Jane Doe',
	 *   profile: { specialization: 'Mathematics' }
	 * };
	 * await userService.updateUser(userId, updates);
	 */
	async updateUser(id, updateData) {
		console.log(`✏️ Updating user: ${id}`);
		console.log(`📝 Update fields:`, Object.keys(updateData));

		try {
			const user = await User.findById(id);
			if (!user) {
				console.log(`❌ User not found: ${id}`);
				throw new ErrorResponse("User not found", 404);
			}

			console.log(`✅ User found: ${user.name} (${user.role})`);

			// Update user fields
			Object.assign(user, updateData);
			console.log(`📝 User fields updated`);

			// If there's profile data to update
			if (updateData.profile) {
				console.log(
					`🔗 Updating ${user.profileType} profile: ${user.profileId}`
				);
				const profile = await mongoose
					.model(user.profileType)
					.findById(user.profileId);

				if (!profile) {
					console.log(`❌ Profile not found: ${user.profileId}`);
					throw new ErrorResponse("Profile not found", 404);
				}

				Object.assign(profile, updateData.profile);
				await profile.save();
				console.log(`✅ Profile updated successfully`);
			}

			await user.save();
			console.log(`✅ User update completed successfully`);

			return user;
		} catch (error) {
			console.error(`💥 Error updating user ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 🗑️ Delete User Account
	 *
	 * Permanently deletes a user and their associated profile.
	 * Cleans up both user document and linked Student/Teacher profile.
	 *
	 * @param {string} id - User MongoDB ObjectId
	 * @returns {Promise<Object>} Success confirmation
	 * @throws {ErrorResponse} 404 if user not found
	 *
	 * @example
	 * await userService.deleteUser('60d5ecb54e4b5c001f647c9a');
	 */
	async deleteUser(id) {
		console.log(`🗑️ Deleting user: ${id}`);

		try {
			const user = await User.findById(id);
			if (!user) {
				console.log(`❌ User not found: ${id}`);
				throw new ErrorResponse("User not found", 404);
			}

			console.log(`✅ User found: ${user.name} (${user.role})`);

			// Delete associated profile if exists
			if (user.profileType && user.profileId) {
				console.log(
					`🗑️ Deleting ${user.profileType} profile: ${user.profileId}`
				);
				await mongoose
					.model(user.profileType)
					.findByIdAndDelete(user.profileId);
				console.log(`✅ Profile deleted successfully`);
			}

			await user.deleteOne();
			console.log(`✅ User deletion completed successfully`);

			return { success: true };
		} catch (error) {
			console.error(`💥 Error deleting user ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * 📋 Get Users with Query
	 *
	 * Retrieves users based on query parameters with populated profile data.
	 * Includes grade information for students.
	 *
	 * @param {Object} query - MongoDB query object
	 * @returns {Promise<Array>} Array of user objects with populated data
	 *
	 * @example
	 * const activeStudents = await userService.getUsers({ role: 'student' });
	 */
	async getUsers(query = {}) {
		console.log(`📋 Getting users with query:`, JSON.stringify(query, null, 2));

		try {
			const users = await User.find(query).populate({
				path: "profileId",
				populate: {
					path: "grade",
					select: "name level",
				},
			});

			console.log(`✅ Found ${users.length} users`);

			// Log role distribution
			const roleStats = users.reduce((acc, user) => {
				acc[user.role] = (acc[user.role] || 0) + 1;
				return acc;
			}, {});

			console.log(`👥 Role distribution:`, roleStats);

			return users;
		} catch (error) {
			console.error(`💥 Error getting users:`, error.message);
			throw error;
		}
	}

	/**
	 * 🎭 Get Users by Role
	 *
	 * Retrieves all users with a specific role and populated profile data.
	 *
	 * @param {string} role - User role ('student', 'teacher', or 'admin')
	 * @returns {Promise<Array>} Array of users with specified role
	 *
	 * @example
	 * const teachers = await userService.getUsersByRole('teacher');
	 */
	async getUsersByRole(role) {
		console.log(`🎭 Getting users by role: ${role}`);

		try {
			const users = await User.find({ role }).populate("profile");

			console.log(`✅ Found ${users.length} ${role}s`);

			return users;
		} catch (error) {
			console.error(`💥 Error getting users by role ${role}:`, error.message);
			throw error;
		}
	}

	/**
	 * 🔐 Update User Password
	 *
	 * Updates a user's password with automatic hashing.
	 * Password will be hashed before saving via pre-save middleware.
	 *
	 * @param {string} id - User MongoDB ObjectId
	 * @param {string} newPassword - New password (plain text, will be hashed)
	 * @returns {Promise<Object>} Updated user object
	 * @throws {ErrorResponse} 404 if user not found
	 *
	 * @example
	 * await userService.updatePassword(userId, 'newSecurePassword123');
	 */
	async updatePassword(id, newPassword) {
		console.log(`🔐 Updating password for user: ${id}`);

		try {
			const user = await User.findById(id).select("+password");
			if (!user) {
				console.log(`❌ User not found: ${id}`);
				throw new ErrorResponse(`User not found with id of ${id}`, 404);
			}

			console.log(`✅ User found: ${user.name}`);
			console.log(`🔒 Updating password (will be hashed automatically)`);

			user.password = newPassword;
			await user.save();

			console.log(`✅ Password updated successfully`);

			return user;
		} catch (error) {
			console.error(
				`💥 Error updating password for user ${id}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * ⏰ Get Recent Users
	 *
	 * Retrieves the most recently created users, excluding sensitive data.
	 *
	 * @param {number} limit - Maximum number of users to return (default: 5)
	 * @returns {Promise<Array>} Array of recent users
	 *
	 * @example
	 * const recentUsers = await userService.getRecentUsers(10);
	 */
	async getRecentUsers(limit = 5) {
		console.log(`⏰ Getting ${limit} most recent users`);

		try {
			const users = await User.find()
				.select("-password")
				.sort({ createdAt: -1 })
				.limit(limit);

			console.log(`✅ Found ${users.length} recent users`);

			users.forEach((user, index) => {
				console.log(
					`  ${index + 1}. ${user.name} (${
						user.role
					}) - ${user.createdAt.toLocaleDateString()}`
				);
			});

			return users;
		} catch (error) {
			console.error(`💥 Error getting recent users:`, error.message);
			throw error;
		}
	}

	/**
	 * 📊 Get Dashboard User Analytics
	 *
	 * Retrieves comprehensive user data for dashboard analytics.
	 * Includes role distribution, profile information, and statistics.
	 *
	 * @returns {Promise<Object>} Dashboard user analytics object
	 * @throws {Error} If data retrieval fails
	 *
	 * @example
	 * const analytics = await userService.getDashboardUsers();
	 * console.log(`Total users: ${analytics.total}`);
	 * console.log(`Students: ${analytics.students}, Teachers: ${analytics.teachers}`);
	 */
	async getDashboardUsers() {
		console.log(`📊 Generating dashboard user analytics`);
		const startTime = Date.now();

		try {
			// First get all users
			console.log(`🔍 Retrieving all users...`);
			const users = await User.find();
			console.log(`✅ Found ${users.length} total users`);

			// Separate promise arrays for students and teachers
			const studentUsers = users.filter((user) => user.role === "student");
			const teacherUsers = users.filter((user) => user.role === "teacher");
			const adminUsers = users.filter((user) => user.role === "admin");

			console.log(
				`👥 Role breakdown: ${studentUsers.length} students, ${teacherUsers.length} teachers, ${adminUsers.length} admins`
			);

			// Process students with grade information
			console.log(`🎓 Processing student profiles...`);
			const studentPromises = studentUsers.map(async (user) => {
				const student = await Student.findById(user.profileId).populate(
					"grade",
					"name level"
				);
				return {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					grade: student?.grade?.name || null,
					createdAt: user.createdAt,
				};
			});

			// Process teachers with teaching assignments
			console.log(`👨‍🏫 Processing teacher profiles...`);
			const teacherPromises = teacherUsers.map(async (user) => {
				const teacher = await Teacher.findById(user.profileId)
					.populate("teachingAssignments.subject")
					.populate("teachingAssignments.grades");
				return {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					grade: null,
					subjects:
						teacher?.teachingAssignments?.map((ta) => ta.subject.name) || [],
					createdAt: user.createdAt,
				};
			});

			// Process admin users (no additional profile data needed)
			console.log(`👑 Processing admin users...`);
			const processedAdminUsers = adminUsers.map((user) => ({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				grade: null,
				createdAt: user.createdAt,
			}));

			// Wait for all promises to resolve
			console.log(`⏳ Waiting for profile data to load...`);
			const [students, teachers] = await Promise.all([
				Promise.all(studentPromises),
				Promise.all(teacherPromises),
			]);

			// Combine all users
			const allUsers = [...students, ...teachers, ...processedAdminUsers];

			const processingTime = Date.now() - startTime;
			console.log(
				`✅ Dashboard analytics generated successfully in ${processingTime}ms`
			);
			console.log(`📈 Total processed: ${allUsers.length} users`);

			const analytics = {
				all: allUsers,
				total: allUsers.length,
				students: students.length,
				teachers: teachers.length,
				admins: processedAdminUsers.length,
				roles: ["student", "teacher", "admin"],
			};

			console.log(`📊 Final analytics:`, {
				total: analytics.total,
				students: analytics.students,
				teachers: analytics.teachers,
				admins: analytics.admins,
			});

			return analytics;
		} catch (error) {
			const processingTime = Date.now() - startTime;
			console.error(
				`💥 Error generating dashboard analytics (${processingTime}ms):`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 🎓 Get Students by Grade
	 *
	 * Retrieves all students enrolled in a specific grade.
	 *
	 * @param {string} gradeId - Grade MongoDB ObjectId
	 * @returns {Promise<Array>} Array of student users with populated profiles
	 *
	 * @example
	 * const grade10Students = await userService.getStudentsByGrade(grade10Id);
	 */
	async getStudentsByGrade(gradeId) {
		console.log(`🎓 Getting students by grade: ${gradeId}`);

		try {
			const students = await User.find({
				role: "student",
				"profile.grade": gradeId,
			}).populate("profile");

			console.log(`✅ Found ${students.length} students in grade`);

			return students;
		} catch (error) {
			console.error(
				`💥 Error getting students by grade ${gradeId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * 📚 Get Teachers by Subject
	 *
	 * Retrieves all teachers who teach a specific subject.
	 *
	 * @param {string} subjectId - Subject MongoDB ObjectId
	 * @returns {Promise<Array>} Array of teacher users with populated profiles
	 *
	 * @example
	 * const mathTeachers = await userService.getTeachersBySubject(mathSubjectId);
	 */
	async getTeachersBySubject(subjectId) {
		console.log(`📚 Getting teachers by subject: ${subjectId}`);

		try {
			const teachers = await User.find({
				role: "teacher",
				"profile.teachingAssignments.subject": subjectId,
			}).populate("profile");

			console.log(`✅ Found ${teachers.length} teachers for subject`);

			return teachers;
		} catch (error) {
			console.error(
				`💥 Error getting teachers by subject ${subjectId}:`,
				error.message
			);
			throw error;
		}
	}
}

// Export singleton instance
module.exports = new UserService();

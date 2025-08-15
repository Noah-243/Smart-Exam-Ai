/**
 * Initial Data Seeder Script
 *
 * This script connects to MongoDB and seeds the database with initial test data:
 * - A grade ("Grade 1")
 * - A subject ("Mathematics")
 * - A student user + linked student profile
 * - A teacher user + linked teacher profile with subject and grade assignments
 *
 * The script uses `findOneAndUpdate(..., { upsert: true })` to create or update the entities.
 *
 * Usage:
 * - Automatically executed when the script is run directly (`node thisFile.js`)
 * - Can also be imported as a module: `seedInitialData()` (exports available at bottom)
 *
 * Dependencies:
 * - dotenv: Loads environment variables from `.env`
 * - mongoose: Database connection and models
 * - Models: Grade, Subject, User, Student, Teacher
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Grade = require("../../models/Grade");
const Subject = require("../../models/Subject");
const User = require("../../models/User");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Seeds initial grade, subject, student, and teacher data into the database.
 *
 * Creates or updates:
 * - Grade: "Grade 1"
 * - Subject: "Mathematics"
 * - Student: "student@test.com" with password "123456" and linked profile
 * - Teacher: "teacher@test.com" with password "123456", profile, and assignment to Mathematics/Grade 1
 *
 * @returns {Promise<void>}
 */
async function seedInitialData() {
	try {
		// Create or update Grade
		const grade = await Grade.findOneAndUpdate(
			{ name: "Grade 1" },
			{
				name: "Grade 1",
				level: 1,
			},
			{ upsert: true, new: true }
		);
		console.log("Grade created:", grade.name);

		// Create or update Subject
		const subject = await Subject.findOneAndUpdate(
			{ name: "Mathematics" },
			{ name: "Mathematics" },
			{ upsert: true, new: true }
		);
		console.log("Subject created:", subject.name);

		// Create or update Student user
		const studentUser = await User.findOneAndUpdate(
			{ email: "student@test.com" },
			{
				name: "Test Student",
				email: "student@test.com",
				password: "123456",
				role: "student",
				profileType: "Student",
			},
			{ upsert: true, new: true }
		);

		// Create or update Student profile
		const studentProfile = await Student.findOneAndUpdate(
			{ user: studentUser._id },
			{
				user: studentUser._id,
				grade: grade._id,
			},
			{ upsert: true, new: true }
		);

		// Link profile to user
		await User.findByIdAndUpdate(studentUser._id, {
			profileId: studentProfile._id,
		});

		console.log(
			"Student user created with email: student@test.com and password: 123456"
		);

		// Create or update Teacher user
		const teacherUser = await User.findOneAndUpdate(
			{ email: "teacher@test.com" },
			{
				name: "Test Teacher",
				email: "teacher@test.com",
				password: "123456",
				role: "teacher",
				profileType: "Teacher",
			},
			{ upsert: true, new: true }
		);

		// Create or update Teacher profile
		const teacherProfile = await Teacher.findOneAndUpdate(
			{ user: teacherUser._id },
			{
				user: teacherUser._id,
				specialization: "Mathematics",
				teachingAssignments: [
					{
						subject: subject._id,
						grades: [grade._id],
					},
				],
			},
			{ upsert: true, new: true }
		);

		// Link profile to user
		await User.findByIdAndUpdate(teacherUser._id, {
			profileId: teacherProfile._id,
		});

		console.log(
			"Teacher user created with email: teacher@test.com and password: 123456"
		);
	} catch (error) {
		console.error("Error seeding initial data:", error);
	}
}

// Execute script only if called directly (not imported)
if (require.main === module) {
	mongoose
		.connect(process.env.MONGODB_URI)
		.then(() => {
			console.log("📦 Connected to MongoDB");
			return seedInitialData();
		})
		.then(() => {
			console.log("✅ Initial data seeded successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Error:", error);
			process.exit(1);
		});
}

// Export function for programmatic use
module.exports = { seedInitialData };

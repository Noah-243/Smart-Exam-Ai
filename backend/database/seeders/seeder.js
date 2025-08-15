/**
 * Data Seeder and Cleaner for Initial System Setup
 *
 * This script is the main entry point for managing seeding and cleanup of data in the educational platform.
 *
 * It supports two modes:
 * - `node thisFile.js`       → Seeds users, grades, subjects, and stores them as JSON
 * - `node thisFile.js -d`    → Deletes test-related data (Tests, Questions, ScheduledTests, StudentTests)
 *
 * Features:
 * - Connects to MongoDB using env vars
 * - Seeds initial data: grades, subjects, users (students + teachers)
 * - Deletes only test-related data (keeps users and profiles)
 * - Stores seeded data to `/seeded-data/*.json` using `storeSeededData`
 *
 * Dependencies:
 * - mongoose: DB interaction
 * - dotenv: Loads environment variables
 * - colors: Console color output
 * - Models: User, Grade, Subject, Teacher, Student, Test, Question, ScheduledTest, StudentTest
 * - Seeder scripts: gradeSeeder, subjectSeeder, userSeeder
 */

const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../../models/User");
const Grade = require("../../models/Grade");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const Test = require("../../models/Test");
const Question = require("../../models/Question");
const ScheduledTest = require("../../models/ScheduledTest");
const StudentTest = require("../../models/StudentTest");
const seedGrades = require("./gradeSeeder");
const seedSubjects = require("./subjectSeeder");
const seedUsers = require("./userSeeder");
const { storeSeededData } = require("./utils/storeSeededData");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Verify MongoDB connection string
if (!process.env.MONGODB_URI) {
	console.error(
		"❌ Error: MONGODB_URI is not defined in environment variables".red
	);
	process.exit(1);
}

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("📦 Connected to MongoDB".cyan.underline.bold))
	.catch((err) => {
		console.error("❌ Error connecting to MongoDB:".red, err);
		process.exit(1);
	});

/**
 * Deletes all test-related collections from the DB.
 * This includes:
 * - StudentTest
 * - ScheduledTest
 * - Test
 * - Question
 *
 * Does NOT delete: users, grades, teachers, students
 */
const deleteData = async () => {
	try {
		console.log("\n🗑️  Starting data deletion...".yellow);

		const deletedStudentTests = await StudentTest.deleteMany();
		console.log(
			`✓ Student Tests deleted: ${deletedStudentTests.deletedCount}`.cyan
		);

		const deletedScheduledTests = await ScheduledTest.deleteMany();
		console.log(
			`✓ Scheduled Tests deleted: ${deletedScheduledTests.deletedCount}`.cyan
		);

		const deletedTests = await Test.deleteMany();
		console.log(`✓ Tests deleted: ${deletedTests.deletedCount}`.cyan);

		const deletedQuestions = await Question.deleteMany();
		console.log(`✓ Questions deleted: ${deletedQuestions.deletedCount}`.cyan);

		const totalDeleted =
			deletedStudentTests.deletedCount +
			deletedScheduledTests.deletedCount +
			deletedTests.deletedCount +
			deletedQuestions.deletedCount;

		console.log(
			`\n🎉 Test and question data deleted successfully - Total documents removed: ${totalDeleted}`
				.green.inverse
		);
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Error deleting data:".red, error);
		process.exit(1);
	}
};

/**
 * Stub function for creating scheduled tests.
 * (Currently does nothing – logs skip message)
 *
 * @param {Array} tests
 * @param {Array} grades
 * @param {Array} subjects
 * @param {Array} teacherUsers
 * @returns {Promise<Array>} An empty array
 */
const createScheduledTests = async (tests, grades, subjects, teacherUsers) => {
	try {
		console.log(
			"Skipping scheduled test creation - no questions/tests available"
		);
		return [];
	} catch (error) {
		console.error("Error creating scheduled tests:", error);
		throw error;
	}
};

/**
 * Stub function for assigning scheduled tests to students.
 * (Currently does nothing – logs skip message)
 *
 * @param {Array} scheduledTests
 * @param {Array} studentUsers
 * @returns {Promise<Array>} An empty array
 */
const assignTestsToStudents = async (scheduledTests, studentUsers) => {
	try {
		console.log(
			"Skipping student test assignment - no scheduled tests available"
		);
		return [];
	} catch (error) {
		console.error("Error assigning tests to students:", error);
		throw error;
	}
};

/**
 * Seeds grades, subjects, users (teachers + students) and stores them into JSON files.
 * If an error occurs, attempts to clean up test-related data before exiting.
 */
const importData = async () => {
	try {
		console.log("\n🌱 Starting data seeding...".cyan);

		// Step 1: Seed grades
		console.log("\nCreating grades...".cyan);
		const grades = await seedGrades();
		console.log("✓ Grades created successfully".green);

		// Step 2: Seed subjects
		console.log("\nCreating subjects...".cyan);
		const subjects = await seedSubjects();
		console.log("✓ Subjects created successfully".green);

		// Step 3: Seed users (students + teachers)
		console.log("\nCreating users...".cyan);
		const { users, teacherUsers, studentUsers } = await seedUsers(
			grades,
			subjects
		);
		console.log(
			`✓ Created ${users.length} users (${teacherUsers.length} teachers, ${studentUsers.length} students)`
				.green
		);

		console.log(
			"\n✨ Users, grades, students, and teachers seeded successfully!".green
				.bold
		);

		// Step 4: Store seeded data as JSON
		console.log("\nStoring seeded data to JSON files...".cyan);
		const seededData = {
			users: await User.find().lean(),
			grades: await Grade.find().lean(),
			subjects: await Subject.find().lean(),
			teachers: await Teacher.find().lean(),
			students: await Student.find().lean(),
			tests: [],
			questions: [],
			scheduledTests: [],
			studentTests: [],
		};
		await storeSeededData(seededData);
		console.log("✓ Seeded data stored successfully".green);

		console.log("\n✨ All data seeded successfully!".green.bold);
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Error seeding data:".red, error);
		await deleteData(); // Try to clean up
		process.exit(1);
	}
};

// Entry point logic: run delete or import based on CLI argument
if (process.argv[2] === "-d") {
	deleteData();
} else {
	importData();
}

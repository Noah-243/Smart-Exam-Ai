/**
 * Teacher Seeder Script
 *
 * This module defines a function to create teacher profiles based on user documents
 * with role "teacher", assigning them subjects and grades to teach.
 *
 * Workflow:
 * - Filters users to only include those with role === "teacher"
 * - Randomly selects a subject group (e.g., STEM, Humanities)
 * - Assigns 2–3 subjects from that group
 * - For each subject, assigns 2–3 consecutive grade levels
 * - Creates a Teacher profile for each user
 * - Updates each User document with profileType and profileId
 *
 * Dependencies:
 * - mongoose: MongoDB interaction
 * - faker: (imported, not used currently)
 * - Models: Teacher, Subject, Grade, User
 *
 * Export:
 * - createTeachers(users, subjects, grades): Promise resolving to array of Teacher documents
 */

const mongoose = require("mongoose");
const Teacher = require("../../models/Teacher");
const Subject = require("../../models/Subject");
const Grade = require("../../models/Grade");
const { faker } = require("@faker-js/faker");
const User = require("../../models/User");

// Grouped subjects by category (used to assign teacher specialization)
const subjectGroups = {
	STEM: ["Mathematics", "Physics", "Chemistry", "Computer Science"],
	Humanities: ["Literature", "History", "Geography"],
	Languages: ["English", "Foreign Languages"],
	Sciences: ["Biology", "Chemistry", "Physics"],
};

/**
 * Creates teacher profiles based on user documents with role 'teacher'.
 * Randomly assigns them subjects and grade levels to teach.
 *
 * @param {Array} users - Array of User documents
 * @param {Array} subjects - Array of Subject documents
 * @param {Array} grades - Array of Grade documents
 * @returns {Promise<Array>} Array of created Teacher documents
 */
const createTeachers = async (users, subjects, grades) => {
	try {
		const teachers = [];
		const teacherUsers = users.filter((user) => user.role === "teacher");

		for (const user of teacherUsers) {
			// Randomly select a subject group
			const groupKeys = Object.keys(subjectGroups);
			const selectedGroup =
				groupKeys[Math.floor(Math.random() * groupKeys.length)];
			const teacherSpecialization =
				subjectGroups[selectedGroup][
					Math.floor(Math.random() * subjectGroups[selectedGroup].length)
				];

			// Get eligible subjects from the selected group
			const eligibleSubjects = subjects.filter((subject) =>
				subjectGroups[selectedGroup].includes(subject.name)
			);

			// Select 2–3 random subjects
			const numSubjects = Math.floor(Math.random() * 2) + 2; // 2 or 3
			const teacherSubjects = [...eligibleSubjects]
				.sort(() => 0.5 - Math.random())
				.slice(0, numSubjects);

			// Create teaching assignments per subject with 2–3 consecutive grades
			const teachingAssignments = teacherSubjects.map((subject) => {
				const startGradeIndex = Math.floor(Math.random() * (grades.length - 3));
				const numGrades = Math.floor(Math.random() * 2) + 2; // 2 or 3 grades
				const assignedGrades = grades
					.slice(startGradeIndex, startGradeIndex + numGrades)
					.map((grade) => grade._id);

				return {
					subject: subject._id,
					grades: assignedGrades,
				};
			});

			// Create teacher profile
			const teacher = await Teacher.create({
				user: user._id,
				teachingAssignments,
				specialization: teacherSpecialization,
			});

			// Update user with profile type and profile reference
			await User.findByIdAndUpdate(user._id, {
				profileType: "Teacher",
				profileId: teacher._id,
			});

			teachers.push(teacher);
		}

		return teachers;
	} catch (error) {
		console.error("Error creating teachers:", error);
		throw error;
	}
};

// Export the seeding function for use in other scripts
module.exports = createTeachers;

/**
 * Student Seeder Script
 *
 * This module defines a function that creates student profiles based on an existing list of user documents.
 * It assigns each student to a random grade and updates the user document to link it to the new profile.
 *
 * Workflow:
 * - Receives arrays of users and grades
 * - Filters users with role === "student"
 * - Creates a Student profile for each student user with a random grade
 * - Updates each User document with profileType and profileId
 *
 * Dependencies:
 * - mongoose: MongoDB interaction
 * - faker: (not used currently, but imported – can be used to generate fake names/grades)
 * - Student, Grade, User: Mongoose models
 *
 * Export:
 * - createStudents(users, grades): Promise resolving to array of created Student documents
 */

const mongoose = require("mongoose");
const Student = require("../../models/Student");
const Grade = require("../../models/Grade");
const { faker } = require("@faker-js/faker");
const User = require("../../models/User");

/**
 * Creates student profiles from the given list of user documents and available grades.
 *
 * For each user with role "student":
 * - Assigns them to a random grade from the provided grades array
 * - Creates a Student document
 * - Updates the corresponding User document to include:
 *    - profileType: "Student"
 *    - profileId: reference to the new Student document
 *
 * @param {Array} users - Array of User documents (should include students)
 * @param {Array} grades - Array of Grade documents
 * @returns {Promise<Array>} Array of created Student documents
 * @throws Will log and re-throw any errors encountered during creation
 */
const createStudents = async (users, grades) => {
	try {
		const students = [];

		// Filter for only student users
		const studentUsers = users.filter((user) => user.role === "student");

		for (const user of studentUsers) {
			// Randomly assign a grade to each student
			const randomGrade = grades[Math.floor(Math.random() * grades.length)];

			const student = await Student.create({
				user: user._id,
				grade: randomGrade._id,
				examResults: [], // Start with empty results
			});

			// Update user with profile reference
			await User.findByIdAndUpdate(user._id, {
				profileType: "Student",
				profileId: student._id,
			});

			students.push(student);
		}

		return students;
	} catch (error) {
		console.error("Error creating students:", error);
		throw error;
	}
};

// Export the function for external use (e.g., in main seeder)
module.exports = createStudents;

/**
 * Subject Seeder Script
 *
 * This module defines a set of school subjects and provides a function `seedSubjects`
 * to reset and populate the `Subject` collection in the database.
 *
 * The script deletes all existing subjects and inserts a predefined list of common subjects
 * across various domains such as STEM, Languages, Social Studies, and Arts.
 *
 * Use this script to initialize the subject list during development or testing.
 *
 * Export:
 * - seedSubjects(): Async function to delete existing subjects and seed the collection with predefined subjects.
 */

const Subject = require("../../models/Subject");

// Predefined list of subjects categorized by domain
const subjects = [
	// STEM subjects
	{ name: "Mathematics" },
	{ name: "Physics" },
	{ name: "Chemistry" },
	{ name: "Biology" },
	{ name: "Computer Science" },
	{ name: "Information Systems"},
	{ name: "Statistics" },

	// Languages and Literature
	{ name: "English" },
	{ name: "Spanish" },
	{ name: "French" },
	{ name: "Literature" },

	// Social Studies
	{ name: "History" },
	{ name: "Geography" },
	{ name: "Economics" },
	{ name: "Political Science" },

	// Arts and Others
	{ name: "Art" },
	{ name: "Music" },
	{ name: "Physical Education" },
	{ name: "Philosophy" },
];

/**
 * Deletes all existing subjects from the database and inserts the predefined subject list.
 *
 * @returns {Promise<Array>} Array of created subject documents
 * @throws Will log and rethrow any errors encountered during the operation
 */
const seedSubjects = async () => {
	try {
		await Subject.deleteMany(); // Clear existing subjects
		console.log("Existing subjects deleted");

		const createdSubjects = await Subject.create(subjects); // Insert new subjects
		console.log(`${createdSubjects.length} subjects seeded successfully`);
		return createdSubjects;
	} catch (error) {
		console.error("Error seeding subjects:", error);
		throw error;
	}
};

// Export the seeding function
module.exports = seedSubjects;



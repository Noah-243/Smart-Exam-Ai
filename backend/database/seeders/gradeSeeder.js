/**
 * Grade Seeding Script
 *
 * This module defines a list of school grade levels and provides a function (`seedGrades`)
 * to populate the database with those grades. It first clears the existing `Grade` collection
 * and then inserts the new list of predefined grade objects.
 *
 * Typical usage:
 * - Used during development or initial deployment to ensure grade levels are present in the system.
 *
 * Dependencies:
 * - Grade model (Mongoose schema)
 *
 * Exports:
 * - seedGrades(): Async function to reset and seed all grade levels
 */

const Grade = require("../../models/Grade");

// Static list of grade levels from 1st to 12th grade
const grades = [
	{ name: "First Grade", level: 1 },
	{ name: "Second Grade", level: 2 },
	{ name: "Third Grade", level: 3 },
	{ name: "Fourth Grade", level: 4 },
	{ name: "Fifth Grade", level: 5 },
	{ name: "Sixth Grade", level: 6 },
	{ name: "Seventh Grade", level: 7 },
	{ name: "Eighth Grade", level: 8 },
	{ name: "Ninth Grade", level: 9 },
	{ name: "Tenth Grade", level: 10 },
	{ name: "Eleventh Grade", level: 11 },
	{ name: "Twelfth Grade", level: 12 },
];

/**
 * Seeds the `Grade` collection in the database.
 * First deletes all existing grade documents, then inserts predefined grade list.
 *
 * @returns {Promise<Array>} The newly created grade documents
 * @throws Will throw an error if seeding fails
 */
const seedGrades = async () => {
	try {
		// Remove all existing grades
		await Grade.deleteMany();
		console.log("Existing grades deleted");

		// Create new grades from predefined list
		const createdGrades = await Grade.create(grades);
		console.log(`${createdGrades.length} grades seeded successfully`);
		return createdGrades;
	} catch (error) {
		console.error("Error seeding grades:", error);
		throw error;
	}
};

// Export the seeding function for external use
module.exports = seedGrades;

/**
 * School Year Utilities Module
 * 
 * This module provides utility functions for calculating and generating date ranges
 * and test dates based on the current academic school year.
 * 
 * The academic year is assumed to start on September 1st and end on July 31st of the following year.
 * 
 * Exports:
 * - getCurrentSchoolYear(): Returns the current academic year (start and end Date objects)
 * - generatePastTestDates(count): Generates 'count' random test dates from the start of the school year until today
 * - generateFutureTestDates(count): Generates 'count' random test dates from today until the end of the school year
 */

/**
 * Returns the start and end dates of the current academic school year.
 * If the current date is before September 1st, it returns the previous school year.
 *
 * @returns {{start: Date, end: Date}} An object containing the start and end Date of the school year.
 */
const getCurrentSchoolYear = () => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const schoolYearStart = new Date(currentYear, 8, 1); // September 1st

	if (now < schoolYearStart) {
		// We're before September 1st, so we are still in the previous school year
		return {
			start: new Date(currentYear - 1, 8, 1), // September 1st last year
			end: new Date(currentYear, 6, 31), // July 31st this year
		};
	}

	// We're in the current school year
	return {
		start: new Date(currentYear, 8, 1), // September 1st this year
		end: new Date(currentYear + 1, 6, 31), // July 31st next year
	};
};

/**
 * Generates an array of 'count' random past test dates between the school year start and today.
 *
 * @param {number} count - The number of dates to generate (default is 5)
 * @returns {Date[]} An array of Date objects sorted chronologically
 */
const generatePastTestDates = (count = 5) => {
	const { start } = getCurrentSchoolYear();
	const now = new Date();
	const dates = [];

	for (let i = 0; i < count; i++) {
		const date = new Date(
			start.getTime() + Math.random() * (now.getTime() - start.getTime())
		);
		dates.push(date);
	}

	return dates.sort((a, b) => a - b);
};

/**
 * Generates an array of 'count' random future test dates between today and the end of the school year.
 *
 * @param {number} count - The number of dates to generate (default is 5)
 * @returns {Date[]} An array of Date objects sorted chronologically
 */
const generateFutureTestDates = (count = 5) => {
	const { end } = getCurrentSchoolYear();
	const now = new Date();
	const dates = [];

	for (let i = 0; i < count; i++) {
		const date = new Date(
			now.getTime() + Math.random() * (end.getTime() - now.getTime())
		);
		dates.push(date);
	}

	return dates.sort((a, b) => a - b);
};

// Exporting the functions for external usage (e.g., in React or Node.js)
module.exports = {
	getCurrentSchoolYear,
	generatePastTestDates,
	generateFutureTestDates,
};

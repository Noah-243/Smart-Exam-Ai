/**
 * Formats a date string to a readable format
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Optional formatting options
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString, options = null) => {
	if (!dateString) return "N/A";

	const date = new Date(dateString);

	// Check if date is valid
	if (isNaN(date.getTime())) return "Invalid date";

	// Use custom options if provided, otherwise use default
	const formatOptions = options || {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	};

	return date.toLocaleString("en-US", formatOptions);
};

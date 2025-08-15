/**
 * Gets a nested property from an object using a dot-notated path
 * @param {Object} obj - The object to get property from
 * @param {string} path - Dot-notated path to the property
 * @returns {*} - The value at the path or null if not found
 */
export const getNestedProperty = (obj, path) => {
	return path.split(".").reduce((prev, curr) => {
		return prev && prev[curr] ? prev[curr] : null;
	}, obj);
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date object or date string
 * @param {Object} options - Format options for toLocaleDateString
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
	const dateObj = date instanceof Date ? date : new Date(date);

	const defaultOptions = {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	};

	return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

/**
 * Utility functions for generating unique React keys
 */

/**
 * Generates a unique key for React list items
 * @param {string|Object} item - The item being rendered (preferably with an id or _id)
 * @param {number} index - The index of the item in the array
 * @param {string} prefix - Optional prefix for the key (e.g., 'question', 'answer')
 * @returns {string} A unique key string
 */
export const generateUniqueKey = (item, index, prefix = "item") => {
	// Try to get a unique identifier from the item
	const id = item?._id || item?.id;

	if (id) {
		return `${prefix}-${id}`;
	}

	// If no id available, create a stable key using content hash or combination
	if (typeof item === "object" && item !== null) {
		// Create a simple hash from object properties for stable keys
		const contentHash = createSimpleHash(item);
		return `${prefix}-${contentHash}-${index}`;
	}

	// Fallback to prefix + index (least desirable but still works)
	return `${prefix}-${index}`;
};

/**
 * Creates a simple hash from an object's content
 * @param {Object} obj - Object to hash
 * @returns {string} Simple hash string
 */
const createSimpleHash = (obj) => {
	const str = JSON.stringify(obj, Object.keys(obj).sort());
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash).toString(36);
};

/**
 * Generates keys for answer options
 * @param {Object} answer - Answer object
 * @param {number} index - Answer index
 * @param {string} questionId - Associated question ID
 * @returns {string} Unique key for the answer
 */
export const generateAnswerKey = (answer, index, questionId) => {
	const answerId = answer?._id || answer?.id;

	if (answerId) {
		return `answer-${answerId}`;
	}

	if (questionId && answer?.body) {
		// Create stable key using question ID and answer content
		const contentHash = createSimpleHash({
			body: answer.body,
			isCorrect: answer.isCorrect,
		});
		return `answer-${questionId}-${contentHash}`;
	}

	return `answer-${questionId || "unknown"}-${index}`;
};

/**
 * Generates keys for grade/subject chips
 * @param {Object} item - Grade or subject object
 * @param {number} index - Item index
 * @param {string} type - 'grade' or 'subject'
 * @returns {string} Unique key
 */
export const generateFilterKey = (item, index, type) => {
	const id = item?._id || item?.id;
	const name = item?.name || item;

	if (id) {
		return `${type}-${id}`;
	}

	if (name) {
		return `${type}-${name.replace(/\s+/g, "-").toLowerCase()}`;
	}

	return `${type}-${index}`;
};

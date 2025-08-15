/**
 * Processes answer data to enhance it with matching information
 * @param {Array} answers - Raw answers from the API
 * @param {Array} questions - Questions from the test
 * @returns {Array} - Enhanced answers with matching indices
 */
export const processAnswers = (answers, questions) => {
	if (
		!answers ||
		!Array.isArray(answers) ||
		!questions ||
		!Array.isArray(questions)
	) {
		return [];
	}

	// Create a mapping of questionId -> index for faster lookup
	const questionIdToIndex = {};

	// Map all questions by their ID
	questions.forEach((q, index) => {
		const qId = q.question?._id?.toString();
		if (qId) {
			questionIdToIndex[qId] = index;
		}
	});

	// Detect if we have a direct position alignment between questions and answers
	const positionalAlignment = answers.length === questions.length;

	// Create answers array with enhanced matching information
	return answers.map((answer, index) => {
		// Get the question ID as a string
		const questionId = answer.question?.toString?.() || String(answer.question);

		// Find the original question index using lookup
		const questionIndex = questionIdToIndex[questionId];

		// If we have a matched index from the API processing, use that
		const matchedIndex =
			answer.matchedIndex !== undefined ? answer.matchedIndex : questionIndex;

		// For positional alignment, also store the original array position
		const arrayPosition = positionalAlignment ? index : -1;

		return {
			question: questionId,
			questionIndex: questionIndex !== undefined ? questionIndex : -1,
			matchedIndex: matchedIndex !== undefined ? matchedIndex : -1,
			arrayPosition,
			answer: answer.answer || "",
			isCorrect: answer.isCorrect || false,
			points: answer.points || 0,
			maxPoints: 10,
			feedback: answer.feedback || "",
			answers: q.question?.answers || [],
		};
	});
};

/**
 * Calculates total points from an array of answers
 * @param {Array} answers - Processed answers with points
 * @returns {number} - Total points
 */
export const calculateTotalPoints = (answers) => {
	if (!answers || !Array.isArray(answers)) {
		return 0;
	}

	return answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
};

/**
 * Calculates score as a percentage of total points
 * @param {number} totalPoints - Total points earned
 * @param {number} possiblePoints - Maximum possible points
 * @returns {string} - Score as a string percentage
 */
export const calculateScore = (totalPoints, possiblePoints) => {
	if (!possiblePoints) return "";

	return String(Math.round((totalPoints / possiblePoints) * 100));
};

/**
 * Creates a mapping from questionId to answer index for faster lookups
 * @param {Array} answers - Processed answers
 * @returns {Object} - Mapping of questionId -> index
 */
export const createQuestionIdToAnswerIndex = (answers) => {
	if (!answers || !Array.isArray(answers)) {
		return {};
	}

	const mapping = {};
	answers.forEach((answer, index) => {
		if (answer.question) {
			mapping[answer.question] = index;
		}
	});
	return mapping;
};

/**
 * Creates feedback mapping from answers
 * @param {Array} answers - Processed answers
 * @returns {Object} - Mapping of questionId -> feedback
 */
export const createFeedbackMap = (answers) => {
	if (!answers || !Array.isArray(answers)) {
		return {};
	}

	const feedbackMap = {};
	answers.forEach((answer) => {
		if (answer.question && answer.feedback) {
			feedbackMap[answer.question] = answer.feedback;
		}
	});
	return feedbackMap;
};

/**
 * Prepares test data for AI grading
 * @param {Object} test - The test object
 * @returns {Object} - Formatted test data
 */
export const prepareTestDataForAI = (test) => {
	if (!test || !test.scheduledTest || !test.scheduledTest.test) {
		return { title: "Untitled Test", questions: [] };
	}

	return {
		title: test.scheduledTest.test.title || "Untitled Test",
		questions:
			test.scheduledTest.test.questions?.map((q, index) => {
				// Include max points for each question
				const maxPoints = q.maxPoints || 10;

				return {
					...q,
					maxPoints,
					index,
					questionText: q.question?.body || q.question?.text || "",
					answers: q.question?.answers || [],
					expectedAnswer: q.question?.correctAnswer || "",
				};
			}) || [],
	};
};

/**
 * Utility functions for test grading
 */

/**
 * Formats a date string into a localized date/time string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
	if (!dateString) return "Not available";
	const date = new Date(dateString);
	return date.toLocaleString();
};

/**
 * Creates a mapping of question IDs to their corresponding answers
 * @param {Array} answers - Array of test answers
 * @param {Object} gradedAnswers - Object containing graded answer data keyed by question ID
 * @returns {Object} Mapping of question IDs to answer objects
 */
export const createAnswerMap = (answers, gradedAnswers = {}) => {
	const answerMap = {};

	answers.forEach((answer) => {
		if (!answer.question) return;

		// Get the question ID
		const questionId =
			typeof answer.question === "object"
				? answer.question._id.toString()
				: answer.question.toString();

		// Create the mapped answer with original data
		const mappedAnswer = { ...answer };

		// Apply any graded data from state if available
		if (gradedAnswers[questionId]) {
			mappedAnswer.points = gradedAnswers[questionId].points;
			mappedAnswer.feedback = gradedAnswers[questionId].feedback;
			mappedAnswer.originalPoints = gradedAnswers[questionId].originalPoints;
			mappedAnswer.isCorrect = gradedAnswers[questionId].isCorrect;
		}

		// Store using questionId as key
		answerMap[questionId] = mappedAnswer;

		// Also store by answer ID if available
		if (answer._id) {
			answerMap[answer._id.toString()] = mappedAnswer;
		}

		// Also store by answer's question object ID if available
		if (
			answer.question &&
			typeof answer.question === "object" &&
			answer.question._id
		) {
			const questionObjId = answer.question._id.toString();
			answerMap[questionObjId] = mappedAnswer;
		}
	});

	return answerMap;
};

/**
 * Calculates the percentage score based on earned and total points
 * @param {Array} answers - Array of answers with points
 * @param {Array} questions - Array of questions with max points
 * @param {Object} gradedAnswers - Object containing graded answers
 * @returns {Object} Object containing score percentage, earned and total points
 */
export const calculateTestScore = (answers, questions, gradedAnswers = {}) => {
	let totalPoints = 0;
	let earnedPoints = 0;

	// Calculate earned points from answers
	answers.forEach((answer) => {
		// Get the question ID
		const questionId =
			typeof answer.question === "object"
				? answer.question._id.toString()
				: answer.question.toString();

		// Get points from graded answers if available, otherwise from the answer
		const points = gradedAnswers[questionId]
			? Number(gradedAnswers[questionId].points)
			: Number(answer.points || 0);

		earnedPoints += points;
	});

	// Calculate total possible points from questions
	questions.forEach((question) => {
		const maxPoints =
			(question.question ? question.points : question.maxPoints) || 10;
		totalPoints += maxPoints;
	});

	// Calculate percentage score
	const scorePercentage =
		totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

	return {
		scorePercentage,
		earnedPoints,
		totalPoints,
	};
};

/**
 * Prepares an array of graded answers from the gradedAnswers state and original answers
 * @param {Array} answers - Array of original answers
 * @param {Object} gradedAnswers - Object containing graded answers keyed by question ID
 * @returns {Array} Array of graded answers ready for submission
 */
export const prepareGradedAnswersArray = (answers, gradedAnswers = {}) => {
	const gradedAnswersArray = [];

	answers.forEach((answer) => {
		// Get the question ID
		const questionId =
			typeof answer.question === "object"
				? answer.question._id.toString()
				: answer.question.toString();

		// Prepare the graded answer data
		const gradeData = gradedAnswers[questionId] || {
			points: answer.points || 0,
			feedback: answer.feedback || "",
			isCorrect: answer.isCorrect || answer.points > 0,
		};

		// Add to the array of graded answers to submit
		gradedAnswersArray.push({
			question: questionId,
			points: Number(gradeData.points),
			feedback: gradeData.feedback || "",
			isCorrect: gradeData.isCorrect || Number(gradeData.points) > 0,
		});
	});

	return gradedAnswersArray;
};

/**
 * ==========================================================
 * AI-BASED TEST AUTO-GRADING MODULE
 * ==========================================================
 *
 * PURPOSE:
 * This module provides functionality to automatically grade
 * student tests using Google's Gemini AI service, combining
 * AI-generated grading for open-ended questions with direct
 * auto-grading for multiple-choice questions.
 *
 * MAIN FEATURES:
 * 1. autoGradeTest(test, answers, statusCallback)
 *    - Orchestrates the full AI-based grading process.
 *    - Prepares test and student answer data with context
 *      (questions, max points, answer text).
 *    - Sends grading instructions to Gemini for detailed,
 *      constructive feedback.
 *    - Processes the AI's results to update scores, correctness,
 *      and feedback for each answer.
 *
 * 2. autoGradeMultipleChoice(studentAnswers, questions)
 *    - Grades multiple-choice questions without AI.
 *    - Compares student answers to correct options and assigns
 *      points and feedback instantly.
 *
 * INTERNAL HELPERS:
 * - prepareStudentAnswersData(test, answers)
 *      Enriches student answers with question context and scoring
 *      metadata for AI evaluation.
 * - processAIGradingResults(gradingResult, answers)
 *      Integrates AI grading output back into the test state.
 * - processQuestionsWithIds(...)
 *      Updates answers when AI provides stable question IDs.
 * - processFallbackQuestions(...)
 *      Updates answers when question IDs are missing; matches by
 *      position or number.
 * - updateAnswerWithAIGrading(...)
 *      Applies AI grading to a specific answer, scaling points
 *      according to max possible score.
 *
 * DEPENDENCIES:
 * - geminiService: Wrapper for Google's Gemini AI API, handles
 *   communication with the AI model.
 * - testGradingUtils: Utility functions for mapping and preparing
 *   test data (e.g., createQuestionIdToAnswerIndex,
 *   prepareTestDataForAI).
 *
 * TYPICAL USAGE:
 * - Use `autoGradeTest()` for mixed question types (MCQ + open-ended)
 *   to get AI-driven feedback and scores.
 * - Use `autoGradeMultipleChoice()` when grading MCQs without AI.
 *
 * ERROR HANDLING:
 * - All main functions validate inputs and throw descriptive errors
 *   if required data is missing.
 * - AI communication errors are caught and re-thrown with context.
 *
 * OUTPUT:
 * - Returns updated answers array with:
 *    - points earned
 *    - correctness flags
 *    - feedback (AI-generated or static)
 *    - total points
 *    - overall score and summary from AI
 *
 * ==========================================================
 */


import geminiService from "./geminiService";
import {
	createQuestionIdToAnswerIndex,
	prepareTestDataForAI,
} from "../utils/testGradingUtils";

/**
 * Handle AI-based auto-grading of student tests
 */
export const autoGradeTest = async (test, answers, statusCallback) => {
	if (!test || !answers) {
		throw new Error("Missing test or answers data");
	}

	try {
		// Prepare enhanced test data with question weights
		const testData = prepareTestDataForAI(test);

		// Prepare the original answers data with weights and full answer text
		const studentAnswersData = prepareStudentAnswersData(test, answers);

		// Set status callback if provided
		if (statusCallback && typeof statusCallback === "function") {
			geminiService.setStatusCallback(statusCallback);
		}

		// Request detailed question-specific feedback
		const aiInstructions = {
			generateDetailedFeedback: true,
			feedbackStyle: "Educational and constructive",
			includeExplanations: true,
			feedbackLength: "Moderate",
		};

		// Call the Gemini service for AI-powered grading
		const gradingResult = await geminiService.gradeTest(
			testData,
			studentAnswersData,
			aiInstructions
		);

		// Process the AI grading results
		return processAIGradingResults(gradingResult, answers);
	} catch (error) {
		throw new Error(`Auto-grading failed: ${error.message}`);
	}
};

/**
 * Prepare student answer data for AI grading
 */
const prepareStudentAnswersData = (test, answers) => {
	if (!test.answers || !Array.isArray(test.answers)) {
		return [];
	}

	return test.answers.map((answer) => {
		// Find matching answer in our state to get the maxPoints value
		const stateAnswer = answers.find((a) => a.question === answer.question);

		// Find the original question for context
		const questionInfo = test.scheduledTest?.test?.questions?.find(
			(q) =>
				q.question?._id?.toString() === answer.question?.toString?.() ||
				q.question?._id?.toString() === String(answer.question)
		);

		return {
			...answer,
			maxPoints: stateAnswer?.maxPoints || 10,
			// Include student's answer text for better feedback
			answerText: answer.answer || "",
			// Include question context if found
			questionText:
				questionInfo?.question?.body || questionInfo?.question?.text || "",
			answers: questionInfo?.question?.answers || [],
		};
	});
};

/**
 * Process AI grading results to update answers and feedback
 */
const processAIGradingResults = (gradingResult, answers) => {
	// Create a direct mapping of question IDs to answer indices for easier lookup
	const questionIdToAnswerIndex = createQuestionIdToAnswerIndex(answers);

	// Create new answers array from original data with AI grading
	const newAnswers = [...answers]; // Start with current state
	let totalPoints = 0;

	// Create a new feedback mapping object to store all feedback
	const newFeedbacks = {};

	// Process questions with reliable ID mapping first
	if (
		gradingResult.questionsWithIds &&
		Array.isArray(gradingResult.questionsWithIds)
	) {
		processQuestionsWithIds(
			gradingResult.questionsWithIds,
			questionIdToAnswerIndex,
			newAnswers,
			newFeedbacks,
			totalPoints
		);
	}
	// If no question IDs, fall back to questions array
	else if (gradingResult.questions && Array.isArray(gradingResult.questions)) {
		totalPoints = processFallbackQuestions(
			gradingResult.questions,
			questionIdToAnswerIndex,
			newAnswers,
			newFeedbacks
		);
	}

	return {
		answers: newAnswers,
		feedbacks: newFeedbacks,
		totalPoints: totalPoints,
		score: gradingResult.score,
		summary: gradingResult.summary,
	};
};

/**
 * Process questions with IDs from AI grading results
 */
const processQuestionsWithIds = (
	questionsWithIds,
	questionIdToAnswerIndex,
	newAnswers,
	newFeedbacks,
	totalPoints
) => {
	questionsWithIds.forEach((question) => {
		const questionId = question.questionId;
		if (!questionId) return;

		// Find answer by question ID using our direct map
		const answerIndex = questionIdToAnswerIndex[questionId];

		if (answerIndex !== undefined) {
			// Get the maximum points for this question (default to 10)
			const maxPoints = newAnswers[answerIndex].maxPoints || 10;

			// Update the answer with AI grading
			newAnswers[answerIndex].isCorrect = question.isCorrect;

			// Scale the points based on maxPoints
			if (question.points !== undefined) {
				if (question.points <= 1 && question.points >= 0) {
					// Assume it's a percentage/fraction (0-1)
					newAnswers[answerIndex].points = Math.round(
						question.points * maxPoints
					);
				} else if (question.points <= 10 && maxPoints !== 10) {
					// If AI graded on a 0-10 scale but maxPoints is different
					newAnswers[answerIndex].points = Math.round(
						(question.points / 10) * maxPoints
					);
				} else {
					// Use AI's points directly (capped at maxPoints)
					newAnswers[answerIndex].points = Math.min(
						Math.round(question.points),
						maxPoints
					);
				}
			}

			// Make sure feedback gets assigned
			if (question.feedback) {
				newAnswers[answerIndex].feedback = question.feedback;
				newFeedbacks[questionId] = question.feedback;
			}

			totalPoints += newAnswers[answerIndex].points;
		} else {
			// Try iterative search if direct mapping fails
			const backupIndex = newAnswers.findIndex(
				(a) => a.question === questionId
			);

			if (backupIndex !== -1) {
				updateAnswerWithAIGrading(
					newAnswers,
					backupIndex,
					question,
					questionId,
					newFeedbacks
				);
				totalPoints += newAnswers[backupIndex].points;
			}
		}
	});

	return totalPoints;
};

/**
 * Process fallback questions without reliable IDs
 */
const processFallbackQuestions = (
	questions,
	questionIdToAnswerIndex,
	newAnswers,
	newFeedbacks
) => {
	let totalPoints = 0;

	questions.forEach((question, idx) => {
		// Try to find a matching answer
		const questionNumber = question.questionNumber || idx + 1;

		// Try all available matching methods
		let matchedAnswerIndex = -1;
		let matchedQuestionId = null;

		// 1. Try by question number if available
		if (questionNumber > 0 && questionNumber <= newAnswers.length) {
			matchedAnswerIndex = questionNumber - 1;
			matchedQuestionId = newAnswers[matchedAnswerIndex]?.question;
		}

		// 2. If still not found, try by position
		if (matchedAnswerIndex === -1 && idx < newAnswers.length) {
			matchedAnswerIndex = idx;
			matchedQuestionId = newAnswers[idx].question;
		}

		// If we found a match, update it
		if (matchedAnswerIndex !== -1 && matchedQuestionId) {
			updateAnswerWithAIGrading(
				newAnswers,
				matchedAnswerIndex,
				question,
				matchedQuestionId,
				newFeedbacks
			);

			totalPoints += newAnswers[matchedAnswerIndex].points;
		}
	});

	return totalPoints;
};

/**
 * Update a specific answer with AI grading data
 */
const updateAnswerWithAIGrading = (
	answers,
	answerIndex,
	aiGrading,
	questionId,
	feedbackMap
) => {
	const maxPoints = answers[answerIndex].maxPoints || 10;

	// Update correctness
	answers[answerIndex].isCorrect = aiGrading.isCorrect;

	// Scale points appropriately
	if (aiGrading.points !== undefined) {
		if (aiGrading.points <= 1 && aiGrading.points >= 0) {
			// Percentage score (0-1)
			answers[answerIndex].points = Math.round(aiGrading.points * maxPoints);
		} else if (aiGrading.points <= 10 && maxPoints !== 10) {
			// 0-10 scale but different max points
			answers[answerIndex].points = Math.round(
				(aiGrading.points / 10) * maxPoints
			);
		} else {
			// Direct points (capped at maxPoints)
			answers[answerIndex].points = Math.min(
				Math.round(aiGrading.points),
				maxPoints
			);
		}
	}

	// Update feedback
	if (aiGrading.feedback) {
		answers[answerIndex].feedback = aiGrading.feedback;
		feedbackMap[questionId] = aiGrading.feedback;
	}
};

export const autoGradeMultipleChoice = (studentAnswers, questions) => {
	if (!Array.isArray(studentAnswers) || !Array.isArray(questions)) {
		return [];
	}

	return studentAnswers.map((studentAnswer) => {
		// Find the corresponding question
		const question = questions.find(
			(q) => q._id?.toString() === studentAnswer.question?.toString()
		);

		if (!question) {
			return {
				...studentAnswer,
				isCorrect: false,
				points: 0,
				feedback: "Question not found",
			};
		}

		// For multiple choice questions, check if the answer is correct
		if (
			question.type === "multiple-choice" ||
			question.type === "MULTIPLE_CHOICE"
		) {
			const correctAnswer = question.answers?.find((a) => a.isCorrect);
			const isCorrect = studentAnswer.answer === correctAnswer?.text;

			return {
				...studentAnswer,
				isCorrect,
				points: isCorrect ? question.points || 1 : 0,
				maxPoints: question.points || 1,
				feedback: isCorrect ? "Correct!" : "Incorrect",
			};
		}

		// For text questions, we can't auto-grade, so return as-is
		return {
			...studentAnswer,
			isCorrect: null,
			points: 0,
			maxPoints: question.points || 1,
			feedback: "Manual grading required",
		};
	});
};

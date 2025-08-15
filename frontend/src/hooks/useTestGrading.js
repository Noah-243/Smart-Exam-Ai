/**
 * useTestGrading Hook
 *
 * This custom React hook manages all logic related to grading a student's test.
 * It supports manual grading, AI-assisted grading (per question or full test),
 * feedback input, score calculation, validation, and submission.
 *
 * Core Features:
 * - Loads and initializes answers, feedback, and score from test data (`refetch`)
 * - Calculates total possible and assigned points
 * - Handles grading per question and entire test via API and Gemini AI
 * - Submits final grade and feedback using React Query mutations
 * - Tracks loading, error, success, and alert states
 * - Handles inline grading updates (points, feedback) and updates the score accordingly
 *
 * Dependencies:
 * - React Query for managing API mutations
 * - Custom grading utilities: processAnswers, calculateTotalPoints, etc.
 * - Custom services: autoGradeTest, requestGeminiAnswerGrading, requestGeminiTestGrading
 *
 * @param {string} testId - The ID of the test being graded
 * @param {object} refetch - The full test result and answers to grade (usually fetched by parent)
 *
 * @returns {object} Grading state and handler functions:
 *  - feedback, score, answers, questionFeedbacks, gradedAnswers
 *  - error, successMessage, isAutoGrading, isSubmitting
 *  - totalPossiblePoints, totalAssignedPoints
 *  - handleSubmit, handleAutoGrade, handlePointsChange, handleFeedbackChange
 *  - handleAIGradeQuestion, handleAIGradeTest, handleGradeChange
 *  - showAlert, handleCloseAlert
 *  - React Query mutations: gradeTestMutation, gradeAnswerMutation, aiGradeAnswerMutation, aiGradeTestMutation
 */

import { useState, useEffect, useCallback } from "react";
import {
	processAnswers,
	calculateTotalPoints,
	createFeedbackMap,
	calculateScore,
} from "../utils/testGradingUtils";
import { autoGradeTest } from "../services/testGradingService";
import {
	gradeStudentTest,
	gradeStudentAnswer,
	requestGeminiAnswerGrading,
	requestGeminiTestGrading,
} from "../api/teacherTests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to manage all aspects of test grading
 */
export const useTestGrading = (testId, refetch) => {
	const queryClient = useQueryClient();
	const [feedback, setFeedback] = useState("");
	const [score, setScore] = useState("");
	const [answers, setAnswers] = useState([]);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [totalPossiblePoints, setTotalPossiblePoints] = useState(0);
	const [totalAssignedPoints, setTotalAssignedPoints] = useState(0);
	const [isAutoGrading, setIsAutoGrading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	// Direct mapping of questionId to feedback for more reliable updates
	const [questionFeedbacks, setQuestionFeedbacks] = useState({});
	// Force re-renders when feedback updates
	const [updateCounter, setUpdateCounter] = useState(0);
	const [gradedAnswers, setGradedAnswers] = useState({});
	const [alertState, setAlertState] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	// Initialize data when testData changes
	useEffect(() => {
		if (!refetch) return;

		// Set feedback from data if available
		setFeedback(refetch.feedback || "");

		// Calculate total possible points based on question count
		const possiblePoints =
			refetch.scheduledTest?.test?.questions?.length * 10 || 0;
		setTotalPossiblePoints(possiblePoints);

		// Process answers if available
		if (refetch.answers && Array.isArray(refetch.answers)) {
			const questions = refetch.scheduledTest?.test?.questions || [];
			const enhancedAnswers = processAnswers(refetch.answers, questions);

			setAnswers(enhancedAnswers);

			// Calculate initial total assigned points
			const initialTotalPoints = calculateTotalPoints(enhancedAnswers);
			setTotalAssignedPoints(initialTotalPoints);

			// Initialize score
			const scoreValue = initializeScore(
				refetch,
				initialTotalPoints,
				possiblePoints
			);
			setScore(scoreValue);

			// Initialize feedback map
			const feedbackMap = createFeedbackMap(enhancedAnswers);
			setQuestionFeedbacks(feedbackMap);
		} else {
			// If no answers, just use the score from data (if available)
			const scoreValue = refetch.score != null ? String(refetch.score) : "";
			setScore(scoreValue);
		}
	}, [refetch]);

	// Effect to update counter when feedbacks change
	useEffect(() => {
		if (Object.keys(questionFeedbacks).length > 0) {
			setUpdateCounter((prev) => prev + 1);
		}
	}, [questionFeedbacks]);

	// Effect to update total assigned points when answers change
	useEffect(() => {
		const totalPoints = calculateTotalPoints(answers);
		setTotalAssignedPoints(totalPoints);
	}, [answers]);

	// Mutation for grading submission
	const gradeTestMutation = useMutation({
		mutationFn: (gradeData) => gradeStudentTest(testId, gradeData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["teacherStudentTest", testId],
			});
			queryClient.invalidateQueries({
				queryKey: ["teacherTests"],
			});
			setSuccessMessage("Test graded successfully!");
			return true;
		},
		onError: (error) => {
			setError(`Error grading test: ${error.message}`);
			setIsSubmitting(false);
			return false;
		},
	});

	// Mutation for grading an individual answer
	const gradeAnswerMutation = useMutation({
		mutationFn: (params) => gradeStudentAnswer(params),
		onSuccess: () => {
			showAlert("Answer graded successfully");
			refetch();
		},
		onError: (error) => {
			showAlert(`Error grading answer: ${error.message}`, "error");
		},
	});

	// Mutation for AI grading of a question
	const aiGradeAnswerMutation = useMutation({
		mutationFn: (params) => requestGeminiAnswerGrading(params),
		onSuccess: (data) => {
			showAlert("AI has suggested a grade for this question");
			return data;
		},
		onError: (error) => {
			if (error.message?.includes("Authentication error")) {
				showAlert("Session expired. Please log in again.", "error");
				return null;
			}

			showAlert(`Error using AI to grade answer: ${error.message}`, "error");
			return null;
		},
	});

	// Mutation for AI grading of the entire test
	const aiGradeTestMutation = useMutation({
		mutationFn: () => requestGeminiTestGrading(testId),
		onSuccess: (data) => {
			if (data && data.gradedAnswers && Array.isArray(data.gradedAnswers)) {
				const newGradedAnswers = {};

				data.gradedAnswers.forEach((gradedAnswer) => {
					const questionId = gradedAnswer.questionId;

					if (!questionId) {
						console.warn("Received AI grade without questionId:", gradedAnswer);
						return;
					}

					const isCorrect = gradedAnswer.points > 0;

					const gradeData = {
						points: gradedAnswer.points,
						feedback: gradedAnswer.feedback,
						originalPoints: gradedAnswer.points,
						isCorrect,
					};

					newGradedAnswers[questionId] = gradeData;

					try {
						gradeAnswerMutation.mutate({
							answerId: questionId,
							isQuestionId: true,
							testId,
							data: gradeData,
						});
					} catch (error) {
						console.error(
							`Error saving grade for question ${questionId}:`,
							error
						);
					}
				});

				if (Object.keys(newGradedAnswers).length > 0) {
					setGradedAnswers((prev) => ({
						...prev,
						...newGradedAnswers,
					}));
				}
			}

			showAlert(`AI has graded the test with ${data.score}% overall score`);
			refetch();
		},
		onError: (error) => {
			console.error("AI grading error:", error);

			if (error.message?.includes("Authentication error")) {
				showAlert("Session expired. Please log in again.", "error");
				return;
			}

			showAlert(`Error using AI to grade test: ${error.message}`, "error");
		},
	});

	// Helper function to initialize score
	const initializeScore = (data, totalPoints, possiblePoints) => {
		if (data.score !== null && data.score !== undefined) {
			return String(data.score);
		} else if (possiblePoints > 0) {
			return calculateScore(totalPoints, possiblePoints);
		}
		return "";
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		setIsSubmitting(true);
		setError("");

		// Validate input
		if (!score && score !== "0") {
			setError("Please provide a score");
			setIsSubmitting(false);
			return false;
		}

		const scoreNum = Number(score);
		if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
			setError("Score must be a number between 0 and 100");
			setIsSubmitting(false);
			return false;
		}

		// Prepare the data for submission
		const gradeData = {
			score: scoreNum,
			feedback,
			gradedAnswers: answers.map((answer) => ({
				question: answer.question,
				isCorrect: answer.isCorrect,
				points: answer.points,
				feedback: answer.feedback,
			})),
			totalAssignedPoints,
			totalPossiblePoints,
		};

		// Submit the grade
		return gradeTestMutation.mutate(gradeData);
	};

	// Handle auto-grading with AI
	const handleAutoGrade = async () => {
		setSuccessMessage("Auto-grading with AI in progress...");
		setIsAutoGrading(true);
		setError("");

		try {
			// Callback for status updates
			const updateStatusMessage = (model, attempt) => {
				setSuccessMessage(
					`AI grading attempt ${attempt}: Trying with ${model}...`
				);
			};

			// Call auto-grading service
			const result = await autoGradeTest(refetch, answers, updateStatusMessage);

			// Update state with results
			setAnswers(result.answers);
			setQuestionFeedbacks(result.feedbacks);
			setTotalAssignedPoints(result.totalPoints);

			// Use AI's score or calculate based on points
			if (result.score) {
				setScore(String(result.score));
			} else if (totalPossiblePoints > 0) {
				setScore(calculateScore(result.totalPoints, totalPossiblePoints));
			}

			// Update overall feedback
			if (result.summary) {
				setFeedback(result.summary);
			}

			// Update UI
			setSuccessMessage(
				`Auto-grading complete! Score: ${
					result.score ||
					calculateScore(result.totalPoints, totalPossiblePoints)
				}%. Review and save to finalize.`
			);
			return true;
		} catch (error) {
			setError(error.message);
			return false;
		} finally {
			setIsAutoGrading(false);
		}
	};

	// Handle points change for a specific question
	const handlePointsChange = (questionId, points) => {
		const newAnswers = [...answers];
		const answerIndex = newAnswers.findIndex((a) => a.question === questionId);

		if (answerIndex !== -1) {
			// Ensure points are between 0 and max
			const maxPoints = newAnswers[answerIndex].maxPoints || 10;
			const validPoints = Math.min(Math.max(0, points), maxPoints);
			newAnswers[answerIndex].points = validPoints;
			setAnswers(newAnswers);

			// Auto-update score based on points if we have a total
			if (totalPossiblePoints > 0) {
				const newTotalPoints = calculateTotalPoints(newAnswers);
				const calculatedScore = calculateScore(
					newTotalPoints,
					totalPossiblePoints
				);
				setScore(calculatedScore);
			}
		}
	};

	// Handle feedback change for a specific question
	const handleFeedbackChange = (questionId, feedbackText) => {
		// Update the feedback in answers
		const newAnswers = [...answers];
		const answerIndex = newAnswers.findIndex((a) => a.question === questionId);

		if (answerIndex !== -1) {
			newAnswers[answerIndex].feedback = feedbackText;
			setAnswers(newAnswers);

			// Update feedback mapping
			setQuestionFeedbacks((prev) => ({
				...prev,
				[questionId]: feedbackText,
			}));
		}
	};

	/**
	 * Handle alert close
	 */
	const handleCloseAlert = useCallback(() => {
		setAlertState((prev) => ({
			...prev,
			open: false,
		}));
	}, []);

	/**
	 * Show an alert to the user
	 */
	const showAlert = useCallback((message, severity = "success") => {
		setAlertState({
			open: true,
			message,
			severity,
		});
	}, []);

	/**
	 * Update grade data for a specific question
	 */
	const handleGradeChange = useCallback((questionId, data) => {
		if (!questionId) return;

		// If data is a field/value pair
		if (typeof data === "object" && "field" in data && "value" in data) {
			const { field, value } = data;

			setGradedAnswers((prev) => {
				const updatedGrades = { ...prev };

				// Initialize if not exists
				if (!updatedGrades[questionId]) {
					updatedGrades[questionId] = {
						points: 0,
						feedback: "",
						isCorrect: false,
					};
				}

				// Update the specific field
				updatedGrades[questionId] = {
					...updatedGrades[questionId],
					[field]: value,
				};

				// Set isCorrect based on points if points were updated
				if (field === "points") {
					updatedGrades[questionId].isCorrect = Number(value) > 0;
				}

				return updatedGrades;
			});
		}
		// If data is a complete grade object
		else if (typeof data === "object") {
			setGradedAnswers((prev) => ({
				...prev,
				[questionId]: {
					...data,
					points: Number(data.points || 0),
					isCorrect:
						data.isCorrect !== undefined
							? data.isCorrect
							: Number(data.points || 0) > 0,
					originalPoints: Number(data.points || 0),
				},
			}));
		}
	}, []);

	/**
	 * Handle AI grading for a specific question
	 */
	const handleAIGradeQuestion = useCallback(
		async (answerId, questionPoints) => {
			return await aiGradeAnswerMutation.mutateAsync({
				answerId,
				questionPoints,
				testId,
			});
		},
		[aiGradeAnswerMutation, testId]
	);

	/**
	 * Handle AI grading for the entire test
	 */
	const handleAIGradeTest = useCallback(async () => {
		await aiGradeTestMutation.mutateAsync();
	}, [aiGradeTestMutation]);

	return {
		// State
		feedback,
		score,
		answers,
		error,
		successMessage,
		totalPossiblePoints,
		totalAssignedPoints,
		isAutoGrading,
		isSubmitting,
		questionFeedbacks,
		updateCounter,
		gradedAnswers,
		alertState,

		// Actions
		setFeedback,
		setScore,
		setSuccessMessage,
		setError,
		handleSubmit,
		handleAutoGrade,
		handlePointsChange,
		handleFeedbackChange,
		handleCloseAlert,
		handleGradeChange,
		handleAIGradeQuestion,
		handleAIGradeTest,
		gradeAnswerMutation,
		gradeTestMutation,
		aiGradeAnswerMutation,
		aiGradeTestMutation,
		showAlert,
	};
};

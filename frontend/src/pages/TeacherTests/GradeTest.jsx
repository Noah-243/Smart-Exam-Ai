/**
 * GradeTest Component
 *
 * This component allows teachers to grade a student's test submission manually
 * or with AI assistance. It supports:
 *  - Fetching test data from the server
 *  - Grading individual questions via AI (Gemini)
 *  - Grading the entire test via AI (Gemini)
 *  - Manually updating grades for specific questions
 *  - Submitting the final graded test
 *  - Displaying feedback and status messages through alerts
 *
 * Key Features:
 *  - Uses React Query for fetching/mutating test data
 *  - Displays loading/error states for different phases
 *  - Provides navigation back to the teacher tests list
 *  - Integrates with reusable components for UI sections
 *
 * Imported Components:
 *  - TestGradingLoading, TestGradingLoadingError, TestGradingMissingError
 *  - TestHeader, InfoPanels, QuestionsList
 *
 * Imported Utilities:
 *  - prepareGradedAnswersArray
 *  - calculateTestScore
 *
 * State Variables:
 *  - gradedAnswers (object) → Stores graded answers by questionId
 *  - alertState (object) → Manages Snackbar alert messages
 *
 * API Calls:
 *  - getTeacherStudentTest(testId) → Fetches student test data
 *  - gradeStudentTest(testId, data) → Saves graded test results
 *  - requestGeminiAnswerGrading(params) → AI grading for a single answer
 *  - requestGeminiTestGrading(testId) → AI grading for the whole test
 *
 * Navigation:
 *  - Navigates back to "/teacher/tests" when grading is done or on user request
 *
 * @component
 * @returns {JSX.Element} GradeTest component
 */

import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Snackbar, Alert } from "@mui/material";
import { useState, useMemo } from "react";
import {
	getTeacherStudentTest,
	gradeStudentTest,
	requestGeminiAnswerGrading,
	requestGeminiTestGrading,
} from "../../api/teacherTests";
import {
	TestGradingLoading,
	TestGradingLoadingError,
	TestGradingMissingError,
} from "../../components/TestGrading";
import TestHeader from "../../components/TestGrading/TestHeader";
import InfoPanels from "../../components/TestGrading/InfoPanels";
import QuestionsList from "../../components/TestGrading/QuestionsList";
import {
	prepareGradedAnswersArray,
	calculateTestScore,
} from "../../utils/testGradingUtils";

// Define just the route we need
const TEACHER_TESTS_ROUTE = "/teacher/tests";

/**
 * GradeTest component for teachers to grade student test submissions
 * @returns {JSX.Element} GradeTest component
 */
const GradeTest = () => {
	const { testId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// State for managing graded answers and alerts
	const [gradedAnswers, setGradedAnswers] = useState({});
	const [alertState, setAlertState] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	// Fetch test data using React Query
	const {
		data: test,
		isLoading,
		isError,
		error: queryError,
		refetch,
	} = useQuery({
		queryKey: ["teacherStudentTest", testId],
		queryFn: () => getTeacherStudentTest(testId),
		onSuccess: (data) => {
			console.log("Test data loaded successfully:", {
				testId: data._id,
				student: data.student?.name,
			});
		},
		onError: (error) => {
			console.error("Error fetching test data:", error);
		},
	});

	// Mutation for grading an individual answer
	const gradeAnswerMutation = useMutation({
		mutationFn: (params) => requestGeminiAnswerGrading(params),
		onSuccess: (data) => {
			setAlertState({
				open: true,
				message: "AI has suggested a grade for this question",
				severity: "success",
			});
			return data;
		},
		onError: (error) => {
			setAlertState({
				open: true,
				message: `Error using AI to grade answer: ${error.message}`,
				severity: "error",
			});
			return null;
		},
	});

	// Mutation for submitting the entire test grade
	const gradeTestMutation = useMutation({
		mutationFn: (data) => gradeStudentTest(testId, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["teacherStudentTest", testId],
			});
			queryClient.invalidateQueries({ queryKey: ["teacherTests"] });

			setAlertState({
				open: true,
				message: `Test graded successfully! Grade: ${data.score}%. All answers have been scored and feedback saved.`,
				severity: "success",
			});

			// Reset graded answers after successful submission
			setGradedAnswers({});
		},
		onError: (error) => {
			console.error("Error grading test:", error);
			setAlertState({
				open: true,
				message: `Error saving test grade: ${error.response?.data?.message || error.message
					}`,
				severity: "error",
			});
		},
	});

	// Mutation for AI grading of the entire test
	const aiGradeTestMutation = useMutation({
		mutationFn: () => requestGeminiTestGrading(testId),
		onSuccess: (data) => {
			if (data && data.gradedAnswers && Array.isArray(data.gradedAnswers)) {
				// Process AI graded answers and update state
				const newGradedAnswers = {};

				data.gradedAnswers.forEach((gradedAnswer) => {
					const questionId = gradedAnswer.questionId;

					if (!questionId) return;

					newGradedAnswers[questionId] = {
						points: gradedAnswer.points,
						feedback: gradedAnswer.feedback,
						isCorrect: gradedAnswer.points > 0,
					};
				});

				// Update state with all the graded answers
				if (Object.keys(newGradedAnswers).length > 0) {
					setGradedAnswers((prev) => ({
						...prev,
						...newGradedAnswers,
					}));
				}
			}

			setAlertState({
				open: true,
				message: `AI has graded the test with ${data.score}% overall score`,
				severity: "success",
			});

			refetch();
		},
		onError: (error) => {
			setAlertState({
				open: true,
				message: `Error using AI to grade test: ${error.message}`,
				severity: "error",
			});
		},
	});

	/**
	* Handles navigation back to the teacher tests route.
	*/
	const handleNavigateBack = () => navigate(TEACHER_TESTS_ROUTE);

	/**
    * Requests AI grading for a specific question and updates local state.
    * @async
    * @param {string} answerId - The ID of the answer to grade.
    * @param {number} questionPoints - The max points for the question.
    * @returns {Promise<object|null>} AI grading result or null on error.
    */
	const handleAIGradeQuestion = async (answerId, questionPoints) => {
		const result = await gradeAnswerMutation.mutateAsync({
			answerId,
			questionPoints,
			testId,
		});

		if (result) {
			// Update our local state with the AI grading result
			const questionId = answerId;
			setGradedAnswers((prev) => ({
				...prev,
				[questionId]: {
					points: result.points || 0,
					feedback: result.feedback || "",
					isCorrect:
						result.isCorrect !== undefined
							? result.isCorrect
							: result.points > 0,
				},
			}));
		}

		return result;
	};

	/**
    * Submits the final graded test to the server.
    * Calculates the total score and prepares the graded answers array.
    * @async
    */
	const handleAIGradeTest = async () => {
		await aiGradeTestMutation.mutateAsync();
	};

	// Handler for submitting the test grade
	const handleSubmitTestGrade = async () => {
		if (!test) return;

		const questions = test.questions || [];
		const answers = test.answers || [];

		// Calculate the score based on the current state of graded answers
		const { scorePercentage } = calculateTestScore(
			answers,
			questions,
			gradedAnswers
		);

		// Prepare the array of graded answers from our state
		const gradedAnswersArray = prepareGradedAnswersArray(
			answers,
			gradedAnswers
		);

		try {
			// Submit the overall test grade with all graded answers
			await gradeTestMutation.mutateAsync({
				score: scorePercentage,
				status: "graded",
				gradedAnswers: gradedAnswersArray,
			});
		} catch (error) {
			console.error("Error submitting test grade:", error);
		}
	};

	// Handle closing alerts
	const handleCloseAlert = () => {
		setAlertState((prev) => ({
			...prev,
			open: false,
		}));
	};

	// Handle question grade changes
	const handleQuestionGradeChange = (questionId, gradeData) => {
		if (!questionId) return;

		setGradedAnswers((prev) => ({
			...prev,
			[questionId]: {
				...gradeData,
				points: Number(gradeData.points || 0),
				isCorrect: Number(gradeData.points || 0) > 0,
			},
		}));
	};

	// Extract answers and questions data
	const { answers, questions, canGrade } = useMemo(() => {
		if (!test) {
			return { answers: [], questions: [], canGrade: false };
		}

		return {
			answers: test.answers || [],
			questions: test.questions || test.scheduledTest?.test?.questions || [],
			canGrade: test.status !== "graded",
		};
	}, [test]);

	// Loading state
	if (isLoading) return <TestGradingLoading />;

	// Error state
	if (isError) {
		return (
			<TestGradingLoadingError
				errorMessage={queryError.message}
				onBack={handleNavigateBack}
			/>
		);
	}

	// Missing data state
	if (!test || !test.scheduledTest || !test.scheduledTest.test) {
		return <TestGradingMissingError onBack={handleNavigateBack} />;
	}

	return (
		<Container maxWidth="xl" sx={{ py: 4 }}>
			{/* Header with navigation and action buttons */}
			<TestHeader
				onBack={handleNavigateBack}
				onSubmitGrade={handleSubmitTestGrade}
				onAIGradeTest={handleAIGradeTest}
				canGrade={canGrade}
				isSubmitting={gradeTestMutation.isLoading}
				answerCount={answers.length}
			/>

			{/* Test and Student Information Panels */}
			<InfoPanels
				test={test}
				answers={answers}
				questions={questions}
				gradedAnswers={gradedAnswers}
			/>

			{/* Questions and Answers Section */}
			<QuestionsList
				questions={questions}
				answers={answers}
				gradedAnswers={gradedAnswers}
				canGrade={canGrade}
				onAIGradeQuestion={handleAIGradeQuestion}
				onGradeChange={handleQuestionGradeChange}
			/>

			{/* Notification */}
			<Snackbar
				open={alertState.open}
				autoHideDuration={6000}
				onClose={handleCloseAlert}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseAlert}
					severity={alertState.severity}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{alertState.message}
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default GradeTest;

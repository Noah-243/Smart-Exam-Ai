/**
 * QuestionsList.jsx
 *
 * This component displays a list of test questions along with the student's answers,
 * and optionally allows grading—either manually or using AI assistance.
 *
 * Component Purpose:
 * - Render each question using the QuestionDisplay component.
 * - Show student answers and optionally display/edit grading fields.
 * - Support both manual and AI-assisted grading modes.
 *
 * Props:
 * - questions (Array): A list of question objects for the test.
 * - answers (Array): A list of answer objects submitted by the student.
 * - gradedAnswers (Object): A map of question IDs to grading data (points, feedback, isCorrect).
 * - canGrade (Boolean): Enables or disables grading controls in the UI.
 * - onAIGradeQuestion (Function): Called when the user requests AI grading for a specific question.
 * - onGradeChange (Function): Called when the user manually updates points or feedback.
 *
 * Internal Behavior:
 * - Uses useMemo to map each answer by its question ID for quick access.
 * - Renders a grading notice at the top if grading is enabled.
 * - Iterates over questions and passes related data to QuestionDisplay.
 *
 * External Dependencies:
 * - Material UI (Paper, Typography, Box, Divider, List, ListItem)
 * - PropTypes for runtime type-checking
 * - QuestionDisplay component for rendering each question block
 *
 * Example Usage:
 * <QuestionsList
 *   questions={test.questions}
 *   answers={studentAnswers}
 *   gradedAnswers={gradedMap}
 *   canGrade={true}
 *   onAIGradeQuestion={handleAIGrade}
 *   onGradeChange={handleGradeChange}
 * />
 */

import { useMemo } from "react";
import { Paper, Typography, List, ListItem, Divider, Box } from "@mui/material";
import PropTypes from "prop-types";
import QuestionDisplay from "../QuestionDisplay";

/**
 * Component for displaying the list of questions and answers for grading
 *
 * @param {Object} props Component properties
 * @param {Array} props.questions Array of test questions
 * @param {Array} props.answers Array of student answers
 * @param {Object} props.gradedAnswers Object containing graded answer data
 * @param {boolean} props.canGrade Whether grading is allowed
 * @param {Function} props.onAIGradeQuestion Handler for AI grading a question
 * @param {Function} props.onGradeChange Handler for updating grade data
 * @returns {JSX.Element} QuestionsList component
 */
const QuestionsList = ({
	questions = [],
	answers = [],
	gradedAnswers = {},
	canGrade = true,
	onAIGradeQuestion,
	onGradeChange,
}) => {
	// Create a map of question IDs to answers for more efficient lookup
	const answerMap = useMemo(() => {
		const map = {};

		answers.forEach((answer) => {
			if (!answer.question) return;

			// Get the question ID
			const questionId =
				typeof answer.question === "object"
					? answer.question._id.toString()
					: answer.question.toString();

			// Create the mapped answer with original data
			const mappedAnswer = { ...answer };

			// Apply any graded data from our state if available
			if (gradedAnswers[questionId]) {
				mappedAnswer.points = gradedAnswers[questionId].points;
				mappedAnswer.feedback = gradedAnswers[questionId].feedback;
				mappedAnswer.originalPoints = gradedAnswers[questionId].originalPoints;
				mappedAnswer.isCorrect = gradedAnswers[questionId].isCorrect;
			}

			// Store using questionId as key
			map[questionId] = mappedAnswer;

			// Also store by answer ID if available
			if (answer._id) {
				map[answer._id.toString()] = mappedAnswer;
			}

			// Also store by answer's question object ID if available
			if (
				answer.question &&
				typeof answer.question === "object" &&
				answer.question._id
			) {
				const questionObjId = answer.question._id.toString();
				map[questionObjId] = mappedAnswer;
			}
		});

		return map;
	}, [answers, gradedAnswers]);

	if (questions.length === 0) {
		return (
			<Paper sx={{ p: 3, mb: 4 }}>
				<Typography variant="h5" gutterBottom>
					Questions and Answers
				</Typography>
				<Divider sx={{ mb: 2 }} />
				<Typography variant="body1">
					No questions found for this test.
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper sx={{ p: 3, mb: 4 }}>
			<Typography variant="h5" gutterBottom>
				Questions and Answers
			</Typography>
			<Divider sx={{ mb: 2 }} />

			{canGrade && (
				<Box
					sx={{
						mb: 3,
						p: 2,
						bgcolor: "background.elevated",
						borderRadius: 1,
						border: "1px solid",
						borderColor: "primary.light",
					}}
				>
					<Typography variant="body1">
						<strong>Note:</strong> You can grade each question individually or
						use AI assistance to help with grading. All changes will be saved
						when you click the &quot;Submit Test Grade&quot; button at the top
						of the page.
					</Typography>
				</Box>
			)}

			<List>
				{questions.map((questionItem, index) => {
					// Handle both direct question objects and nested question objects
					const question = questionItem.question
						? questionItem.question
						: questionItem;

					const questionId = question._id ? question._id.toString() : null;
					const studentAnswer = questionId ? answerMap[questionId] : null;

					// Check for maxPoints in different possible locations
					const maxPoints = questionItem.maxPoints || question.points || 0;

					return (
						<ListItem
							key={questionId || `question-${index}`}
							disablePadding
							disableGutters
							sx={{ display: "block", mb: 2 }}
						>
							<QuestionDisplay
								questionItem={{ ...question, maxPoints }}
								questionNumber={index + 1}
								studentAnswer={studentAnswer}
								onAIGradeQuestion={canGrade ? onAIGradeQuestion : undefined}
								isEditable={canGrade}
								onPointsChange={onGradeChange}
							/>
						</ListItem>
					);
				})}
			</List>
		</Paper>
	);
};

QuestionsList.propTypes = {
	questions: PropTypes.array,
	answers: PropTypes.array,
	gradedAnswers: PropTypes.object,
	canGrade: PropTypes.bool,
	onAIGradeQuestion: PropTypes.func,
	onGradeChange: PropTypes.func,
};

export default QuestionsList;

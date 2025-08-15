/**
 * QuestionList.jsx
 *
 * This React component renders a list of questions along with their corresponding
 * student answers and teacher feedback. It delegates the rendering of each individual
 * question to the `QuestionItem` component.
 *
 * Component Purpose:
 * - To display multiple questions in a structured format.
 * - For each question, the component matches it with the appropriate student answer
 *   and feedback, then passes that data to a `QuestionItem`.
 * - Provides callback handlers for updating points and feedback.
 *
 * Props:
 * - questions (Array): A list of question wrapper objects, each containing a `question` field
 *   with the actual question data and an `_id`.
 *
 * - answers (Array): A list of student answer objects. Each answer has a `question` property
 *   referencing the question ID it relates to.
 *
 * - questionFeedbacks (Object): A dictionary where each key is a question ID and each value is
 *   the feedback string associated with that question.
 *
 * - updateCounter (string | number): A counter or identifier used to trigger updates or re-renders,
 *   often used for performance or control logic.
 *
 * - onPointsChange (Function): Callback function triggered when the teacher changes the score
 *   assigned to a student answer. Receives (questionId, newPoints).
 *
 * - onFeedbackChange (Function): Callback function triggered when the teacher changes the feedback
 *   for a question. Receives (questionId, newFeedback).
 *
 * Technologies Used:
 * - React (functional components)
 * - PropTypes for runtime prop validation
 * - Material UI components (Box, Typography)
 * - Custom component: QuestionItem (imported locally)
 *
 * Usage Example:
 * <QuestionList
 *   questions={questionArray}
 *   answers={studentAnswers}
 *   questionFeedbacks={feedbackMap}
 *   updateCounter={version}
 *   onPointsChange={handlePointsChange}
 *   onFeedbackChange={handleFeedbackChange}
 * />
 */

import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import QuestionItem from "./QuestionItem";

const QuestionList = ({
	questions,
	answers,
	questionFeedbacks,
	updateCounter,
	onPointsChange,
	onFeedbackChange,
}) => {
	return (
		<Box>
			<Typography variant="h5" gutterBottom>
				Questions & Answers
			</Typography>

			{questions?.map((question, qIndex) => {
				// Get the question ID
				const questionId = question.question?._id?.toString();

				// Find matching answer in our state
				const studentAnswer = answers.find(
					(ans) => ans.question === questionId
				);

				// Get the current feedback for this question
				const feedback = questionFeedbacks[questionId] || "";

				return (
					<QuestionItem
						key={`question-item-${questionId || qIndex}`}
						questionData={question.question || {}}
						questionId={questionId}
						questionIndex={qIndex}
						studentAnswer={studentAnswer}
						feedback={feedback}
						updateCounter={updateCounter}
						onPointsChange={onPointsChange}
						onFeedbackChange={onFeedbackChange}
					/>
				);
			})}
		</Box>
	);
};

QuestionList.propTypes = {
	questions: PropTypes.array.isRequired,
	answers: PropTypes.array.isRequired,
	questionFeedbacks: PropTypes.object.isRequired,
	updateCounter: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
	onPointsChange: PropTypes.func.isRequired,
	onFeedbackChange: PropTypes.func.isRequired,
};

export default QuestionList;

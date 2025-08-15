/**
 * QuestionItem Component
 * -----------------------
 * This React component is responsible for rendering a single question item within a test grading interface.
 * It displays the question text, type, available answer options, the student's answer, a points input field,
 * and a feedback section.
 *
 * Dependencies:
 * - React
 * - MUI components for styling and layout
 * - React PropTypes for type checking
 * - QuestionFeedback component for managing feedback
 *
 * Props:
 * - questionData (object, required):
 *    - body (string): The text content of the question.
 *    - answers (array): A list of possible answers, each with:
 *       - body (string): Text of the answer.
 *       - isCorrect (bool): Marks if the answer is correct.
 *    - isTextAnswer (bool): Indicates if the answer is textual or multiple-choice.
 *    - isMultiAnswer (bool): Indicates if multiple correct answers are allowed.
 *
 * - questionId (string): Unique identifier of the question.
 * - questionIndex (number, required): Position of the question in the list.
 * - studentAnswer (object):
 *    - answer (string): The answer submitted by the student.
 *    - points (number): The number of points awarded.
 *    - maxPoints (number): The maximum points possible.
 * - feedback (string): Teacher's feedback for the student.
 * - onPointsChange (function, required): Callback when points are changed.
 * - onFeedbackChange (function, required): Callback when feedback text is updated.
 *
 * Functionality:
 * - Dynamically displays question type and answer options.
 * - Highlights correct answers using a "Correct" chip.
 * - Allows manual grading through numeric input.
 * - Accepts written feedback via the QuestionFeedback child component.
 *
 * Usage Context:
 * Typically used within a test grading or review panel to allow educators
 * to review and grade individual questions answered by students.
 */

import PropTypes from "prop-types";
import {
	Paper,
	Box,
	Typography,
	TextField,
	Chip,
	useTheme,
} from "@mui/material";
import QuestionFeedback from "./QuestionFeedback";

/**
 * QuestionItem Component
 * ----------------------
 * Renders a single question for review or grading purposes.
 * Displays question content, answer options (if multiple choice),
 * the student's answer, a points input, and a feedback section.
 *
 * @param {Object} props - All props described in the file-level doc above.
 * @returns {JSX.Element} - Rendered question block.
 */
const QuestionItem = ({
	questionData,
	questionId,
	questionIndex,
	studentAnswer,
	feedback,
	onPointsChange,
	onFeedbackChange,
}) => {
	const theme = useTheme();

	// Get question data and ensure we're accessing options correctly
	const questionText = questionData.body || "Unknown question";

	// Extract answers from the question data
	const answers = questionData.answers || [];

	return (
		<Paper
			key={`question-${questionId || questionIndex}`}
			sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}
			data-testid={`question-${questionIndex}`}
		>
			{/* Question Number and Points */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					mb: 1,
				}}
			>
				<Typography variant="h6" color="primary">
					Question {questionIndex + 1}
				</Typography>
				<Typography variant="subtitle1">
					Max Points: {studentAnswer?.maxPoints || 10}
				</Typography>
			</Box>

			{/* Question Text */}
			<Typography variant="body1" sx={{ mb: 2, fontWeight: "500" }}>
				{questionText}
			</Typography>

			{/* Question Type and Answer Options */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle2" color="text.secondary">
					Question Type:
				</Typography>
				<Typography>
					{questionData.isTextAnswer ? "Text Answer" : "Multiple Choice"}
					{questionData.isMultiAnswer && " (Multiple Answers)"}
				</Typography>
			</Box>

			{/* Answer Options */}
			{!questionData.isTextAnswer && answers.length > 0 && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle2" color="text.secondary">
						Answer Options:
					</Typography>
					{answers.map((answer, index) => (
						<Box
							key={index}
							sx={{
								display: "flex",
								alignItems: "center",
								mt: 1,
							}}
						>
							<Typography>
								{String.fromCharCode(65 + index)}. {answer.body}
							</Typography>
							{answer.isCorrect && (
								<Chip
									label="Correct"
									color="success"
									size="small"
									sx={{ ml: 1 }}
								/>
							)}
						</Box>
					))}
				</Box>
			)}

			{/* Student's Answer */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle2" color="text.secondary">
					Student&apos;s Answer:
				</Typography>
				<Typography>{studentAnswer?.answer || "No answer provided"}</Typography>
			</Box>

			{/* Points Input */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle2" color="text.secondary" gutterBottom>
					Points:
				</Typography>
				<TextField
					type="number"
					value={studentAnswer?.points || 0}
					onChange={(e) => onPointsChange(questionId, Number(e.target.value))}
					inputProps={{
						min: 0,
						max: studentAnswer?.maxPoints || 10,
						step: 1,
					}}
					size="small"
				/>
			</Box>

			{/* Feedback Section */}
			<QuestionFeedback
				feedback={feedback}
				onFeedbackChange={(newFeedback) =>
					onFeedbackChange(questionId, newFeedback)
				}
			/>
		</Paper>
	);
};

QuestionItem.propTypes = {
	questionData: PropTypes.shape({
		body: PropTypes.string,
		answers: PropTypes.arrayOf(
			PropTypes.shape({
				body: PropTypes.string,
				isCorrect: PropTypes.bool,
			})
		),
		isTextAnswer: PropTypes.bool,
		isMultiAnswer: PropTypes.bool,
	}).isRequired,
	questionId: PropTypes.string,
	questionIndex: PropTypes.number.isRequired,
	studentAnswer: PropTypes.shape({
		answer: PropTypes.string,
		points: PropTypes.number,
		maxPoints: PropTypes.number,
	}),
	feedback: PropTypes.string,
	onPointsChange: PropTypes.func.isRequired,
	onFeedbackChange: PropTypes.func.isRequired,
};

export default QuestionItem;

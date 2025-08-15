/**
 * QuestionList Component
 * ----------------------
 * Purpose:
 * Renders a list of questions (multiple-choice or open-ended) with appropriate input controls.
 *
 * Props:
 * - questions (Array): List of question objects or wrapper objects containing a `question` field.
 * - answers (Object): Map of questionId → current answer value (string).
 * - onAnswerChange (Function): Callback fired when the user changes an answer. Receives (questionId, newValue).
 *
 * Responsibilities:
 * - Detect whether each question is multiple-choice (has `answers` array) or open-ended.
 * - Render styled <Paper> cards for each question.
 * - Highlight questions that have been answered.
 * - For multiple-choice: render <RadioGroup> with answer options.
 * - For open-ended: render a multiline <TextField>.
 *
 * External dependencies:
 * - MUI components and icons for layout and styling.
 */

import PropTypes from "prop-types";
import {
	Box,
	Paper,
	Typography,
	RadioGroup,
	FormControlLabel,
	Radio,
	TextField,
	Chip,
} from "@mui/material";
import { Quiz as QuestionIcon } from "@mui/icons-material";

const QuestionList = ({ questions, answers, onAnswerChange }) => {

	/**
	 * Render a single question card.
	 * Supports both plain question objects and wrapper objects with a `question` property.
	 * @param {Object} questionWrapper - Either the question object or an object with a `question` property.
	 * @param {number} index - Question index in the list.
	 */
	const renderQuestion = (questionWrapper, index) => {
		// Handle both direct question objects and wrapped question objects
		const question = questionWrapper.question || questionWrapper;

		const questionId = question._id;
		const currentAnswer = answers[questionId] || "";

		// Determine if question has valid multiple-choice answers
		const hasValidAnswers =
			question.answers &&
			Array.isArray(question.answers) &&
			question.answers.length > 0 &&
			question.answers.some(
				(answer) => answer.body && answer.body.trim() !== ""
			);

		const isMultipleChoice = hasValidAnswers;

		/**
		 * Local handler for when the answer changes (either radio or text input).
		 * @param {string} value - The new answer value.
		 */
		const handleAnswerChange = (value) => {
			onAnswerChange(questionId, value);
		};

		return (
			<Paper
				key={questionId}
				elevation={2}
				sx={{
					p: 3,
					mb: 3,
					borderRadius: 3,
					border: (theme) =>
						currentAnswer
							? `2px solid ${theme.palette.success.light}`
							: `2px solid ${theme.palette.divider}`,
					transition: "all 0.3s ease",
					"&:hover": {
						boxShadow: (theme) => theme.shadows[4],
						transform: "translateY(-2px)",
					},
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<Chip
						icon={<QuestionIcon />}
						label={`Question ${index + 1}`}
						color={currentAnswer ? "success" : "primary"}
						variant={currentAnswer ? "filled" : "outlined"}
						sx={{ mr: 2 }}
					/>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						{question.body}
					</Typography>
				</Box>

				{isMultipleChoice ? (
					<RadioGroup
						value={currentAnswer}
						onChange={(e) => handleAnswerChange(e.target.value)}
						sx={{ mt: 2 }}
					>
						{question.answers.map((answer, answerIndex) => (
							<FormControlLabel
								key={answerIndex}
								value={answer.body}
								control={
									<Radio
										sx={{
											"&.Mui-checked": {
												color: "success.main",
											},
										}}
									/>
								}
								label={
									<Typography variant="body1" sx={{ ml: 1 }}>
										{answer.body}
									</Typography>
								}
								sx={{
									mb: 1,
									p: 1.5,
									borderRadius: 2,
									border: "1px solid transparent",
									"&:hover": {
										backgroundColor: "action.hover",
										borderColor: "primary.main",
									},
									...(currentAnswer === answer.body && {
										backgroundColor: "success.light",
										borderColor: "success.main",
									}),
								}}
							/>
						))}
					</RadioGroup>
				) : (
					<TextField
						fullWidth
						multiline
						rows={4}
						variant="outlined"
						placeholder="Enter your answer here..."
						value={currentAnswer}
						onChange={(e) => handleAnswerChange(e.target.value)}
						sx={{
							mt: 2,
							"& .MuiOutlinedInput-root": {
								borderRadius: 2,
								"&.Mui-focused": {
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "success.main",
										borderWidth: 2,
									},
								},
							},
						}}
					/>
				)}
			</Paper>
		);
	};

	return (
		<Box sx={{ mt: 3 }}>
			{questions.map((questionWrapper, index) =>
				renderQuestion(questionWrapper, index)
			)}
		</Box>
	);
};

QuestionList.propTypes = {
	questions: PropTypes.array.isRequired,
	answers: PropTypes.object.isRequired,
	onAnswerChange: PropTypes.func.isRequired,
};

export default QuestionList;

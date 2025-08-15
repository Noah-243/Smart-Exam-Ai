/**
 * QuestionDisplay.jsx
 *
 * This component displays a student's answer to a specific question
 * and provides an interface for manual or AI-assisted grading.
 *
 * Main Features:
 * - Renders question number, text, and possible answer options
 * - Supports both multiple-choice and open-text questions
 * - Displays student's answer and correctness indicators
 * - Allows manual grading via a slider and feedback box
 * - Supports automatic grading via AI integration
 *
 * Props:
 * - questionItem (object): The question to be displayed
 * - questionNumber (number): The order of the question in the test
 * - studentAnswer (object): The student's submitted answer with grading data
 * - onAIGradeQuestion (function): Callback to trigger AI-based grading
 * - isEditable (bool): Whether grading controls should be shown
 * - onPointsChange (function): Callback when points or feedback are changed
 *
 * Technologies:
 * - React (useState, useEffect)
 * - MUI (Material UI) components for layout and UI
 * - PropTypes for prop validation
 *
 * @returns {JSX.Element}
 */

import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	Paper,
	Divider,
	Chip,
	Slider,
	TextField,
	Stack,
	Grid,
} from "@mui/material";
import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ScoreIcon from "@mui/icons-material/Score";
import { useState, useEffect } from "react";
import AIGradeButton from "./AIGradeButton";
import { useTranslation } from "react-i18next";

/**
 * Component for displaying and grading test questions.
 * Supports both multiple choice and open-ended questions with AI grading assistance.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.questionItem - Question data object
 * @param {string} props.questionItem.type - Question type ('multiple-choice' or 'open-ended')
 * @param {string} props.questionItem.body - Question text
 * @param {number} props.questionItem.points - Maximum points for the question
 * @param {Array<Object>} [props.questionItem.answers] - Answer options for multiple choice
 * @param {number} props.questionNumber - Question number in the test
 * @param {Object} props.studentAnswer - Student's submitted answer
 * @param {Function} [props.onAIGradeQuestion] - Callback for AI grading
 * @param {boolean} [props.isEditable=true] - Whether the grading can be edited
 * @param {Function} [props.onPointsChange] - Callback when points are updated
 * @returns {JSX.Element} Question display with grading interface
 *
 * @example
 * // Multiple choice question
 * <QuestionDisplay
 *   questionItem={{
 *     type: 'multiple-choice',
 *     body: 'What is 2+2?',
 *     points: 10,
 *     answers: [
 *       { body: '3', isCorrect: false },
 *       { body: '4', isCorrect: true }
 *     ]
 *   }}
 *   questionNumber={1}
 *   studentAnswer={{ answer: '4', points: 10 }}
 *   onPointsChange={(id, data) => handlePointsChange(id, data)}
 * />
 *
 * @example
 * // Open-ended question with AI grading
 * <QuestionDisplay
 *   questionItem={{
 *     type: 'open-ended',
 *     body: 'Explain Newton\'s First Law',
 *     points: 20
 *   }}
 *   questionNumber={2}
 *   studentAnswer={{ answer: 'An object in motion...', points: 0 }}
 *   onAIGradeQuestion={handleAIGrade}
 *   onPointsChange={handlePointsChange}
 * />
 */
const QuestionDisplay = ({
	questionItem,
	questionNumber,
	studentAnswer,
	onAIGradeQuestion,
	isEditable = true,
	onPointsChange,
}) => {
	const question = questionItem;
	const isMultipleChoice = question.type === "multiple-choice";

	// Check if the question has answers array (for multiple choice)
	const hasAnswerOptions = question.answers && question.answers.length > 0;

	// Get question points - check different possible locations
	const questionPoints =
		question.points ||
		(questionItem.maxPoints
			? questionItem.maxPoints
			: question.maxPoints
			? question.maxPoints
			: 10); // Default to 10 if no points specified

	// State for points and feedback
	const [points, setPoints] = useState(
		studentAnswer?.originalPoints || studentAnswer?.points || 0
	);
	const [feedback, setFeedback] = useState(studentAnswer?.feedback || "");

	// Update state when studentAnswer changes
	useEffect(() => {
		if (studentAnswer) {
			// Use original points if available, otherwise use the scaled points
			setPoints(
				studentAnswer.originalPoints !== undefined
					? studentAnswer.originalPoints
					: studentAnswer.points !== undefined
					? studentAnswer.points
					: 0
			);
			setFeedback(studentAnswer.feedback || "");
		}
	}, [studentAnswer]);

	// Handle points change
	const handlePointsChange = (_, newValue) => {
		setPoints(newValue);
		// Notify parent of change if callback provided
		if (onPointsChange && studentAnswer) {
			const questionId = studentAnswer.question
				? typeof studentAnswer.question === "object"
					? studentAnswer.question._id
					: studentAnswer.question
				: null;

			if (questionId) {
				onPointsChange(questionId.toString(), {
					points: newValue,
					feedback: feedback,
					isCorrect: newValue > 0,
				});
			}
		}
	};

	// Handle feedback change
	const handleFeedbackChange = (e) => {
		const newFeedback = e.target.value;
		setFeedback(newFeedback);
		// Notify parent of change if callback provided
		if (onPointsChange && studentAnswer) {
			const questionId = studentAnswer.question
				? typeof studentAnswer.question === "object"
					? studentAnswer.question._id
					: studentAnswer.question
				: null;

			if (questionId) {
				onPointsChange(questionId.toString(), {
					points: points,
					feedback: newFeedback,
					isCorrect: points > 0,
				});
			}
		}
	};

	// Handle AI grading for this question
	const handleAIGrading = async () => {
		if (onAIGradeQuestion && studentAnswer) {
			const aiResult = await onAIGradeQuestion(
				studentAnswer._id || studentAnswer.question,
				questionPoints
			);

			// If AI suggests points and feedback, update our state
			if (aiResult) {
				let newPoints = 0;

				if (aiResult.points !== undefined) {
					// If the backend scaled down points to 10, but the question is worth more,
					// we need to scale back up for display
					if (aiResult.originalPoints !== undefined) {
						newPoints = aiResult.originalPoints;
					} else if (aiResult.points <= 10 && questionPoints > 10) {
						// Scale up from backend's 0-10 scale to question's actual point value
						newPoints = Math.round((aiResult.points / 10) * questionPoints);
					} else {
						newPoints = aiResult.points;
					}
					setPoints(newPoints);
				}

				if (aiResult.feedback) {
					setFeedback(aiResult.feedback);
				}

				// Notify parent of change if callback provided
				if (onPointsChange && studentAnswer) {
					const questionId = studentAnswer.question
						? typeof studentAnswer.question === "object"
							? studentAnswer.question._id
							: studentAnswer.question
						: null;

					if (questionId) {
						onPointsChange(questionId.toString(), {
							points: newPoints,
							feedback: aiResult.feedback || feedback,
							isCorrect: newPoints > 0,
						});
					}
				}
			}
		}
	};

	const { t } = useTranslation();

	return (
		<Paper
			sx={{
				p: 3,
				mb: 3,
				width: "100%",
				boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
			}}
		>
			{/* Header with question number and points */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 600 }}>
					Question {questionNumber}
				</Typography>
				<Chip
					label={`${questionPoints} points`}
					color="primary"
					size="medium"
					variant="filled"
					icon={<ScoreIcon />}
					sx={{
						fontSize: "1rem",
						fontWeight: 600,
						padding: "4px 8px",
						height: "auto",
						"& .MuiChip-icon": {
							fontSize: "1.2rem",
							marginLeft: "6px",
						},
					}}
				/>
			</Box>

			{/* Question text */}
			<Typography
				variant="body1"
				gutterBottom
				sx={{ fontSize: "1.05rem", mb: 3 }}
			>
				{question.body}
			</Typography>

			<Divider sx={{ mb: 3 }} />

			{/* Main content area with two columns if in edit mode */}
			<Grid container spacing={3}>
				{/* Left column - Student's answer */}
				<Grid item xs={12} md={isEditable ? 6 : 12}>
					{/* Display multiple choice options if available */}
					{isMultipleChoice && hasAnswerOptions ? (
						<Box>
							<Typography variant="subtitle1" gutterBottom fontWeight={600}>
								Answer Options:
							</Typography>

							<List disablePadding>
								{question.answers.map((option, idx) => {
									const isCorrectOption = option.isCorrect;
									const isStudentSelection =
										studentAnswer && studentAnswer.answer === option.body;

									// Determine highlight color based on correctness and student's selection
									let backgroundColor = "transparent";
									if (isStudentSelection && isCorrectOption) {
										backgroundColor = "rgba(76, 175, 80, 0.15)"; // Green for correct selection
									} else if (isStudentSelection && !isCorrectOption) {
										backgroundColor = "rgba(244, 67, 54, 0.15)"; // Red for incorrect selection
									} else if (isCorrectOption) {
										backgroundColor = "rgba(33, 150, 243, 0.15)"; // Blue for correct answer not selected
									}

									return (
										<ListItem
											key={`option-${idx}`}
											sx={{
												borderRadius: 1,
												backgroundColor,
												mb: 1,
												border: "1px solid",
												borderColor:
													isStudentSelection || isCorrectOption
														? isCorrectOption
															? "success.main"
															: "error.main"
														: "divider",
											}}
										>
											<ListItemText
												primary={
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<Typography variant="body1">
															{`${String.fromCharCode(65 + idx)}. ${
																option.body
															}`}
														</Typography>

														{isStudentSelection && (
															<Box
																sx={{
																	ml: "auto",
																	display: "flex",
																	alignItems: "center",
																}}
															>
																{isCorrectOption ? (
																	<CheckCircleIcon
																		color="success"
																		sx={{ ml: 1 }}
																	/>
																) : (
																	<CancelIcon color="error" sx={{ ml: 1 }} />
																)}
															</Box>
														)}

														{!isStudentSelection && isCorrectOption && (
															<CheckCircleIcon color="primary" sx={{ ml: 1 }} />
														)}
													</Box>
												}
											/>
										</ListItem>
									);
								})}
							</List>
						</Box>
					) : (
						// Text question answer display
						<Box>
							<Typography variant="subtitle1" gutterBottom fontWeight={600}>
								Student&apos;s Answer:
							</Typography>

							<Box
								sx={{
									p: 3,
									borderRadius: 1,
									bgcolor: "#f5f5f5",
									border: "1px solid",
									borderColor: "divider",
									minHeight: "120px",
								}}
							>
								<Typography variant="body1">
									{studentAnswer ? studentAnswer.answer : "No answer provided"}
								</Typography>
							</Box>

							{/* Show correct/incorrect badge when the isCorrect property exists */}
							{studentAnswer && studentAnswer.isCorrect !== undefined && (
								<Chip
									icon={
										studentAnswer.isCorrect ? (
											<CheckCircleIcon />
										) : (
											<CancelIcon />
										)
									}
									label={studentAnswer.isCorrect ? "Correct" : "Incorrect"}
									color={studentAnswer.isCorrect ? "success" : "error"}
									size="medium"
									sx={{ mt: 2, fontWeight: 500 }}
								/>
							)}
						</Box>
					)}

					{/* Read-only view of points and feedback */}
					{studentAnswer && !isEditable && (
						<Box sx={{ mt: 3 }}>
							<Divider sx={{ mb: 2 }} />

							<Typography variant="h6" component="div" sx={{ mb: 1 }}>
								<strong>Points Earned:</strong>{" "}
								<Box
									component="span"
									sx={{
										fontSize: "1.25rem",
										fontWeight: 700,
										color: "primary.main",
									}}
								>
									{studentAnswer.originalPoints !== undefined
										? studentAnswer.originalPoints
										: studentAnswer.points !== undefined
										? studentAnswer.points
										: "Not graded"}
									{questionPoints > 0 && ` / ${questionPoints}`}
								</Box>
							</Typography>

							{studentAnswer.feedback && (
								<Box sx={{ mt: 2 }}>
									<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
										Feedback:
									</Typography>
									<Paper
										elevation={0}
										sx={{
											p: 2,
											bgcolor: "background.paper",
											border: "1px solid",
											borderColor: "divider",
										}}
									>
										<Typography variant="body1">
											{studentAnswer.feedback}
										</Typography>
									</Paper>
								</Box>
							)}
						</Box>
					)}
				</Grid>

				{/* Right column - Grading interface (only in edit mode) */}
				{isEditable && studentAnswer && (
					<Grid item xs={12} md={6}>
						<Paper
							elevation={0}
							sx={{
								p: 3,
								bgcolor: "rgba(0, 0, 0, 0.02)",
								borderRadius: 2,
								height: "100%",
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<Typography
								variant="h6"
								gutterBottom
								fontWeight={600}
								color="primary.main"
							>
								Grade This Question
							</Typography>

							<Box sx={{ mb: 4, mt: 3 }}>
								<Typography variant="subtitle1" fontWeight={500} gutterBottom>
									Points:{" "}
									<Box
										component="span"
										sx={{
											fontWeight: 700,
											color: "primary.main",
											fontSize: "1.25rem",
										}}
									>
										{points} / {questionPoints}
									</Box>
								</Typography>
								<Slider
									value={points}
									onChange={handlePointsChange}
									aria-labelledby={`points-slider-${questionNumber}`}
									valueLabelDisplay="auto"
									step={1}
									marks
									min={0}
									max={questionPoints}
									sx={{
										color: "primary.main",
										"& .MuiSlider-thumb": {
											width: 16,
											height: 16,
										},
										"& .MuiSlider-rail": {
											opacity: 0.5,
										},
									}}
								/>
							</Box>

							<TextField
								label={t("labels.feedback")}
								multiline
								rows={4}
								fullWidth
								variant="outlined"
								placeholder={t("labels.provideFeedback")}
								value={feedback}
								onChange={(e) => handleFeedbackChange(e.target.value)}
							/>

							<Stack
								direction="row"
								spacing={2}
								sx={{ justifyContent: "space-between" }}
							>
								{onAIGradeQuestion && (
									<AIGradeButton
										onGradeWithAI={handleAIGrading}
										type="question"
										disabled={
											!studentAnswer?.answer ||
											studentAnswer.answer.trim() === ""
										}
									/>
								)}
							</Stack>
						</Paper>
					</Grid>
				)}
			</Grid>
		</Paper>
	);
};

QuestionDisplay.propTypes = {
	questionItem: PropTypes.shape({
		type: PropTypes.oneOf(["multiple-choice", "open-ended"]).isRequired,
		body: PropTypes.string.isRequired,
		points: PropTypes.number,
		maxPoints: PropTypes.number,
		answers: PropTypes.arrayOf(
			PropTypes.shape({
				body: PropTypes.string.isRequired,
				isCorrect: PropTypes.bool.isRequired,
			})
		),
	}).isRequired,
	questionNumber: PropTypes.number.isRequired,
	studentAnswer: PropTypes.shape({
		_id: PropTypes.string,
		question: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		answer: PropTypes.string,
		points: PropTypes.number,
		originalPoints: PropTypes.number,
		feedback: PropTypes.string,
		isCorrect: PropTypes.bool,
	}),
	onAIGradeQuestion: PropTypes.func,
	isEditable: PropTypes.bool,
	onPointsChange: PropTypes.func,
};

export default QuestionDisplay;

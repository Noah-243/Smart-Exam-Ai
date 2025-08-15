/**
 * QuestionCard Component
 *
 * Description:
 * This component displays a summary card for a question in a test or exam builder.
 * It includes the question text, metadata (type, grade levels, subjects), answer options,
 * and controls for setting points and deleting the question.
 *
 * Props:
 * - question: Object containing the question details, including:
 *   - body (string): The question text
 *   - isTextAnswer (boolean): Whether the question expects a written answer
 *   - isMultiAnswer (boolean): Whether multiple answers can be correct
 *   - answers (array): Array of answer options, each with `body`/`text` and `isCorrect`
 *   - grades (array): Grade levels assigned to the question
 *   - subjects (array): Subjects assigned to the question
 * - points: Number of points assigned to this question
 * - onPointsChange: Function to update the number of points
 * - onDelete: Function called when the question is deleted
 *
 * Features:
 * - Renders a question with metadata chips (type, grades, subjects)
 * - Renders answer options with check/circle icons depending on correctness
 * - Allows editing the number of points via a numeric TextField
 * - Provides a delete button with tooltip
 * - Handles light/dark theming via MUI's useTheme hook
 * - Applies subtle animations and transitions on hover
 *
 * UI Components:
 * - MUI Card with CardContent and CardActions
 * - Chips for metadata display
 * - Paper for question and answers section styling
 * - Icons for correct/incorrect answers
 * - Responsive design with hover effects
 *
 * Utility:
 * - Uses `generateAnswerKey` utility to generate unique keys for answer items
 *
 * PropTypes:
 * - Validates structure of the `question` object and required callbacks
 */

import {
	Box,
	Card,
	CardContent,
	CardActions,
	Typography,
	Chip,
	Tooltip,
	IconButton,
	TextField,
	Divider,
	Paper,
	Stack,
	Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Delete as DeleteIcon,
	Quiz as QuizIcon,
	CheckCircle as CheckCircleIcon,
	RadioButtonUnchecked as UncheckedIcon,
} from "@mui/icons-material";
import { generateAnswerKey } from "../../utils/keyGenerator";
import PropTypes from "prop-types";

/**
 * QuestionCard Component
 *
 * Description:
 * This component displays a card representing a question with its type, answers,
 * associated grades and subjects, point value, and a delete action.
 * 
 * Props:
 * - question: Question object with metadata and answers.
 * - points: Number (total points for this question).
 * - onPointsChange: Function to update the point value.
 * - onDelete: Function to remove the question from the list.
 */
export default function QuestionCard({
	question,
	points,
	onPointsChange,
	onDelete,
}) {
	const theme = useTheme();

	// Safely access properties with optional chaining
	const questionText = question.body || "No question text";
	const questionType = question.isTextAnswer
		? "Text Answer"
		: question.isMultiAnswer
		? "Multiple Choice (Multiple Answers)"
		: "Multiple Choice (Single Answer)";

	const answers = question.answers || [];

	return (
		<Card
			elevation={2}
			sx={{
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
				transition: "all 0.3s ease",
				"&:hover": {
					transform: "translateY(-2px)",
					boxShadow: theme.shadows[4],
					borderColor: theme.palette.primary.main,
				},
			}}
		>
			<CardContent sx={{ p: 3 }}>
				{/* Header with Question Icon and Points */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mb: 3,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar
							sx={{
								width: 40,
								height: 40,
								bgcolor: theme.palette.primary.main,
								mr: 2,
							}}
						>
							<QuizIcon />
						</Avatar>
						<Typography variant="h6" fontWeight="bold" color="text.primary">
							Question
						</Typography>
					</Box>
					<TextField
						label="Points"
						type="number"
						size="small"
						value={points}
						onChange={(e) => onPointsChange(Number(e.target.value) || 0)}
						inputProps={{ min: 0, max: 100 }}
						sx={{
							width: 100,
							"& .MuiOutlinedInput-root": {
								borderRadius: 2,
							},
						}}
					/>
				</Box>

				{/* Question Text */}
				<Paper
					sx={{
						p: 2,
						mb: 3,
						bgcolor: theme.palette.background.elevated,
						borderRadius: 2,
						border: `1px solid ${theme.palette.divider}`,
					}}
				>
					<Typography variant="body1" sx={{ lineHeight: 1.6 }}>
						{questionText}
					</Typography>
				</Paper>

				{/* Question Metadata */}
				<Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
					<Chip
						label={questionType}
						size="small"
						color="primary"
						sx={{ fontWeight: "medium" }}
					/>
					<Chip
						label={`${question.grades?.length || 0} Grade(s)`}
						size="small"
						variant="outlined"
						sx={{ fontWeight: "medium" }}
					/>
					<Chip
						label={`${question.subjects?.length || 0} Subject(s)`}
						size="small"
						variant="outlined"
						sx={{ fontWeight: "medium" }}
					/>
				</Stack>

				<Divider sx={{ my: 2, opacity: 0.5 }} />

				{/* Answers Section */}
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					sx={{ mb: 2, color: "text.primary" }}
				>
					Answer Options
				</Typography>

				<Stack spacing={1.5}>
					{answers.map((answer, index) => (
						<Paper
							key={generateAnswerKey(answer, index, question._id)}
							elevation={0}
							sx={{
								p: 2,
								borderRadius: 2,
								background: answer.isCorrect
									? `linear-gradient(135deg, ${theme.palette.success.light}15 0%, ${theme.palette.success.main}08 100%)`
									: theme.palette.background.elevated,
								border: `1px solid ${
									answer.isCorrect
										? theme.palette.success.light
										: theme.palette.divider
								}`,
								transition: "all 0.2s ease",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								{answer.isCorrect ? (
									<CheckCircleIcon
										sx={{
											color: theme.palette.success.main,
											mr: 1.5,
											fontSize: 20,
										}}
									/>
								) : (
									<UncheckedIcon
										sx={{
											color: theme.palette.text.secondary,
											mr: 1.5,
											fontSize: 20,
										}}
									/>
								)}
								<Typography
									variant="body2"
									sx={{
										fontWeight: answer.isCorrect ? "medium" : "normal",
										color: answer.isCorrect ? "success.dark" : "text.primary",
									}}
								>
									{answer.body || answer.text || "No answer text"}
								</Typography>
							</Box>
						</Paper>
					))}
				</Stack>
			</CardContent>

			<CardActions
				sx={{
					justifyContent: "flex-end",
					p: 2,
					pt: 0,
				}}
			>
				<Tooltip title="Remove Question">
					<IconButton
						size="small"
						onClick={onDelete}
						sx={{
							color: theme.palette.error.main,
							"&:hover": {
								bgcolor: `${theme.palette.error.main}10`,
								transform: "scale(1.1)",
							},
						}}
					>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			</CardActions>
		</Card>
	);
}

QuestionCard.propTypes = {
	question: PropTypes.shape({
		_id: PropTypes.string,
		body: PropTypes.string,
		isTextAnswer: PropTypes.bool,
		isMultiAnswer: PropTypes.bool,
		answers: PropTypes.arrayOf(
			PropTypes.shape({
				body: PropTypes.string,
				text: PropTypes.string,
				isCorrect: PropTypes.bool,
			})
		),
		grades: PropTypes.array,
		subjects: PropTypes.array,
	}).isRequired,
	points: PropTypes.number.isRequired,
	onPointsChange: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

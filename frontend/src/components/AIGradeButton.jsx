/**
 * AIGradeButton Component
 * ------------------------
 * This reusable React component renders a button that triggers Gemini AI
 * to automatically grade a question or an entire test. It includes a confirmation
 * dialog, loading indicator, error handling, and customization options.
 * 
 * Features:
 * - Opens a confirmation dialog before initiating AI grading
 * - Supports grading for a single question or an entire test
 * - Displays a loading spinner while grading is in progress
 * - Handles and displays errors if AI grading fails
 * - Customizable text, layout, and disabled state
 * 
 * Props:
 * - `onGradeWithAI` (function, required): Function to call when user confirms grading
 * - `type` (string, optional): Type of grading context – "question" or "test" (default: "question")
 * - `disabled` (boolean, optional): Whether the button should be disabled (default: false)
 * - `fullWidth` (boolean, optional): If true, the button will take the full width of its container
 * - `buttonText` (string, optional): Custom label for the button. Defaults to "Grade with AI" or "Grade entire test with AI"
 * 
 * Behavior:
 * - When clicked, opens a dialog asking for user confirmation
 * - On confirmation, calls the `onGradeWithAI` prop and shows a loading spinner
 * - If the AI grading fails, an error message is shown inside the dialog
 * 
 * Usage Example:
 * <AIGradeButton
 *   onGradeWithAI={handleAIGrade}
 *   type="test"
 *   disabled={isSubmitting}
 *   fullWidth
 * />
 */

import { useState } from "react";
import {
	Button,
	CircularProgress,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Box,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PropTypes from "prop-types";

/**
 * A button component for triggering AI grading for a question or test
 */
const AIGradeButton = ({
	onGradeWithAI,
	type = "question",
	disabled = false,
	fullWidth = false,
	buttonText,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleClick = () => {
		setDialogOpen(true);
	};

	const handleConfirm = async () => {
		setLoading(true);
		setError(null);
		try {
			await onGradeWithAI();
			setDialogOpen(false);
		} catch (err) {
			setError(err.message || "An error occurred during AI grading");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setDialogOpen(false);
		setError(null);
	};

	const defaultText =
		type === "question" ? "Grade with AI" : "Grade entire test with AI";
	const text = buttonText || defaultText;

	return (
		<>
			<Tooltip title="Use Gemini AI to automatically grade this">
				<span>
					<Button
						variant="outlined"
						color="secondary"
						startIcon={<AutoFixHighIcon />}
						onClick={handleClick}
						disabled={disabled || loading}
						fullWidth={fullWidth}
						sx={{
							mt: type === "question" ? 2 : 0,
							borderRadius: "8px",
							textTransform: "none",
						}}
					>
						{loading ? <CircularProgress size={24} /> : text}
					</Button>
				</span>
			</Tooltip>

			<Dialog open={dialogOpen} onClose={handleClose}>
				<DialogTitle>Confirm AI Grading</DialogTitle>
				<DialogContent>
					<Typography variant="body1">
						{type === "question"
							? "Are you sure you want to use Gemini AI to grade this question?"
							: "Are you sure you want to use Gemini AI to grade all questions in this test?"}
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						The AI will evaluate the student&apos;s answer and provide a
						suggested grade and feedback. You can review and adjust the results
						before finalizing.
					</Typography>
					{error && (
						<Box sx={{ mt: 2, p: 1, bgcolor: "error.light", borderRadius: 1 }}>
							<Typography color="error" variant="body2">
								{error}
							</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						variant="contained"
						color="secondary"
						disabled={loading}
						startIcon={
							loading ? <CircularProgress size={20} /> : <AutoFixHighIcon />
						}
					>
						{loading ? "Grading..." : "Grade with AI"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

AIGradeButton.propTypes = {
	onGradeWithAI: PropTypes.func.isRequired,
	type: PropTypes.oneOf(["question", "test"]),
	disabled: PropTypes.bool,
	fullWidth: PropTypes.bool,
	buttonText: PropTypes.string,
};

export default AIGradeButton;


/**
 * GradingForm Component
 * ---------------------
 * A reusable grading form that allows a teacher or reviewer to:
 * - Enter a numeric score (0–100) for a student's test.
 * - Provide written feedback manually or generate it using AI.
 * - View assigned vs. possible points.
 * - Submit grading results with validation and loading states.
 * 
 * Props:
 * - score (string): The current score value (percentage).
 * - feedback (string): Text feedback to be displayed to the student.
 * - isAutoGrading (bool): Whether the auto-grading process is active.
 * - isSubmitting (bool): Whether the form is being submitted.
 * - totalAssignedPoints (number): Points given so far.
 * - totalPossiblePoints (number): Max points available.
 * - onScoreChange (func): Callback when the score input changes.
 * - onFeedbackChange (func): Callback when feedback is edited.
 * - onAutoGrade (func): Triggered to generate AI feedback.
 * - onSubmit (func): Called when submitting the grading form.
 * 
 * Notes:
 * - Uses Material UI for styling and layout.
 * - Uses forwardRef to allow access to the score input field.
 * - Shows "AI Generated" chip when feedback is auto-generated.
 */

import { forwardRef } from "react";
import PropTypes from "prop-types";
import {
	Paper,
	Typography,
	Grid,
	TextField,
	Box,
	Button,
	CircularProgress,
	Chip,
	useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const GradingForm = forwardRef(
	(
		{
			score,
			feedback,
			isAutoGrading,
			isSubmitting,
			totalAssignedPoints,
			totalPossiblePoints,
			onScoreChange,
			onFeedbackChange,
			onAutoGrade,
			onSubmit,
		},
		ref
	) => {
		const theme = useTheme();
		// Create a component-level score display variable
		const displayScore = score !== undefined && score !== null ? score : "";
		const isAIGenerated =
			typeof feedback === "string" && feedback.includes("You");

		return (
			<Paper sx={{ p: 2, mb: 4 }}>
				<Typography variant="h6" gutterBottom>
					Grading Details
				</Typography>

				<Box
					component="form"
					onSubmit={onSubmit}
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						width: "100%",
					}}
				>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} md={3}>
							<TextField
								label="Score (%)"
								type="number"
								size="small"
								fullWidth
								value={displayScore}
								id="score-percentage-field"
								inputRef={ref}
								inputProps={{
									min: 0,
									max: 100,
									"data-testid": "score-input",
								}}
								onChange={(e) => onScoreChange(e.target.value)}
								key={`score-field-${displayScore}`}
							/>
							{totalPossiblePoints > 0 && (
								<Typography variant="caption" color="text.secondary">
									Points: {totalAssignedPoints} / {totalPossiblePoints}
								</Typography>
							)}
						</Grid>
						<Grid item xs={12} md={9}>
							<Box>
								<Typography
									variant="subtitle2"
									gutterBottom
									component="div"
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 0.5,
										color: theme.palette.text.secondary,
									}}
								>
									Overall Assessment
									{isAIGenerated && (
										<Chip
											size="small"
											icon={<AutoFixHighIcon fontSize="small" />}
											label="AI Generated"
											color="secondary"
											variant="outlined"
											sx={{ ml: 1 }}
										/>
									)}
								</Typography>
								<TextField
									multiline
									size="small"
									fullWidth
									rows={3}
									value={feedback}
									onChange={(e) => onFeedbackChange(e.target.value)}
									placeholder="Provide overall feedback on the student's performance..."
									InputProps={{
										sx: {
											bgcolor: isAIGenerated
												? theme.palette.secondary.main + "1A"
												: "transparent",
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: isAIGenerated
													? theme.palette.secondary.main
													: undefined,
											},
										},
									}}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 0.5, display: "block" }}
								>
									This feedback will be shown to the student as your overall
									assessment of their test performance.
								</Typography>
							</Box>
						</Grid>
					</Grid>

					<Box
						sx={{
							display: "flex",
							justifyContent: "flex-end",
							gap: 1,
						}}
					>
						<Button
							variant="outlined"
							startIcon={<AutoFixHighIcon />}
							onClick={onAutoGrade}
							disabled={isAutoGrading}
							color="secondary"
						>
							{isAutoGrading ? "Grading..." : "Auto-Grade with AI"}
							{isAutoGrading && (
								<CircularProgress size={20} sx={{ ml: 1 }} color="inherit" />
							)}
						</Button>
						<Button
							type="submit"
							variant="contained"
							startIcon={<SaveIcon />}
							disabled={isAutoGrading || isSubmitting}
						>
							{isSubmitting ? (
								<>
									Saving Grading{" "}
									<CircularProgress size={20} sx={{ ml: 1 }} color="inherit" />
								</>
							) : (
								"Save Grading"
							)}
						</Button>
					</Box>
				</Box>
			</Paper>
		);
	}
);

GradingForm.displayName = "GradingForm";

GradingForm.propTypes = {
	score: PropTypes.string,
	feedback: PropTypes.string,
	isAutoGrading: PropTypes.bool.isRequired,
	isSubmitting: PropTypes.bool.isRequired,
	totalAssignedPoints: PropTypes.number.isRequired,
	totalPossiblePoints: PropTypes.number.isRequired,
	onScoreChange: PropTypes.func.isRequired,
	onFeedbackChange: PropTypes.func.isRequired,
	onAutoGrade: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
};

export default GradingForm;

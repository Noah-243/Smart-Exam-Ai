import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AIGradeButton from "../AIGradeButton";

/**
 * Header component for test grading page with navigation and action buttons
 *
 * @param {Object} props Component properties
 * @param {Function} props.onBack Handler for back button click
 * @param {Function} props.onSubmitGrade Handler for submitting the test grade
 * @param {Function} props.onAIGradeTest Handler for AI grading the entire test
 * @param {boolean} props.canGrade Whether grading is allowed
 * @param {boolean} props.isSubmitting Whether the test is currently being submitted
 * @param {number} props.answerCount Number of answers in the test
 * @returns {JSX.Element} TestHeader component
 */
const TestHeader = ({
	onBack,
	onSubmitGrade,
	onAIGradeTest,
	canGrade = true,
	isSubmitting = false,
	answerCount = 0,
}) => {
	return (
		<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
			<Button
				variant="outlined"
				startIcon={<ArrowBackIcon />}
				onClick={onBack}
				sx={{ mr: 2 }}
			>
				Back
			</Button>
			<Typography variant="h4" component="h1">
				Grade Test
			</Typography>

			<Box sx={{ flexGrow: 1 }} />

			<Stack direction="row" spacing={2}>
				{canGrade && (
					<AIGradeButton
						onGradeWithAI={onAIGradeTest}
						type="test"
						disabled={answerCount === 0}
						buttonText="Grade All with AI"
					/>
				)}
				<Button
					variant="contained"
					color="primary"
					startIcon={<SaveIcon />}
					onClick={onSubmitGrade}
					disabled={!canGrade || isSubmitting}
					sx={{
						ml: 2,
						fontWeight: 600,
						px: 4,
						py: 1,
						fontSize: "1rem",
					}}
				>
					Submit Test Grade
				</Button>
			</Stack>
		</Box>
	);
};

export default TestHeader;

/**
 * TestPreview component
 * 
 * This component renders a test in three different modes:
 * - PREVIEW: View-only mode for teachers/admins to review test structure and answers.
 * - TAKE: Interactive mode for students to take the test (supports text/multiple choice/multiple answers).
 * - REVIEW: Displays student answers alongside correct answers for post-submission review.
 * 
 * Props:
 * - test (object): Full test object including title, metadata, and questions.
 * - mode (string): One of the TEST_VIEW_MODES constants ('preview', 'take', 'review').
 * - studentAnswers (object): Optional. A map of questionId → student answer(s) for review mode.
 * 
 * Features:
 * - Renders questions dynamically with support for:
 *   - Text answers
 *   - Single/multiple choice answers
 *   - Displaying correct answers in preview/review modes
 * - Displays test metadata (duration, grade, subject, total points)
 * - Maintains local state for student-selected answers during "take" mode
 */

import { useState } from "react";
import {
	Box,
	Typography,
	Paper,
	Divider,
	Chip,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Checkbox,
	TextField,
	List,
	ListItem,
	Alert,
} from "@mui/material";
import {
	Timer as TimerIcon,
	School as SchoolIcon,
	Book as BookIcon,
} from "@mui/icons-material";

// Define view modes
export const TEST_VIEW_MODES = {
	PREVIEW: "preview", // For teachers/admins previewing the test
	TAKE: "take", // For students taking the test
	REVIEW: "review", // For reviewing completed test with answers
};

export default function TestPreview({
	test,
	mode = TEST_VIEW_MODES.PREVIEW,
	studentAnswers = {},
}) {
	const [selectedAnswers, setSelectedAnswers] = useState({});

	const handleAnswerChange = (questionId, answer, isMultiAnswer = false) => {
		if (mode !== TEST_VIEW_MODES.TAKE) return;

		setSelectedAnswers((prev) => ({
			...prev,
			[questionId]: isMultiAnswer
				? {
						...(prev[questionId] || {}),
						[answer]: !prev[questionId]?.[answer],
				  }
				: answer,
		}));
	};

	const renderAnswerOptions = (questionData) => {
		const question = questionData.question;
		if (!question) return null;

		const isReview = mode === TEST_VIEW_MODES.REVIEW;
		const isPreview = mode === TEST_VIEW_MODES.PREVIEW;
		const studentAnswer = studentAnswers[question._id];

		// Handle text answers
		if (question.isTextAnswer) {
			return (
				<Box sx={{ mt: 2 }}>
					{isReview ? (
						<>
							<Typography variant="subtitle2" color="text.secondary">
								Student's Answer:
							</Typography>
							<Paper sx={{ p: 2, bgcolor: "background.default" }}>
								<Typography>
									{typeof studentAnswer === "string"
										? studentAnswer
										: "No answer provided"}
								</Typography>
							</Paper>
							{isPreview && (
								<Box sx={{ mt: 2 }}>
									<Typography variant="subtitle2" color="success.main">
										Correct Answer:
									</Typography>
									<Typography>
										{typeof question.correctAnswer === "string"
											? question.correctAnswer
											: ""}
									</Typography>
								</Box>
							)}
						</>
					) : (
						<TextField
							fullWidth
							multiline
							rows={4}
							placeholder="Enter your answer here..."
							disabled={mode !== TEST_VIEW_MODES.TAKE}
							value={selectedAnswers[question._id] || ""}
							onChange={(e) => handleAnswerChange(question._id, e.target.value)}
						/>
					)}
				</Box>
			);
		}

		// Handle multiple choice/answer questions
		const answers = Array.isArray(question.answers)
			? question.answers.map((a) => (typeof a === "object" ? a.body : a))
			: question.answers?.split(",").map((a) => a.trim()) || [];

		return (
			<FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
				{question.isMultiAnswer ? (
					answers.map((answer, index) => (
						<FormControlLabel
							key={index}
							control={
								<Checkbox
									checked={
										isReview
											? studentAnswer?.[answer]
											: selectedAnswers[question._id]?.[answer] || false
									}
									onChange={() =>
										handleAnswerChange(question._id, answer, true)
									}
									disabled={mode !== TEST_VIEW_MODES.TAKE}
								/>
							}
							label={
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<Typography>{answer}</Typography>
									{(isPreview || isReview) &&
										question.correctAnswers?.includes(answer) && (
											<Chip
												label="Correct"
												color="success"
												size="small"
												sx={{ ml: 1 }}
											/>
										)}
								</Box>
							}
						/>
					))
				) : (
					<RadioGroup
						value={
							isReview ? studentAnswer : selectedAnswers[question._id] || ""
						}
						onChange={(e) => handleAnswerChange(question._id, e.target.value)}
					>
						{answers.map((answer, index) => (
							<FormControlLabel
								key={index}
								value={answer}
								control={<Radio />}
								disabled={mode !== TEST_VIEW_MODES.TAKE}
								label={
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<Typography>{answer}</Typography>
										{(isPreview || isReview) &&
											answer === question.correctAnswer && (
												<Chip
													label="Correct"
													color="success"
													size="small"
													sx={{ ml: 1 }}
												/>
											)}
									</Box>
								}
							/>
						))}
					</RadioGroup>
				)}
			</FormControl>
		);
	};

	return (
		<Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
			<Paper sx={{ p: 3 }}>
				{/* Test Header */}
				<Typography variant="h4" gutterBottom>
					{test.title}
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" paragraph>
					{test.description}
				</Typography>

				{/* Test Metadata */}
				<Box
					sx={{
						display: "flex",
						gap: 2,
						flexWrap: "wrap",
						mb: 3,
					}}
				>
					<Chip
						icon={<TimerIcon />}
						label={`Duration: ${test.duration} minutes`}
					/>
					<Chip icon={<SchoolIcon />} label={`Grade: ${test.grade?.name}`} />
					<Chip icon={<BookIcon />} label={`Subject: ${test.subject?.name}`} />
					<Chip label={`Total Points: ${test.totalPoints || 0}`} />
				</Box>

				<Divider sx={{ my: 3 }} />

				{/* Questions */}
				<List>
					{test.questions?.map((questionData, index) => (
						<ListItem
							key={questionData.question._id}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-start",
								py: 3,
							}}
						>
							<Box sx={{ width: "100%" }}>
								<Typography variant="h6">
									Question {index + 1}
									{questionData.points && (
										<Chip
											label={`${questionData.points} points`}
											size="small"
											sx={{ ml: 1 }}
										/>
									)}
								</Typography>
								<Typography paragraph sx={{ mt: 1 }}>
									{questionData.question.body}
								</Typography>
								{renderAnswerOptions(questionData)}
							</Box>
							{index < test.questions.length - 1 && (
								<Divider sx={{ my: 2, width: "100%" }} />
							)}
						</ListItem>
					))}
				</List>

				{mode === TEST_VIEW_MODES.TAKE && (
					<Alert severity="info" sx={{ mt: 3 }}>
						Make sure to review all your answers before submitting the test.
					</Alert>
				)}
			</Paper>
		</Box>
	);
}

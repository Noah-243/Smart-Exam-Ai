/**
 * CreateTestForm.jsx – Form Component for Creating or Editing a Test
 *
 * Purpose:
 * This React component provides a rich and user-friendly interface for creating or editing tests
 * in an educational platform. It handles test metadata, question selection, configuration, validation,
 * and final submission. It supports both manual form entry and dynamic interaction with backend APIs.
 *
 * Key Features:
 * - Full support for both test creation and test editing modes.
 * - Selection of grade level and subject from backend-loaded dropdowns.
 * - Add, remove, and configure questions with custom point values.
 * - Progress display to monitor total points (must total exactly 100).
 * - AI configuration fields for future automated grading or adaptive feedback.
 * - UI feedback: error handling, validation, and dynamic button states.
 * - Modular layout: Top header, settings, basic info, questions, notes, and bottom action bar.
 *
 * Core Technologies:
 * - React (Hooks: useState, useEffect)
 * - MUI (Material UI): Design system and layout components
 * - React Query: Data fetching for grades, subjects, and test mutation
 *
 * Props:
 * - test (Object|null): If provided, loads existing test data for editing mode
 * - onClose (Function): Callback to close the dialog
 *
 * Component Sections:
 * - renderTopHeader(): Displays the test title, status, total questions and progress bar.
 * - renderSettingsBar(): Allows input for duration, grade level, and subject.
 * - renderBasicInfoSection(): Form fields for title and description.
 * - renderQuestionsSection(): List of selected questions, add/remove support.
 * - renderNotesSection(): Comments and AI instruction fields.
 * - handleSubmit(): Validates input and submits the form (create or update).
 *
 * Note:
 * - Uses QuestionSelectionDialog and QuestionCard as child components.
 * - Ensures the sum of question points is exactly 100 before submission.
 * - Uses React Query's caching and mutation for efficient updates.
 */

import { useState } from "react";
import {
	Box,
	TextField,
	Button,
	Dialog,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Alert,
	InputAdornment,
	Card,
	CardContent,
	Grid,
	Stack,
	Avatar,
	LinearProgress,
	Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Add as AddIcon,
	Quiz as QuizIcon,
	School as SubjectIcon,
	Grade as GradeIcon,
	Timer as TimerIcon,
	Notes as NotesIcon,
	Settings as SettingsIcon,
	Description as DescriptionIcon,
	Save as SaveIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import { createTest, updateTest } from "../../api/tests";
import QuestionSelectionDialog from "../QuestionSelectionDialog/QuestionSelectionDialog";
import QuestionCard from "../QuestionCard/QuestionCard";
import PropTypes from "prop-types";
import { generateUniqueKey } from "../../utils/keyGenerator";

export default function CreateTestForm({ test = null, onClose }) {
	const theme = useTheme();
	const queryClient = useQueryClient();
	const isEditMode = !!test;

	const [testData, setTestData] = useState({
		title: test?.title || "",
		description: test?.description || "",
		grade: test?.grade?._id || "",
		subject: test?.subject?._id || "",
		questions:
			test?.questions?.map((q) => ({
				question: q.question,
				points: q.points || 0,
			})) || [],
		comments: test?.comments || "",
		duration: test?.duration || 60,
		aiInstructions: test?.aiInstructions || "",
	});

	const [error, setError] = useState("");
	const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

	const { data: grades } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	const { data: subjects } = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
	});

	const testMutation = useMutation({
		mutationFn: isEditMode ? (data) => updateTest(test._id, data) : createTest,
		onSuccess: () => {
			queryClient.invalidateQueries(["tests"]);
			onClose();
		},
		onError: (error) => {
			setError(error.message);
		},
	});

	const handleSubmit = () => {
		// Validate total points
		const totalPoints = testData.questions.reduce(
			(sum, q) => sum + q.points,
			0
		);
		if (totalPoints !== 100) {
			setError(`Total points must equal 100. Current total: ${totalPoints}`);
			return;
		}

		// Validate duration
		if (testData.duration < 1) {
			setError("Duration must be at least 1 minute");
			return;
		}

		// Validate required fields
		if (
			!testData.title ||
			!testData.grade ||
			!testData.subject ||
			!testData.duration
		) {
			setError("Please fill in all required fields");
			return;
		}

		// Validate questions
		if (testData.questions.length === 0) {
			setError("Please select at least one question");
			return;
		}

		testMutation.mutate(testData);
	};

	const handleAddQuestion = (questionsData) => {
		// Handle both single question (legacy) and multiple questions (new)
		const questionsToAdd = Array.isArray(questionsData)
			? questionsData
			: [questionsData];

		const newQuestions = [];
		const duplicates = [];

		questionsToAdd.forEach((questionData) => {
			const { question, points } = questionData;

			// Check if question already exists
			const exists = testData.questions.some(
				(q) => q.question._id === question._id || q.question === question._id
			);

			if (exists) {
				duplicates.push(question.body?.substring(0, 50) + "...");
			} else {
				newQuestions.push({
					question: question,
					points: points,
				});
			}
		});

		// Show error for duplicates but still add new questions
		if (duplicates.length > 0) {
			setError(
				`${duplicates.length} question${
					duplicates.length > 1 ? "s" : ""
				} already in test: ${duplicates.join(", ")}`
			);
		} else {
			setError(""); // Clear any previous errors
		}

		// Add new questions
		if (newQuestions.length > 0) {
			setTestData((prev) => ({
				...prev,
				questions: [...prev.questions, ...newQuestions],
			}));
		}
	};

	const handleDeleteQuestion = (index) => {
		setTestData((prev) => ({
			...prev,
			questions: prev.questions.filter((_, i) => i !== index),
		}));
	};

	const handleQuestionPointsChange = (index, points) => {
		setTestData((prev) => ({
			...prev,
			questions: prev.questions.map((q, i) =>
				i === index ? { ...q, points } : q
			),
		}));
	};

	// Calculate total points
	const totalPoints = testData.questions.reduce(
		(sum, q) => sum + (q.points || 0),
		0
	);

	const renderTopHeader = () => (
		<Card
			elevation={0}
			sx={{
				background: (theme) =>
					`linear-gradient(135deg, ${theme.palette.secondary.main}20 0%, ${theme.palette.secondary.main}40 100%)`,
				borderRadius: 3,
				p: 3,
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Box sx={{ position: "relative", zIndex: 1 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
					<Avatar
						sx={{
							width: 56,
							height: 56,
							background: (theme) =>
								`linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
							fontSize: "1.5rem",
						}}
					>
						<QuizIcon fontSize="large" />
					</Avatar>
					<Box sx={{ flex: 1 }}>
						<Typography variant="h4" fontWeight="bold" gutterBottom>
							{isEditMode ? "Edit Test" : "Create New Test"}
						</Typography>
						<Typography
							variant="body1"
							color="text.secondary"
							sx={{ opacity: 0.8 }}
						>
							{isEditMode
								? "Modify your test settings and questions"
								: "Build your test manually with full control over every detail"}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
						{/* Questions Count */}
						<Box sx={{ textAlign: "center" }}>
							<Typography variant="h4" fontWeight="bold" color="secondary.main">
								{testData.questions.length}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Question{testData.questions.length !== 1 ? "s" : ""}
							</Typography>
						</Box>

						{/* Points Display */}
						<Box sx={{ textAlign: "center" }}>
							<Typography
								variant="h4"
								fontWeight="bold"
								color={
									totalPoints === 100
										? "success.main"
										: totalPoints > 100
										? "error.main"
										: "warning.main"
								}
							>
								{totalPoints}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								/ 100 Points
							</Typography>
						</Box>

						{/* Progress Bar */}
						<Box sx={{ minWidth: 120 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mb: 1, display: "block" }}
							>
								Progress
							</Typography>
							<LinearProgress
								variant="determinate"
								value={Math.min(totalPoints, 100)}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: (theme) => theme.palette.grey[200],
									"& .MuiLinearProgress-bar": {
										borderRadius: 4,
										backgroundColor:
											totalPoints === 100
												? theme.palette.success.main
												: totalPoints > 100
												? theme.palette.error.main
												: theme.palette.secondary.main,
									},
								}}
							/>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 0.5, display: "block" }}
							>
								{totalPoints === 100
									? "Complete"
									: totalPoints > 100
									? "Over limit"
									: "In progress"}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Card>
	);

	const renderSettingsBar = () => (
		<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
			<CardContent sx={{ p: 3 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
					<SettingsIcon color="secondary" />
					<Typography variant="h6" fontWeight="bold">
						Test Configuration
					</Typography>
				</Box>

				<Grid container spacing={3} alignItems="center">
					{/* Duration */}
					<Grid item xs={12} sm={6} md={4}>
						<TextField
							fullWidth
							size="small"
							label="Duration (minutes)"
							type="number"
							value={testData.duration}
							onChange={(e) =>
								setTestData((prev) => ({
									...prev,
									duration: parseInt(e.target.value) || 0,
								}))
							}
							required
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<TimerIcon color="action" />
									</InputAdornment>
								),
								inputProps: { min: 1 },
							}}
						/>
					</Grid>

					{/* Grade Level */}
					<Grid item xs={12} sm={6} md={4}>
						<FormControl fullWidth size="small" required>
							<InputLabel>Grade Level</InputLabel>
							<Select
								value={testData.grade || ""}
								label="Grade Level"
								onChange={(e) => {
									console.log("Grade selected:", e.target.value);
									setTestData((prev) => ({ ...prev, grade: e.target.value }));
								}}
								displayEmpty
								startAdornment={
									<InputAdornment position="start">
										<GradeIcon color="action" />
									</InputAdornment>
								}
							>
								{(grades?.data || [])
									.filter((grade) => grade && (grade._id || grade.id))
									.map((grade, index) => {
										const gradeId = grade._id || grade.id;
										const gradeName =
											grade.name || grade.title || `Grade ${index + 1}`;

										return (
											<MenuItem key={`grade-${gradeId}`} value={gradeId}>
												{gradeName}
											</MenuItem>
										);
									})}
							</Select>
						</FormControl>
					</Grid>

					{/* Subject */}
					<Grid item xs={12} sm={6} md={4}>
						<FormControl fullWidth size="small" required>
							<InputLabel>Subject</InputLabel>
							<Select
								value={testData.subject || ""}
								label="Subject"
								onChange={(e) => {
									console.log("Subject selected:", e.target.value);
									setTestData((prev) => ({ ...prev, subject: e.target.value }));
								}}
								displayEmpty
								startAdornment={
									<InputAdornment position="start">
										<SubjectIcon color="action" />
									</InputAdornment>
								}
							>
								{(subjects?.data || [])
									.filter((subject) => subject && (subject._id || subject.id))
									.map((subject, index) => {
										const subjectId = subject._id || subject.id;
										const subjectName =
											subject.name || subject.title || `Subject ${index + 1}`;

										return (
											<MenuItem key={`subject-${subjectId}`} value={subjectId}>
												{subjectName}
											</MenuItem>
										);
									})}
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);

	const renderBasicInfoSection = () => (
		<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
			<CardContent sx={{ p: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
					<DescriptionIcon color="secondary" />
					<Typography variant="h6" fontWeight="bold">
						Basic Information
					</Typography>
				</Box>

				<Grid container spacing={3}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							label="Test Title"
							value={testData.title}
							onChange={(e) =>
								setTestData((prev) => ({ ...prev, title: e.target.value }))
							}
							required
							variant="outlined"
							placeholder="Enter a clear, descriptive title for your test..."
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							label="Test Description"
							multiline
							rows={3}
							value={testData.description}
							onChange={(e) =>
								setTestData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							variant="outlined"
							placeholder="Describe the test purpose, instructions for students, or any special requirements..."
						/>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);

	const renderQuestionsSection = () => (
		<Card
			elevation={0}
			sx={{
				border: 1,
				borderColor: "divider",
			}}
		>
			<CardContent sx={{ p: 4 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mb: 3,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<QuizIcon color="secondary" />
						<Typography variant="h6" fontWeight="bold">
							Questions ({testData.questions.length})
						</Typography>
					</Box>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => {
							console.log("Add Questions clicked", {
								grade: testData.grade,
								subject: testData.subject,
							});
							setIsQuestionDialogOpen(true);
						}}
						disabled={!testData.grade || !testData.subject}
						color="secondary"
					>
						Add Questions
					</Button>
				</Box>

				{testData.questions.length === 0 ? (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
							p: 4,
							border: 2,
							borderStyle: "dashed",
							borderColor: "divider",
							borderRadius: 2,
							backgroundColor: "background.paper",
							minHeight: 200,
						}}
					>
						<QuizIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No questions added yet
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							{!testData.grade || !testData.subject
								? "Please select grade level and subject first"
								: "Click 'Add Questions' to start building your test"}
						</Typography>
						{testData.grade && testData.subject && (
							<Button
								variant="outlined"
								startIcon={<AddIcon />}
								onClick={() => {
									console.log("Add First Question clicked", {
										grade: testData.grade,
										subject: testData.subject,
									});
									setIsQuestionDialogOpen(true);
								}}
								color="secondary"
							>
								Add Your First Question
							</Button>
						)}
					</Box>
				) : (
					<Box sx={{ overflow: "auto" }}>
						<Stack spacing={2}>
							{testData.questions.map((q, index) => (
								<QuestionCard
									key={generateUniqueKey(q.question, index)}
									question={q.question}
									points={q.points}
									index={index}
									onDelete={() => handleDeleteQuestion(index)}
									onPointsChange={(points) =>
										handleQuestionPointsChange(index, points)
									}
								/>
							))}
						</Stack>
					</Box>
				)}
			</CardContent>
		</Card>
	);

	const renderNotesSection = () => (
		<Card
			elevation={0}
			sx={{
				border: 1,
				borderColor: "divider",
			}}
		>
			<CardContent sx={{ p: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
					<NotesIcon color="secondary" />
					<Typography variant="h6" fontWeight="bold">
						Additional Notes
					</Typography>
				</Box>

				<Stack spacing={3}>
					{/* Comments */}
					<Box>
						<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
							Test Comments
						</Typography>
						<TextField
							fullWidth
							multiline
							rows={4}
							label="Comments"
							value={testData.comments}
							onChange={(e) =>
								setTestData((prev) => ({ ...prev, comments: e.target.value }))
							}
							variant="outlined"
							placeholder="Add any internal notes about this test, grading instructions, or reminders..."
						/>
					</Box>

					{/* AI Instructions */}
					<Box>
						<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
							AI Enhancement Instructions
						</Typography>
						<TextField
							fullWidth
							multiline
							rows={4}
							label="AI Instructions"
							value={testData.aiInstructions}
							onChange={(e) =>
								setTestData((prev) => ({
									...prev,
									aiInstructions: e.target.value,
								}))
							}
							variant="outlined"
							placeholder="Instructions for future AI features like automated grading, question analysis, or adaptive feedback..."
						/>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);

	return (
		<Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
			<Box
				sx={{
					width: "100%",
					height: "95vh",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						flex: 1,
						overflow: "auto",
						p: 3,
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
					}}
				>
					<Container
						maxWidth="xl"
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Stack spacing={3} sx={{ flex: 1 }}>
							{/* 1. Top Header with Title and Stages */}
							{renderTopHeader()}

							{/* Error Display */}
							{error && (
								<Alert severity="error" sx={{ borderRadius: 2 }}>
									{error}
								</Alert>
							)}

							{/* 2. Settings Bar */}
							{renderSettingsBar()}

							{/* 3. Basic Information */}
							{renderBasicInfoSection()}

							{/* 4. Questions Section */}
							{renderQuestionsSection()}

							{/* 5. Notes Section */}
							{renderNotesSection()}

							{/* Bottom Action Bar */}
							<Card
								elevation={0}
								sx={{ border: 1, borderColor: "divider", mt: "auto" }}
							>
								<CardContent sx={{ p: 4 }}>
									<Stack
										direction="row"
										spacing={3}
										justifyContent="space-between"
									>
										<Button
											onClick={onClose}
											color="inherit"
											size="large"
											sx={{ minWidth: 140 }}
										>
											Cancel
										</Button>

										<Button
											onClick={handleSubmit}
											variant="contained"
											disabled={
												!testData.title.trim() ||
												testData.questions.length === 0
											}
											size="large"
											startIcon={<SaveIcon />}
											sx={{ minWidth: 180 }}
										>
											{isEditMode ? "Update Test" : "Create Test"}
										</Button>
									</Stack>
								</CardContent>
							</Card>
						</Stack>
					</Container>
				</Box>
			</Box>

			{/* Question Selection Dialog */}
			{isQuestionDialogOpen && (
				<QuestionSelectionDialog
					open={isQuestionDialogOpen}
					onClose={() => setIsQuestionDialogOpen(false)}
					onSelectQuestion={handleAddQuestion}
					selectedGrade={testData.grade}
					selectedSubject={testData.subject}
					existingQuestions={testData.questions}
				/>
			)}
		</Dialog>
	);
}

CreateTestForm.propTypes = {
	test: PropTypes.object,
	onClose: PropTypes.func.isRequired,
};

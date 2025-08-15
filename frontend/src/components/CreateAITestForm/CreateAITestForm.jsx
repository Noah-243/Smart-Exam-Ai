/**
 * Clock.js – Real-Time Clock Component
 *
 * This React component displays the current time and date, updating every second.
 * It is designed as a lightweight and elegant utility component for use in dashboards,
 * headers, or any UI where real-time time/date display is required.
 *
 * Features:
 * - Displays the current time in HH:MM:SS format (12-hour clock, English locale).
 * - Displays the current date with weekday, month, day, and year.
 * - Updates every second using a timer (setInterval).
 * - Includes a tooltip for better accessibility ("Current time and date").
 * - Styled with Material-UI, including theme-based hover effect and icon.
 *
 * Usage:
 * Simply import and use in your JSX as a self-contained component:
 *
 *    import Clock from './Clock';
 *    ...
 *    <Clock />
ט * Props:
 * - None
 *
 * Dependencies:
 * - React (useState, useEffect)
 * - @mui/material (Typography, Box, Tooltip, useTheme)
 * - @mui/icons-material (AccessTime)
 *
 * No external data or props are required – the component is self-contained.
 */

import { useState } from "react";
import {
	Box,
	TextField,
	Button,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Alert,
	Grid,
	CircularProgress,
	Stepper,
	Step,
	StepLabel,
	Container,
	Card,
	CardContent,
	Avatar,
	Chip,
	Divider,
	Stack,
} from "@mui/material";
import {
	AutoAwesome as AiIcon,
	Settings as SettingsIcon,
	Preview as PreviewIcon,
	Check as CheckIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import { generateAITest, createAITest } from "../../api/tests";
import PropTypes from "prop-types";

const steps = ["Configure Test", "Review AI Suggestions", "Finalize Test"];

export default function CreateAITestForm({ onClose }) {
	const [activeStep, setActiveStep] = useState(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	const queryClient = useQueryClient();

	// Test configuration data
	const [testConfig, setTestConfig] = useState({
		title: "",
		description: "",
		grade: "",
		subject: "",
		duration: 60,
		comments: "",
		totalQuestions: 10,
		multipleChoiceCount: 7,
		openEndedCount: 3,
		difficulty: "medium",
		additionalInstructions: "",
	});

	// Debug current testConfig state
	console.log("Current testConfig:", testConfig);

	// Generated test data
	const [generatedTest, setGeneratedTest] = useState(null);

	const { data: grades } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
		onSuccess: (data) => {
			console.log("Grades loaded:", data);
		},
		onError: (error) => {
			console.error("Error loading grades:", error);
		},
	});

	const { data: subjects } = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
		onSuccess: (data) => {
			console.log("Subjects loaded:", data);
		},
		onError: (error) => {
			console.error("Error loading subjects:", error);
		},
	});

	// Mutation for generating AI test
	const generateTestMutation = useMutation({
		mutationFn: generateAITest,
		onSuccess: (data) => {
			setGeneratedTest(data.data);
			setActiveStep((prev) => prev + 1);
		},
		onError: (error) => {
			setError(
				error.message ||
					"Failed to generate test suggestions. Please try again."
			);
		},
		onSettled: () => {
			setIsGenerating(false);
		},
	});

	// Mutation for creating AI test
	const createTestMutation = useMutation({
		mutationFn: createAITest,
		onSuccess: () => {
			queryClient.invalidateQueries(["tests"]);
			onClose();
		},
		onError: (error) => {
			setError(error.message || "Failed to create test. Please try again.");
		},
	});

	const handleConfigChange = (field, value) => {
		console.log(`handleConfigChange - ${field}:`, value);

		// Auto-adjust question counts when total changes
		if (field === "totalQuestions") {
			setTestConfig((prev) => {
				const ratio =
					prev.multipleChoiceCount /
					(prev.multipleChoiceCount + prev.openEndedCount);
				const newMultipleChoice = Math.round(value * ratio);
				const newOpenEnded = value - newMultipleChoice;

				return {
					...prev,
					totalQuestions: value,
					multipleChoiceCount: newMultipleChoice,
					openEndedCount: newOpenEnded,
				};
			});
		} else {
			setTestConfig((prev) => {
				const newConfig = {
					...prev,
					[field]: value,
				};
				console.log("Updated testConfig:", newConfig);
				return newConfig;
			});
		}
	};

	const handleQuestionCountChange = (field, value) => {
		setTestConfig((prev) => {
			const newConfig = { ...prev, [field]: value };

			// Ensure counts don't exceed total
			if (field === "multipleChoiceCount") {
				newConfig.openEndedCount = Math.max(0, prev.totalQuestions - value);
			} else if (field === "openEndedCount") {
				newConfig.multipleChoiceCount = Math.max(
					0,
					prev.totalQuestions - value
				);
			}

			// Update total if needed
			newConfig.totalQuestions =
				newConfig.multipleChoiceCount + newConfig.openEndedCount;

			return newConfig;
		});
	};

	const validateStep = (step) => {
		switch (step) {
			case 0:
				if (!testConfig.title || !testConfig.grade || !testConfig.subject) {
					setError("Please fill in all required fields");
					return false;
				}
				if (testConfig.totalQuestions < 1) {
					setError("Must have at least 1 question");
					return false;
				}
				if (testConfig.duration < 1) {
					setError("Duration must be at least 1 minute");
					return false;
				}
				break;
			default:
				break;
		}
		setError("");
		return true;
	};

	const handleNext = async () => {
		if (!validateStep(activeStep)) return;

		if (activeStep === 0) {
			// Generate AI test suggestions
			setIsGenerating(true);
			setError("");

			generateTestMutation.mutate({
				grade: testConfig.grade,
				subject: testConfig.subject,
				totalQuestions: testConfig.totalQuestions,
				multipleChoiceCount: testConfig.multipleChoiceCount,
				openEndedCount: testConfig.openEndedCount,
				difficulty: testConfig.difficulty,
				additionalInstructions: testConfig.additionalInstructions,
			});
		} else {
			setActiveStep((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};

	const handleFinalize = async () => {
		if (!generatedTest) {
			setError(
				"No test data to create. Please go back and generate a test first."
			);
			return;
		}

		console.log("Generated test data:", generatedTest);

		// Prepare data for test creation in the format expected by backend
		const payload = {
			testData: {
				title: testConfig.title,
				description: testConfig.description,
				grade: testConfig.grade,
				subject: testConfig.subject,
				duration: testConfig.duration,
				comments: testConfig.comments,
				isAIGenerated: true,
			},
			selectedQuestionIds: generatedTest.selectedQuestionIds || [],
			newQuestions: generatedTest.newQuestions || [],
		};

		console.log("Sending payload to backend:", payload);
		createTestMutation.mutate(payload);
	};

	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return renderConfigurationStep();
			case 1:
				return renderReviewStep();
			case 2:
				return renderFinalizeStep();
			default:
				return null;
		}
	};

	const renderConfigurationStep = () => (
		<Stack spacing={4}>
			{/* Top Header - Title and Stepper in Same Row */}
			<Card
				elevation={0}
				sx={{
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}40 100%)`,
					borderRadius: 3,
					p: 4,
					position: "relative",
					overflow: "hidden",
					"&::before": {
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: (theme) =>
							`radial-gradient(circle at 30% 20%, ${theme.palette.primary.main}15 0%, transparent 50%)`,
					},
				}}
			>
				<Box sx={{ position: "relative", zIndex: 1 }}>
					{/* Title and Stepper in Same Row */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 2,
						}}
					>
						{/* Left Side - Title and Avatar */}
						<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
							<Avatar
								sx={{
									width: 64,
									height: 64,
									background: (theme) =>
										`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
									fontSize: "1.75rem",
								}}
							>
								<AiIcon fontSize="large" />
							</Avatar>
							<Box>
								<Typography variant="h4" fontWeight="bold" gutterBottom>
									Create Test with AI
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ opacity: 0.8 }}
								>
									Configure parameters and let AI generate questions
								</Typography>
							</Box>
						</Box>

						{/* Right Side - Stepper */}
						<Box sx={{ minWidth: 400 }}>
							<Stepper activeStep={activeStep} alternativeLabel>
								{steps.map((label, index) => (
									<Step key={label}>
										<StepLabel
											StepIconComponent={({ active, completed }) => (
												<Avatar
													sx={{
														width: 32,
														height: 32,
														bgcolor: completed
															? "success.main"
															: active
															? "primary.main"
															: "rgba(255,255,255,0.3)",
														color: "white",
														fontSize: "0.75rem",
													}}
												>
													{completed ? "✓" : index + 1}
												</Avatar>
											)}
										>
											<Typography
												variant="caption"
												fontWeight={activeStep === index ? "bold" : "normal"}
												sx={{ mt: 0.5, color: "white" }}
											>
												{label}
											</Typography>
										</StepLabel>
									</Step>
								))}
							</Stepper>
						</Box>
					</Box>
				</Box>
			</Card>

			{/* Settings Bar */}
			<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
				<CardContent sx={{ p: 3 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
						<SettingsIcon color="primary" />
						<Typography variant="h6" fontWeight="bold">
							Test Settings
						</Typography>
					</Box>

					<Grid container spacing={3} alignItems="center">
						{/* Duration */}
						<Grid item xs={12} md={3}>
							<TextField
								fullWidth
								size="small"
								label="Duration (min)"
								type="number"
								value={testConfig.duration}
								onChange={(e) =>
									handleConfigChange("duration", parseInt(e.target.value) || 0)
								}
								required
								InputProps={{
									inputProps: { min: 1 },
								}}
							/>
						</Grid>

						{/* Grade Level */}
						<Grid item xs={12} md={3}>
							<FormControl fullWidth size="small" required>
								<InputLabel>Grade Level</InputLabel>
								<Select
									value={testConfig.grade || ""}
									label="Grade Level"
									onChange={(e) => handleConfigChange("grade", e.target.value)}
									displayEmpty
								>
									{(grades?.data || [])
										.filter((grade) => grade && (grade._id || grade.id))
										.map((grade) => {
											const gradeId = grade._id || grade.id;
											const gradeName =
												grade.name || grade.title || "Unknown Grade";

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
						<Grid item xs={12} md={3}>
							<FormControl fullWidth size="small" required>
								<InputLabel>Subject</InputLabel>
								<Select
									value={testConfig.subject || ""}
									label="Subject"
									onChange={(e) =>
										handleConfigChange("subject", e.target.value)
									}
									displayEmpty
								>
									{(subjects?.data || [])
										.filter((subject) => subject && (subject._id || subject.id))
										.map((subject) => {
											const subjectId = subject._id || subject.id;
											const subjectName =
												subject.name || subject.title || "Unknown Subject";

											return (
												<MenuItem
													key={`subject-${subjectId}`}
													value={subjectId}
												>
													{subjectName}
												</MenuItem>
											);
										})}
								</Select>
							</FormControl>
						</Grid>

						{/* Difficulty */}
						<Grid item xs={12} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel>Difficulty</InputLabel>
								<Select
									value={testConfig.difficulty}
									label="Difficulty"
									onChange={(e) =>
										handleConfigChange("difficulty", e.target.value)
									}
								>
									<MenuItem value="easy">Easy</MenuItem>
									<MenuItem value="medium">Medium</MenuItem>
									<MenuItem value="hard">Hard</MenuItem>
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Title and Description Section */}
			<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
				<CardContent sx={{ p: 4 }}>
					<Typography
						variant="h6"
						fontWeight="bold"
						gutterBottom
						sx={{ mb: 3 }}
					>
						Test Information
					</Typography>

					<Grid container spacing={3}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Test Title"
								value={testConfig.title}
								onChange={(e) => handleConfigChange("title", e.target.value)}
								required
								variant="outlined"
								placeholder="Enter a descriptive title for your AI-generated test..."
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Test Description"
								multiline
								rows={3}
								value={testConfig.description}
								onChange={(e) =>
									handleConfigChange("description", e.target.value)
								}
								variant="outlined"
								placeholder="Describe the test purpose, learning objectives, and any special requirements..."
							/>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Two Column Layout */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<Grid container spacing={4} sx={{ flex: 1, alignItems: "stretch" }}>
					{/* Left Column - AI Instructions */}
					<Grid item xs={12} lg={6} sx={{ display: "flex" }}>
						<Card
							elevation={0}
							sx={{
								border: 1,
								borderColor: "divider",
								display: "flex",
								flexDirection: "column",
								width: "100%",
								flex: 1,
							}}
						>
							<CardContent
								sx={{
									p: 4,
									display: "flex",
									flexDirection: "column",
									flex: 1,
								}}
							>
								<Typography
									variant="h6"
									fontWeight="bold"
									gutterBottom
									sx={{ mb: 3 }}
								>
									AI Generation Instructions
								</Typography>

								<Stack spacing={3} sx={{ flex: 1 }}>
									{/* AI Instructions */}
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											gutterBottom
										>
											Special Instructions for AI
										</Typography>
										<TextField
											fullWidth
											multiline
											label="AI Instructions"
											value={testConfig.additionalInstructions}
											onChange={(e) =>
												handleConfigChange(
													"additionalInstructions",
													e.target.value
												)
											}
											variant="outlined"
											placeholder="Provide specific instructions for AI generation:&#10;• Topics to focus on or avoid&#10;• Question style preferences&#10;• Difficulty nuances&#10;• Content requirements&#10;• Assessment objectives"
											sx={{
												flex: 1,
												"& .MuiInputBase-root": {
													alignItems: "flex-start",
													height: "100%",
												},
												"& .MuiInputBase-input": {
													resize: "none",
													height: "100% !important",
													overflow: "auto !important",
													minHeight: "200px !important",
												},
											}}
										/>
									</Box>

									{/* Comments */}
									<Box>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											gutterBottom
										>
											Additional Comments
										</Typography>
										<TextField
											fullWidth
											multiline
											label="Comments"
											value={testConfig.comments}
											onChange={(e) =>
												handleConfigChange("comments", e.target.value)
											}
											variant="outlined"
											placeholder="Any additional notes about this test..."
											rows={3}
										/>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Grid>

					{/* Right Column - Question Configuration */}
					<Grid item xs={12} lg={6} sx={{ display: "flex" }}>
						<Card
							elevation={0}
							sx={{
								border: 1,
								borderColor: "divider",
								display: "flex",
								flexDirection: "column",
								width: "100%",
								flex: 1,
							}}
						>
							<CardContent
								sx={{
									p: 4,
									display: "flex",
									flexDirection: "column",
									flex: 1,
								}}
							>
								<Typography
									variant="h6"
									fontWeight="bold"
									gutterBottom
									sx={{ mb: 3 }}
								>
									Question Configuration
								</Typography>

								<Stack spacing={4} sx={{ flex: 1 }}>
									{/* Question Count Controls */}
									<Box>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											gutterBottom
										>
											Question Distribution
										</Typography>
										<Grid container spacing={2}>
											<Grid item xs={4}>
												<TextField
													fullWidth
													label="Total"
													type="number"
													value={testConfig.totalQuestions}
													onChange={(e) =>
														handleConfigChange(
															"totalQuestions",
															parseInt(e.target.value) || 0
														)
													}
													InputProps={{
														inputProps: { min: 1, max: 50 },
													}}
												/>
											</Grid>
											<Grid item xs={4}>
												<TextField
													fullWidth
													label="Multiple Choice"
													type="number"
													value={testConfig.multipleChoiceCount}
													onChange={(e) =>
														handleQuestionCountChange(
															"multipleChoiceCount",
															parseInt(e.target.value) || 0
														)
													}
													InputProps={{
														inputProps: {
															min: 0,
															max: testConfig.totalQuestions,
														},
													}}
												/>
											</Grid>
											<Grid item xs={4}>
												<TextField
													fullWidth
													label="Open Ended"
													type="number"
													value={testConfig.openEndedCount}
													onChange={(e) =>
														handleQuestionCountChange(
															"openEndedCount",
															parseInt(e.target.value) || 0
														)
													}
													InputProps={{
														inputProps: {
															min: 0,
															max: testConfig.totalQuestions,
														},
													}}
												/>
											</Grid>
										</Grid>
									</Box>

									{/* Visual Distribution */}
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											gutterBottom
										>
											Question Type Breakdown
										</Typography>
										<Grid container spacing={2}>
											<Grid item xs={6}>
												<Card
													variant="outlined"
													sx={{ p: 3, textAlign: "center", height: "100%" }}
												>
													<Typography
														variant="h3"
														fontWeight="bold"
														color="primary.main"
													>
														{testConfig.multipleChoiceCount}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Multiple Choice Questions
													</Typography>
													<Typography variant="caption" color="text.secondary">
														Quick assessment & objective scoring
													</Typography>
												</Card>
											</Grid>
											<Grid item xs={6}>
												<Card
													variant="outlined"
													sx={{ p: 3, textAlign: "center", height: "100%" }}
												>
													<Typography
														variant="h3"
														fontWeight="bold"
														color="secondary.main"
													>
														{testConfig.openEndedCount}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Open Ended Questions
													</Typography>
													<Typography variant="caption" color="text.secondary">
														Critical thinking & detailed responses
													</Typography>
												</Card>
											</Grid>
										</Grid>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Box>
		</Stack>
	);

	const renderReviewStep = () => (
		<Stack spacing={4}>
			{/* Hero Header */}
			<Box
				sx={{
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette.secondary.main}20 0%, ${theme.palette.secondary.main}40 100%)`,
					borderRadius: 3,
					p: 4,
					textAlign: "center",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Avatar
					sx={{
						width: 80,
						height: 80,
						mx: "auto",
						mb: 2,
						background: (theme) =>
							`linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
						fontSize: "2rem",
					}}
				>
					<PreviewIcon fontSize="large" />
				</Avatar>
				<Typography variant="h4" fontWeight="bold" gutterBottom>
					Review AI Suggestions
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Review the AI-generated questions and make any necessary adjustments
				</Typography>
			</Box>

			{/* Generated Test Review */}
			{generatedTest && (
				<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
					<CardContent sx={{ p: 4 }}>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							Generated Test: {testConfig.title}
						</Typography>

						<Box sx={{ mb: 3 }}>
							<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
								<Chip
									label={`${
										(generatedTest.selectedQuestionIds?.length || 0) +
										(generatedTest.newQuestions?.length || 0)
									} Questions`}
									color="primary"
									variant="outlined"
								/>
								<Chip
									label={`${
										generatedTest.selectedQuestionIds?.length || 0
									} Selected`}
									color="secondary"
									variant="outlined"
								/>
								<Chip
									label={`${
										generatedTest.newQuestions?.length || 0
									} AI Generated`}
									color="success"
									variant="outlined"
								/>
								<Chip
									label={`${testConfig.duration} minutes`}
									color="info"
									variant="outlined"
								/>
								<Chip
									label={testConfig.difficulty}
									color="warning"
									variant="outlined"
								/>
							</Stack>
						</Box>

						<Divider sx={{ my: 3 }} />

						{/* Questions Preview */}
						<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
							Questions Preview
						</Typography>

						<Stack spacing={3}>
							{/* Show selected existing questions */}
							{generatedTest.selectedQuestionIds?.length > 0 && (
								<Box>
									<Typography
										variant="subtitle2"
										color="secondary"
										gutterBottom
									>
										Selected Existing Questions (
										{generatedTest.selectedQuestionIds.length})
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 2 }}
									>
										These questions were selected from your existing question
										bank.
									</Typography>
									{generatedTest.selectedQuestionIds.map(
										(questionId, index) => (
											<Card
												key={`selected-${questionId}`}
												variant="outlined"
												sx={{ p: 3, mb: 2 }}
											>
												<Typography
													variant="subtitle2"
													color="secondary"
													gutterBottom
												>
													Selected Question {index + 1}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Question ID: {questionId}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Full details will be loaded when the test is created.
												</Typography>
											</Card>
										)
									)}
								</Box>
							)}

							{/* Show newly generated questions */}
							{generatedTest.newQuestions?.length > 0 && (
								<Box>
									<Typography
										variant="subtitle2"
										color="success.main"
										gutterBottom
									>
										AI Generated Questions ({generatedTest.newQuestions.length})
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 2 }}
									>
										These questions were created by AI based on your
										requirements.
									</Typography>
									{generatedTest.newQuestions.map((question, index) => (
										<Card
											key={`new-${index}`}
											variant="outlined"
											sx={{ p: 3, mb: 2 }}
										>
											<Typography
												variant="subtitle2"
												color="success.main"
												gutterBottom
											>
												AI Question {index + 1}
											</Typography>
											<Typography variant="body1" gutterBottom>
												{question.body || question.text}
											</Typography>

											{question.answers && question.answers.length > 0 && (
												<Box sx={{ mt: 2 }}>
													<Typography
														variant="caption"
														color="text.secondary"
														gutterBottom
														display="block"
													>
														Answer Options:
													</Typography>
													{question.answers.map((answer, ansIndex) => (
														<Typography
															key={ansIndex}
															variant="body2"
															sx={{
																ml: 2,
																color: answer.isCorrect
																	? "success.main"
																	: "text.secondary",
																fontWeight: answer.isCorrect
																	? "medium"
																	: "normal",
															}}
														>
															{String.fromCharCode(65 + ansIndex)}.{" "}
															{answer.body}
															{answer.isCorrect && " ✓"}
														</Typography>
													))}
												</Box>
											)}

											{question.isTextAnswer && (
												<Box sx={{ mt: 2 }}>
													<Typography
														variant="caption"
														color="text.secondary"
														gutterBottom
														display="block"
													>
														Open-ended question - no predefined answers
													</Typography>
													{question.gradingGuidelines && (
														<Typography
															variant="body2"
															color="text.secondary"
															sx={{ fontStyle: "italic" }}
														>
															Grading Guidelines: {question.gradingGuidelines}
														</Typography>
													)}
												</Box>
											)}
										</Card>
									))}
								</Box>
							)}

							{/* Show message if no questions were generated */}
							{(!generatedTest.selectedQuestionIds ||
								generatedTest.selectedQuestionIds.length === 0) &&
								(!generatedTest.newQuestions ||
									generatedTest.newQuestions.length === 0) && (
									<Card variant="outlined" sx={{ p: 4, textAlign: "center" }}>
										<Typography variant="h6" color="error" gutterBottom>
											No Questions Generated
										</Typography>
										<Typography variant="body2" color="text.secondary">
											The AI was unable to generate questions for this test.
											Please try again with different parameters.
										</Typography>
									</Card>
								)}
						</Stack>
					</CardContent>
				</Card>
			)}
		</Stack>
	);

	const renderFinalizeStep = () => (
		<Stack spacing={4}>
			{/* Hero Header */}
			<Box
				sx={{
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette.success.main}20 0%, ${theme.palette.success.main}40 100%)`,
					borderRadius: 3,
					p: 4,
					textAlign: "center",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Avatar
					sx={{
						width: 80,
						height: 80,
						mx: "auto",
						mb: 2,
						background: (theme) =>
							`linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
						fontSize: "2rem",
					}}
				>
					<CheckIcon fontSize="large" />
				</Avatar>
				<Typography variant="h4" fontWeight="bold" gutterBottom>
					Finalize Test
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Your AI-generated test is ready to be created
				</Typography>
			</Box>

			{/* Final Summary */}
			<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
				<CardContent sx={{ p: 4 }}>
					<Typography variant="h6" fontWeight="bold" gutterBottom>
						Test Summary
					</Typography>

					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								Title
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{testConfig.title}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								Duration
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{testConfig.duration} minutes
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								Total Questions
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{(generatedTest?.selectedQuestionIds?.length || 0) +
									(generatedTest?.newQuestions?.length || 0)}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								Difficulty
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ textTransform: "capitalize" }}
							>
								{testConfig.difficulty}
							</Typography>
						</Grid>
					</Grid>

					{testConfig.description && (
						<Box sx={{ mt: 3 }}>
							<Typography variant="body2" color="text.secondary">
								Description
							</Typography>
							<Typography variant="body1">{testConfig.description}</Typography>
						</Box>
					)}
				</CardContent>
			</Card>
		</Stack>
	);

	return (
		<Box sx={{ width: "100%", height: "100%" }}>
			<DialogTitle sx={{ pb: 2 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<AiIcon color="primary" />
					<Typography variant="h6" fontWeight="bold">
						Create Test with AI
					</Typography>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ px: 3, pb: 2 }}>
				<Container maxWidth="xl" sx={{ py: 2 }}>
					{/* Error Display */}
					{error && (
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					)}

					{/* Step Content */}
					{renderStepContent()}
				</Container>
			</DialogContent>

			<DialogActions sx={{ p: 0 }}>
				<Card
					elevation={0}
					sx={{ border: 1, borderColor: "divider", width: "100%" }}
				>
					<CardContent sx={{ p: 4 }}>
						<Stack direction="row" spacing={3} justifyContent="space-between">
							<Button
								onClick={onClose}
								color="inherit"
								size="large"
								sx={{ minWidth: 140 }}
							>
								Cancel
							</Button>

							<Box sx={{ display: "flex", gap: 2 }}>
								{activeStep > 0 && (
									<Button
										onClick={handleBack}
										color="inherit"
										size="large"
										sx={{ minWidth: 100 }}
									>
										Back
									</Button>
								)}

								{activeStep < steps.length - 1 ? (
									<Button
										onClick={handleNext}
										variant="contained"
										disabled={isGenerating}
										size="large"
										startIcon={
											isGenerating ? <CircularProgress size={20} /> : <AiIcon />
										}
										sx={{ minWidth: 180 }}
									>
										{isGenerating ? "Generating..." : "Generate with AI"}
									</Button>
								) : (
									<Button
										onClick={handleFinalize}
										variant="contained"
										disabled={createTestMutation.isLoading}
										size="large"
										startIcon={
											createTestMutation.isLoading ? (
												<CircularProgress size={20} />
											) : (
												<CheckIcon />
											)
										}
										sx={{ minWidth: 140 }}
									>
										{createTestMutation.isLoading
											? "Creating..."
											: "Create Test"}
									</Button>
								)}
							</Box>
						</Stack>
					</CardContent>
				</Card>
			</DialogActions>
		</Box>
	);
}

CreateAITestForm.propTypes = {
	onClose: PropTypes.func.isRequired,
};

/**
 * CreateQuestionForm.jsx – Form Component for Creating or Editing Questions
 *
 * Purpose:
 * Provides an interactive form for manually creating or editing questions, with optional AI-powered generation
 * using the GeminiService. Supports multiple question types, dynamic validation, and integration with backend APIs.
 *
 * Features:
 * - Create/edit questions with fields like body, answers, grading guidelines, grade, subject, and difficulty.
 * - Supports multiple-choice (single or multiple correct answers) and open-ended questions.
 * - AI-assisted question generation via Gemini based on a user-provided prompt.
 * - Real-time form validation with contextual error messages.
 * - Dropdowns for grades and subjects fetched from backend APIs.
 * - Uses Material UI components for a responsive and accessible interface.
 *
 * Props:
 * - `question` (object, optional): Existing question data for editing.
 * - `onClose` (function, required): Callback to close the form or dialog.
 *
 * State Overview:
 * - `formData`: Stores all form inputs.
 * - `errors`: Holds validation and submission errors.
 * - `isGeminiDialogOpen`: Controls AI generation dialog visibility.
 * - `geminiPrompt`: Text prompt for AI-generated questions.
 * - `isGeneratingQuestion`: Loading indicator during AI generation.
 *
 * Core Logic:
 * - Manages controlled form inputs with validation.
 * - Adds/removes answers, marks correct options, handles multiple modes.
 * - Sends form data to the backend to create or update a question.
 * - Opens an AI dialog, submits a prompt, and inserts generated question details.
 *
 * Usage Example:
 * <CreateQuestionForm onClose={handleClose} />
 * <CreateQuestionForm question={existingQuestion} onClose={handleClose} />
 *
 * Notes:
 * - Requires React Query and authentication context.
 * - All backend interactions are done via pre-defined API functions.
 * - Gemini AI integration is optional but enhances the creation process.
 */

import {
	Button,
	Checkbox,
	TextField,
	MenuItem,
	OutlinedInput,
	Select,
	CircularProgress,
	Alert,
	Box,
	FormControl,
	Typography,
	Grid,
	IconButton,
	Chip,
	InputLabel,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Container,
	Card,
	CardContent,
	Avatar,
	Stack,
	FormControlLabel,
	Switch,
} from "@mui/material";
import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createQuestion } from "../../api/questions";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import {
	Delete as DeleteIcon,
	AutoAwesome as AutoAwesomeIcon,
	QuestionAnswer as QuestionIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import GeminiService from "../../services/geminiService";
import PropTypes from "prop-types";

export default function CreateQuestionForm({ question, onClose }) {
	const { user } = useUser();
	const [formData, setFormData] = useState({
		title: question?.title || "",
		body: question?.body || "",
		isMultiAnswer: question?.isMultiAnswer || false,
		isTextAnswer: question?.isTextAnswer || false,
		gradingGuidelines: question?.gradingGuidelines || "",
		answers: question?.answers || [{ body: "", isCorrect: false }],
		grades: question?.grades?.map((g) => g._id) || [],
		subjects: question?.subjects?.map((s) => s._id) || [],
		subject: question?.subjects?.[0]?._id || "",
		difficulty: question?.difficulty || "medium",
	});

	const [errors, setErrors] = useState({});

	// Add states for Gemini generation
	const [isGeminiDialogOpen, setIsGeminiDialogOpen] = useState(false);
	const [geminiPrompt, setGeminiPrompt] = useState("");
	const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

	const queryClient = useQueryClient();

	// Fetch grades
	const {
		data: gradesData,
		isLoading: isLoadingGrades,
		error: gradesError,
	} = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	// Fetch subjects
	const {
		data: subjectsData,
		isLoading: isLoadingSubjects,
		error: subjectsError,
	} = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
	});

	const {
		mutate: submitQuestion,
		isLoading,
		error: submitError,
	} = useMutation({
		mutationFn: async (questionData) => {
			console.log("Submitting question data:", questionData);

			const response = await createQuestion(questionData);

			console.log("Question creation response:", response);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			if (onClose) onClose();
			clearForm();
		},
		onError: (error) => {
			console.error("Error creating question:", error);
			setErrors((prev) => ({
				...prev,
				submit: error.response?.data?.message || "An error occurred",
			}));
			// Scroll to top to show the error
			window.scrollTo({ top: 0, behavior: "smooth" });
		},
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear errors when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleGradesChange = (event) => {
		const value = event.target.value;
		setFormData((prev) => ({
			...prev,
			grades: typeof value === "string" ? value.split(",") : value,
		}));

		// Clear errors
		if (errors.grades) {
			setErrors((prev) => ({ ...prev, grades: "" }));
		}
	};

	const handleSubjectsChange = (event) => {
		const value = event.target.value;
		setFormData((prev) => ({
			...prev,
			subject: value,
			// Keep subjects array for backward compatibility with existing data
			subjects: value ? [value] : [],
		}));

		// Clear errors
		if (errors.subjects) {
			setErrors((prev) => ({ ...prev, subjects: "" }));
		}
	};

	const handleCheckboxChange = (e) => {
		const { name, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: checked,
		}));
	};

	const handleAnswerChange = (index, field, value) => {
		const newAnswers = [...formData.answers];

		if (field === "isCorrect") {
			if (formData.isMultiAnswer) {
				// Multi-answer: allow multiple correct answers
				newAnswers[index] = {
					...newAnswers[index],
					[field]: value,
				};
			} else {
				// Single answer: only one can be correct
				// First, set all answers to incorrect
				newAnswers.forEach((answer, i) => {
					newAnswers[i] = {
						...answer,
						isCorrect: false,
					};
				});
				// Then set the selected one to correct (only if checking, not unchecking)
				if (value) {
					newAnswers[index] = {
						...newAnswers[index],
						isCorrect: true,
					};
				}
			}
		} else {
			// For other fields (like body), just update normally
			newAnswers[index] = {
				...newAnswers[index],
				[field]: value,
			};
		}

		setFormData((prev) => ({
			...prev,
			answers: newAnswers,
		}));
	};

	const addAnswer = () => {
		setFormData((prev) => ({
			...prev,
			answers: [...prev.answers, { body: "", isCorrect: false }],
		}));
	};

	const removeAnswer = (index) => {
		if (formData.answers.length > 1) {
			const newAnswers = formData.answers.filter((_, i) => i !== index);
			setFormData((prev) => ({
				...prev,
				answers: newAnswers,
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.body.trim()) {
			newErrors.body = "Question body is required";
		}

		if (formData.grades.length === 0) {
			newErrors.grades = "At least one grade level is required";
		}

		if (!formData.subject) {
			newErrors.subjects = "A subject is required";
		}

		if (!formData.isTextAnswer) {
			// For multiple choice questions
			if (formData.answers.length < 2) {
				newErrors.answers = "At least 2 answer options are required";
			} else {
				const hasCorrectAnswer = formData.answers.some(
					(answer) => answer.isCorrect
				);
				if (!hasCorrectAnswer) {
					newErrors.answers = "At least one answer must be marked as correct";
				}

				const hasEmptyAnswers = formData.answers.some(
					(answer) => !answer.body.trim()
				);
				if (hasEmptyAnswers) {
					newErrors.answers = "All answer options must have content";
				}
			}
		} else {
			// For text answer questions
			if (!formData.gradingGuidelines.trim()) {
				newErrors.gradingGuidelines =
					"Grading guidelines are required for text answer questions";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const clearForm = () => {
		setFormData({
			title: "",
			body: "",
			isMultiAnswer: false,
			isTextAnswer: false,
			gradingGuidelines: "",
			answers: [{ body: "", isCorrect: false }],
			grades: [],
			subjects: [],
			subject: "",
			difficulty: "medium",
		});
		setErrors({});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Create the grade-subject pairs as required by the backend
		const gradeSubjects = [];
		if (formData.grades.length > 0 && formData.subject) {
			formData.grades.forEach((gradeId) => {
				gradeSubjects.push({
					grade: gradeId,
					subject: formData.subject,
				});
			});
		}

		// Determine question type based on isTextAnswer
		const type = formData.isTextAnswer ? "text" : "multiple-choice";

		// Prepare the question data in the format expected by the backend
		const questionData = {
			body: formData.body,
			type: type,
			isMultiAnswer: formData.isMultiAnswer,
			isTextAnswer: formData.isTextAnswer,
			gradingGuidelines: formData.gradingGuidelines,
			answers: formData.isTextAnswer
				? [] // No answers for text questions
				: formData.answers.filter((answer) => answer.body.trim() !== ""),
			gradeSubjects: gradeSubjects,
			difficulty: formData.difficulty,
			user: user?._id, // Backend expects 'user' field, not 'createdBy'
		};

		console.log("Final question data being submitted:", questionData);

		submitQuestion(questionData);
	};

	const handleGeminiPromptChange = (e) => {
		setGeminiPrompt(e.target.value);
	};

	const handleGenerateQuestion = async () => {
		if (!geminiPrompt.trim()) {
			return;
		}

		setIsGeneratingQuestion(true);

		try {
			// Format grade options for Gemini (just names for AI to match)
			const gradeOptions = gradesData?.data
				?.map((grade) => `"${grade.name}"`)
				.join(", ");

			// Format subject options for Gemini (just names for AI to match)
			const subjectOptions = subjectsData?.data
				?.map((subject) => `"${subject.name}"`)
				.join(", ");

			// Available difficulty levels
			const difficultyOptions = '"easy", "medium", "hard"';

			// Detect question type from prompt
			const promptLower = geminiPrompt.toLowerCase();
			const isOpenEndedRequest =
				promptLower.includes("open") ||
				promptLower.includes("text") ||
				promptLower.includes("essay") ||
				promptLower.includes("explain") ||
				promptLower.includes("describe");

			const isMultipleChoiceRequest =
				promptLower.includes("multiple") ||
				promptLower.includes("choice") ||
				promptLower.includes("select") ||
				promptLower.includes("choose");

			// Determine final question type
			const shouldBeTextAnswer =
				isOpenEndedRequest && !isMultipleChoiceRequest
					? true
					: isMultipleChoiceRequest
					? false
					: formData.isTextAnswer;

			// Extract difficulty from user prompt if specified, otherwise use form default
			const extractDifficultyFromPrompt = (prompt) => {
				const promptLower = prompt.toLowerCase();
				if (promptLower.includes("easy")) return "easy";
				if (promptLower.includes("hard")) return "hard";
				if (promptLower.includes("medium")) return "medium";
				return formData.difficulty; // fallback to form state
			};

			const requestedDifficulty = extractDifficultyFromPrompt(geminiPrompt);

			const promptData = {
				prompt: `${geminiPrompt}. ${
					shouldBeTextAnswer
						? "Make this an open-ended text answer question that requires written responses."
						: "Make this a multiple choice question with distinct answer options that go into the system's answer components, NOT in the question body."
				}`,
				isTextAnswer: shouldBeTextAnswer,
				isMultiAnswer: formData.isMultiAnswer,
				difficulty: requestedDifficulty,
				gradeOptions,
				subjectOptions,
				difficultyOptions,
			};

			const generatedQuestion = await GeminiService.createQuestion(promptData);

			setFormData((prevData) => {
				// Handle subject selection by finding the matching option by name
				let subjectId = null;

				// Determine subject name from different possible formats
				let subjectName = null;
				if (typeof generatedQuestion.subject === "string") {
					subjectName = generatedQuestion.subject;
				} else if (generatedQuestion.subject?.name) {
					subjectName = generatedQuestion.subject.name;
				} else if (generatedQuestion.subject?.id) {
					subjectId = generatedQuestion.subject.id;
				}

				// If we have a subject name, find the matching subject by name
				if (subjectName && subjectsData?.data) {
					const aiSubjectName = subjectName.toLowerCase().trim();

					const matchingSubject = subjectsData.data.find(
						(subject) => subject.name.toLowerCase().trim() === aiSubjectName
					);

					if (matchingSubject) {
						subjectId = matchingSubject.id;
					} else {
						// Try partial matching as fallback
						const partialMatch = subjectsData.data.find(
							(subject) =>
								subject.name.toLowerCase().includes(aiSubjectName) ||
								aiSubjectName.includes(subject.name.toLowerCase())
						);
						if (partialMatch) {
							subjectId = partialMatch.id;
						}
					}
				}

				// Handle grade selection by finding the matching option by name
				let gradeId = null;

				// Determine grade name from different possible formats
				let gradeName = null;
				if (typeof generatedQuestion.gradeLevel === "string") {
					gradeName = generatedQuestion.gradeLevel;
				} else if (generatedQuestion.gradeLevel?.name) {
					gradeName = generatedQuestion.gradeLevel.name;
				} else if (generatedQuestion.gradeLevel?.id) {
					gradeId = generatedQuestion.gradeLevel.id;
				}

				// If we have a grade name, find the matching grade by name
				if (gradeName && gradesData?.data) {
					const aiGradeName = gradeName.toLowerCase().trim();

					const matchingGrade = gradesData.data.find(
						(grade) => grade.name.toLowerCase().trim() === aiGradeName
					);

					if (matchingGrade) {
						gradeId = matchingGrade.id;
					} else {
						// Try partial matching as fallback
						const partialMatch = gradesData.data.find(
							(grade) =>
								grade.name.toLowerCase().includes(aiGradeName) ||
								aiGradeName.includes(grade.name.toLowerCase())
						);
						if (partialMatch) {
							gradeId = partialMatch.id;
						}
					}
				}

				const newFormData = {
					...prevData,
					title: generatedQuestion.title || prevData.title,
					body: generatedQuestion.body || prevData.body,
					isTextAnswer:
						generatedQuestion.isTextAnswer !== undefined
							? generatedQuestion.isTextAnswer
							: shouldBeTextAnswer,
					isMultiAnswer:
						generatedQuestion.isMultiAnswer !== undefined
							? generatedQuestion.isMultiAnswer
							: prevData.isMultiAnswer,
					gradingGuidelines:
						generatedQuestion.gradingGuidelines || prevData.gradingGuidelines,
					difficulty: generatedQuestion.difficulty || prevData.difficulty,
					answers:
						generatedQuestion.answers && generatedQuestion.answers.length > 0
							? generatedQuestion.answers
							: prevData.answers,
					// Update grades using the mapped grade ID
					grades: gradeId ? [gradeId] : prevData.grades,
					// Update both subject fields for proper dropdown update
					subject: subjectId || prevData.subject,
					subjects: subjectId ? [subjectId] : prevData.subjects,
				};

				return newFormData;
			});

			// Close the dialog
			setIsGeminiDialogOpen(false);
			setGeminiPrompt("");
		} catch (error) {
			console.error("Error generating question with Gemini:", error);
			setErrors((prev) => ({
				...prev,
				gemini:
					error.message || "Failed to generate question. Please try again.",
			}));
		} finally {
			setIsGeneratingQuestion(false);
		}
	};

	const renderHeroHeader = () => (
		<Card
			elevation={0}
			sx={{
				background: (theme) =>
					`linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}40 100%)`,
				borderRadius: 3,
				p: 3,
				position: "relative",
				overflow: "hidden",
				border: "none",
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
			<Box
				sx={{
					position: "relative",
					zIndex: 1,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
					<Avatar
						sx={{
							width: 56,
							height: 56,
							background: (theme) =>
								`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
							fontSize: "1.75rem",
						}}
					>
						<QuestionIcon fontSize="large" />
					</Avatar>
					<Box>
						<Typography variant="h5" fontWeight="bold" gutterBottom>
							{question ? "Edit Question" : "Create New Question"}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ maxWidth: 500 }}
						>
							{question
								? "Modify the question details and settings below"
								: "Create engaging questions for your tests with AI assistance or manual input"}
						</Typography>
					</Box>
				</Box>
				<Button
					variant="contained"
					onClick={() => setIsGeminiDialogOpen(true)}
					startIcon={<AutoAwesomeIcon />}
					sx={{
						borderRadius: 2,
						textTransform: "none",
						fontWeight: "medium",
						px: 3,
						py: 1.25,
						fontSize: "0.95rem",
						boxShadow: 2,
					}}
				>
					Generate with AI
				</Button>
			</Box>
		</Card>
	);

	const renderQuestionContent = () => (
		<Card
			elevation={0}
			sx={{
				border: 1,
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
			}}
		>
			<CardContent
				sx={{
					p: 4,
					display: "flex",
					flexDirection: "column",
					flex: 1,
					height: "100%",
				}}
			>
				<Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
					Question Content
				</Typography>

				<Stack spacing={3} sx={{ height: "100%" }}>
					<TextField
						fullWidth
						label="Question Title (Optional)"
						name="title"
						value={formData.title}
						onChange={handleInputChange}
						variant="outlined"
						placeholder="Brief title for the question..."
						sx={{ flexShrink: 0 }}
					/>

					<TextField
						fullWidth
						multiline
						label="Question Body"
						name="body"
						value={formData.body}
						onChange={handleInputChange}
						error={!!errors.body}
						helperText={errors.body}
						variant="outlined"
						placeholder="Enter your question here..."
						required
						minRows={8}
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
							},
						}}
					/>
				</Stack>
			</CardContent>
		</Card>
	);

	const renderParametersBar = () => (
		<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
			<CardContent sx={{ p: 2.5 }}>
				<Grid container spacing={2} alignItems="center">
					{/* Question Type Controls */}
					<Grid item xs={12} md={3}>
						<Typography variant="subtitle2" fontWeight="medium" gutterBottom>
							Question Type
						</Typography>
						<Stack direction="row" spacing={1}>
							<FormControlLabel
								control={
									<Switch
										checked={formData.isTextAnswer}
										onChange={handleCheckboxChange}
										name="isTextAnswer"
										size="small"
									/>
								}
								label="Text Answer"
								sx={{ fontSize: "0.875rem" }}
							/>
							{!formData.isTextAnswer && (
								<FormControlLabel
									control={
										<Switch
											checked={formData.isMultiAnswer}
											onChange={handleCheckboxChange}
											name="isMultiAnswer"
											size="small"
										/>
									}
									label="Multi-Answer"
									sx={{ fontSize: "0.875rem" }}
								/>
							)}
						</Stack>
					</Grid>

					{/* Grade Levels */}
					<Grid item xs={12} md={3}>
						<FormControl fullWidth size="small" error={!!errors.grades}>
							<InputLabel>Grade Levels</InputLabel>
							<Select
								multiple
								name="grades"
								value={Array.isArray(formData.grades) ? formData.grades : []}
								onChange={handleGradesChange}
								input={<OutlinedInput label="Grade Levels" />}
								renderValue={(selected) => (
									<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
										{Array.isArray(selected) &&
											selected.map((gradeId, index) => {
												const grade = gradesData?.data?.find(
													(g) => g._id === gradeId
												);
												return grade ? (
													<Chip
														key={`grade-${grade._id}-${index}`}
														label={grade.name}
														size="small"
													/>
												) : null;
											})}
									</Box>
								)}
							>
								{(gradesData?.data || []).map((grade) => (
									<MenuItem key={grade._id} value={grade._id}>
										{grade.name}
									</MenuItem>
								))}
							</Select>
							{errors.grades && (
								<Typography
									variant="caption"
									color="error"
									sx={{ mt: 0.5, fontSize: "0.75rem" }}
								>
									{errors.grades}
								</Typography>
							)}
						</FormControl>
					</Grid>

					{/* Subject */}
					<Grid item xs={12} md={3}>
						<FormControl fullWidth size="small" error={!!errors.subjects}>
							<InputLabel>Subject</InputLabel>
							<Select
								name="subject"
								value={formData.subject || ""}
								onChange={handleSubjectsChange}
								label="Subject"
								displayEmpty
							>
								{(subjectsData?.data || [])
									.filter((subject) => subject && (subject._id || subject.id))
									.map((subject, index) => {
										const subjectId = subject._id || subject.id;
										const subjectName =
											subject.name || subject.title || `Subject ${index + 1}`;

										return (
											<MenuItem
												key={`subject-option-${subjectId}`}
												value={subjectId}
											>
												{subjectName}
											</MenuItem>
										);
									})}
							</Select>
							{errors.subjects && (
								<Typography
									variant="caption"
									color="error"
									sx={{ mt: 0.5, fontSize: "0.75rem" }}
								>
									{errors.subjects}
								</Typography>
							)}
						</FormControl>
					</Grid>

					{/* Difficulty */}
					<Grid item xs={12} md={3}>
						<FormControl fullWidth size="small">
							<InputLabel>Difficulty Level</InputLabel>
							<Select
								name="difficulty"
								value={formData.difficulty}
								onChange={handleInputChange}
								label="Difficulty Level"
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
	);

	const renderAnswerOptions = () => {
		if (formData.isTextAnswer) {
			return (
				<Card
					elevation={0}
					sx={{
						border: 1,
						borderColor: "divider",
						display: "flex",
						flexDirection: "column",
						width: "100%",
						height: "100%",
					}}
				>
					<CardContent
						sx={{
							p: 4,
							display: "flex",
							flexDirection: "column",
							flex: 1,
							height: "100%",
						}}
					>
						<Typography
							variant="h6"
							fontWeight="bold"
							gutterBottom
							sx={{ mb: 3, flexShrink: 0 }}
						>
							Grading Guidelines
						</Typography>
						<TextField
							fullWidth
							multiline
							label="Grading Guidelines"
							name="gradingGuidelines"
							value={formData.gradingGuidelines}
							onChange={handleInputChange}
							error={!!errors.gradingGuidelines}
							helperText={
								errors.gradingGuidelines ||
								"Provide detailed guidelines for how to grade text responses"
							}
							variant="outlined"
							placeholder="Describe what constitutes a correct answer, key points to look for, and grading criteria..."
							required
							minRows={8}
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
								},
							}}
						/>
					</CardContent>
				</Card>
			);
		}

		return (
			<Card
				elevation={0}
				sx={{
					border: 1,
					borderColor: "divider",
					display: "flex",
					flexDirection: "column",
					width: "100%",
					height: "100%",
				}}
			>
				<CardContent
					sx={{
						p: 4,
						display: "flex",
						flexDirection: "column",
						flex: 1,
						height: "100%",
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 3,
							flexShrink: 0,
						}}
					>
						<Typography variant="h6" fontWeight="bold">
							Answer Options
						</Typography>
						<Button
							variant="outlined"
							startIcon={<AddIcon />}
							onClick={addAnswer}
							sx={{
								borderRadius: 2,
								textTransform: "none",
								fontWeight: "medium",
							}}
						>
							Add Option
						</Button>
					</Box>

					{errors.answers && (
						<Alert severity="error" sx={{ mb: 3, flexShrink: 0 }}>
							{errors.answers}
						</Alert>
					)}

					<Stack spacing={3} sx={{ flex: 1, overflow: "auto" }}>
						{formData.answers.map((answer, index) => (
							<Card
								key={index}
								variant="outlined"
								sx={{ p: 3, flexShrink: 0 }}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
									<FormControlLabel
										control={
											<Checkbox
												checked={answer.isCorrect}
												onChange={(e) =>
													handleAnswerChange(
														index,
														"isCorrect",
														e.target.checked
													)
												}
											/>
										}
										label="Correct"
									/>
									<TextField
										fullWidth
										label={`Option ${String.fromCharCode(65 + index)}`}
										value={answer.body}
										onChange={(e) =>
											handleAnswerChange(index, "body", e.target.value)
										}
										variant="outlined"
										placeholder="Enter answer option..."
									/>
									{formData.answers.length > 1 && (
										<IconButton
											onClick={() => removeAnswer(index)}
											color="error"
											sx={{ flexShrink: 0 }}
										>
											<DeleteIcon />
										</IconButton>
									)}
								</Box>
							</Card>
						))}
					</Stack>
				</CardContent>
			</Card>
		);
	};

	const renderAIDialog = () => (
		<Dialog
			open={isGeminiDialogOpen}
			onClose={() => setIsGeminiDialogOpen(false)}
			maxWidth="lg"
			fullWidth
		>
			<DialogTitle>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						sx={{
							bgcolor: "primary.main",
							width: 40,
							height: 40,
						}}
					>
						<AutoAwesomeIcon />
					</Avatar>
					<Typography variant="h6" fontWeight="bold">
						Generate Question with AI
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Stack spacing={3} sx={{ mt: 2 }}>
					<Alert severity="info">
						Describe what kind of question you want to create. Be specific about
						the topic, grade level, and any special requirements.
					</Alert>

					<TextField
						fullWidth
						multiline
						rows={6}
						label="Question Requirements"
						value={geminiPrompt}
						onChange={handleGeminiPromptChange}
						placeholder="Example: Create a medium difficulty math question about fractions for 5th grade students. The question should test their understanding of adding fractions with different denominators."
						variant="outlined"
					/>

					{errors.gemini && <Alert severity="error">{errors.gemini}</Alert>}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 3 }}>
				<Button onClick={() => setIsGeminiDialogOpen(false)} color="inherit">
					Cancel
				</Button>
				<Button
					onClick={handleGenerateQuestion}
					variant="contained"
					disabled={isGeneratingQuestion || !geminiPrompt.trim()}
					startIcon={
						isGeneratingQuestion ? (
							<CircularProgress size={20} />
						) : (
							<AutoAwesomeIcon />
						)
					}
				>
					{isGeneratingQuestion ? "Generating..." : "Generate Question"}
				</Button>
			</DialogActions>
		</Dialog>
	);

	if (isLoadingGrades || isLoadingSubjects) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (gradesError || subjectsError) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				Error loading form data:{" "}
				{gradesError?.message || subjectsError?.message}
			</Alert>
		);
	}

	return (
		<Dialog
			open={true}
			onClose={onClose}
			maxWidth={false}
			fullWidth
			sx={{
				"& .MuiDialog-paper": {
					width: "75vw",
					height: "90vh",
					minHeight: "700px",
					maxWidth: "none",
					maxHeight: "none",
					borderRadius: 2,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
				},
			}}
		>
			<Box
				sx={{
					width: "100%",
					height: "100%",
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
						maxWidth={false}
						sx={{
							maxWidth: "none",
							flex: 1,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<form
							onSubmit={handleSubmit}
							style={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "space-between",
									minHeight: "100%",
									gap: 3,
								}}
							>
								{/* Top Section - Header and Settings */}
								<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
									{/* Hero Header */}
									{renderHeroHeader()}

									{/* Error Display */}
									{(errors.submit || submitError) && (
										<Alert severity="error">
											{errors.submit ||
												submitError?.message ||
												"An error occurred"}
										</Alert>
									)}

									{/* Parameters Bar */}
									{renderParametersBar()}
								</Box>

								{/* Middle Section - Two Column Content */}
								<Box sx={{ flex: 1, minHeight: 400 }}>
									<Grid container spacing={4} sx={{ height: "100%" }}>
										{/* Left Column - Question Content */}
										<Grid
											item
											xs={12}
											lg={6}
											sx={{ display: "flex", height: "100%" }}
										>
											{renderQuestionContent()}
										</Grid>

										{/* Right Column - Answer Options / Grading Guidelines */}
										<Grid
											item
											xs={12}
											lg={6}
											sx={{ display: "flex", height: "100%" }}
										>
											{renderAnswerOptions()}
										</Grid>
									</Grid>
								</Box>

								{/* Bottom Section - Action Buttons */}
								<Box sx={{ flexShrink: 0 }}>
									<Card
										elevation={0}
										sx={{ border: 1, borderColor: "divider" }}
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
													type="submit"
													variant="contained"
													disabled={isLoading}
													startIcon={
														isLoading ? (
															<CircularProgress size={20} />
														) : (
															<QuestionIcon />
														)
													}
													size="large"
													sx={{ minWidth: 140 }}
												>
													{isLoading
														? "Creating..."
														: question
														? "Update Question"
														: "Create Question"}
												</Button>
											</Stack>
										</CardContent>
									</Card>
								</Box>
							</Box>
						</form>

						{/* AI Generation Dialog */}
						{renderAIDialog()}
					</Container>
				</Box>
			</Box>
		</Dialog>
	);
}

CreateQuestionForm.propTypes = {
	question: PropTypes.object,
	onClose: PropTypes.func.isRequired,
};

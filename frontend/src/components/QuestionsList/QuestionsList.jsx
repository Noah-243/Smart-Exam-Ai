/**
 * QuestionsList.jsx
 *
 * This React component displays a paginated and filterable list of questions.
 * Users can:
 * - View detailed information about each question in a dialog.
 * - Edit existing questions or copy them as new ones.
 * - Delete questions with confirmation.
 *
 * Features:
 * - Fetches data from the server using React Query with pagination.
 * - Filters questions by grade, subject, and question type (text, single, multiple).
 * - Provides visual indicators (icons, chips) for question metadata.
 * - Modular dialogs for viewing and deleting questions.
 *
 * Props:
 * - filters: { grades: string[], subjects: string[], type: string } – filtering criteria.
 * - onCopyAsNew: function – handler to copy a question as a new one.
 */

import React, { useState } from "react";
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	Pagination,
	Alert,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Stack,
	Avatar,
} from "@mui/material";
import {
	Delete as DeleteIcon,
	TextFields as TextFieldsIcon,
	CheckBox as CheckBoxIcon,
	RadioButtonChecked as RadioButtonCheckedIcon,
	Edit as EditIcon,
	ContentCopy as CopyIcon,
	QuestionAnswer as QuestionIcon,
	Warning as WarningIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getQuestions, deleteQuestion } from "../../api/questions";
import CreateQuestionForm from "../CreateQuestionForm/CreateQuestionForm";
import PropTypes from "prop-types";

// Question View Dialog Component
const QuestionViewDialog = ({ question, open, onClose, onCopyAsNew }) => {
	const { t } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	if (!question) return null;

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCloseEdit = () => {
		setIsEditing(false);
		onClose();
	};

	const handleCopyAsNew = () => {
		onCopyAsNew(question);
		onClose();
	};

	const getTypeInfo = (question) => {
		if (question.isTextAnswer) {
			return {
				icon: <TextFieldsIcon />,
				color: "success",
				label: t("questions.openEnded"),
			};
		} else if (question.isMultiAnswer) {
			return {
				icon: <CheckBoxIcon />,
				color: "warning",
				label: t("questions.multipleAnswer"),
			};
		} else {
			return {
				icon: <RadioButtonCheckedIcon />,
				color: "info",
				label: t("questions.singleAnswer"),
			};
		}
	};

	const getGradesAndSubjects = (question) => {
		if (!question.gradeSubjects || !Array.isArray(question.gradeSubjects)) {
			return { grades: [], subjects: [] };
		}

		const grades = question.gradeSubjects
			.filter((gs) => gs.grade)
			.map((gs) => gs.grade.name || gs.grade._id || "Unknown")
			.filter(Boolean);

		const subjects = question.gradeSubjects
			.filter((gs) => gs.subject)
			.map((gs) => gs.subject.name || gs.subject._id || "Unknown")
			.filter(Boolean);

		return { grades: [...new Set(grades)], subjects: [...new Set(subjects)] };
	};

	const typeInfo = getTypeInfo(question);
	const { grades, subjects } = getGradesAndSubjects(question);

	if (isEditing) {
		return (
			<Dialog open={open} onClose={handleCloseEdit} maxWidth="xl" fullWidth>
				<CreateQuestionForm question={question} onClose={handleCloseEdit} />
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						sx={{
							bgcolor: "primary.main",
							width: 40,
							height: 40,
						}}
					>
						<QuestionIcon />
					</Avatar>
					<Box sx={{ flexGrow: 1 }}>
						<Typography variant="h6" fontWeight="bold">
							{t("questions.questionDetails")}
						</Typography>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
						>
							{React.cloneElement(typeInfo.icon, {
								color: typeInfo.color,
								fontSize: "small",
							})}
							<Typography variant="body2" color="text.secondary">
								{typeInfo.label}
							</Typography>
						</Box>
					</Box>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ p: 4 }}>
				<Stack spacing={4}>
					{/* Question Content */}
					<Box>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							{t("navbar.questions")}
						</Typography>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								bgcolor: "background.elevated",
								borderRadius: 2,
							}}
						>
							<Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
								{question.body || "No question text provided"}
							</Typography>
						</Paper>
					</Box>

					{/* Academic Information */}
					<Box>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							{t("questions.academicInformation")}
						</Typography>
						<Stack direction="row" spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									gutterBottom
								>
									Grade Levels
								</Typography>
								<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
									{grades.length > 0 ? (
										grades.map((grade, index) => (
											<Chip
												key={`grade-${grade}-${index}`}
												label={grade}
												size="small"
												variant="outlined"
												color="primary"
											/>
										))
									) : (
										<Typography variant="body2" color="text.secondary">
											No grades assigned
										</Typography>
									)}
								</Box>
							</Box>
							<Box>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									gutterBottom
								>
									Subjects
								</Typography>
								<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
									{subjects.length > 0 ? (
										subjects.map((subject, index) => (
											<Chip
												key={`subject-${subject}-${index}`}
												label={subject}
												size="small"
												variant="outlined"
												color="secondary"
											/>
										))
									) : (
										<Typography variant="body2" color="text.secondary">
											No subjects assigned
										</Typography>
									)}
								</Box>
							</Box>
							<Box>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									gutterBottom
								>
									Difficulty
								</Typography>
								<Chip
									label={question.difficulty || "Medium"}
									size="small"
									color="info"
									sx={{ textTransform: "capitalize" }}
								/>
							</Box>
						</Stack>
					</Box>

					{/* Answer Options or Grading Guidelines */}
					{question.isTextAnswer ? (
						<Box>
							<Typography variant="h6" fontWeight="bold" gutterBottom>
								Grading Guidelines
							</Typography>
							<Paper
								variant="outlined"
								sx={{
									p: 3,
									bgcolor: "background.elevated",
									borderRadius: 2,
								}}
							>
								<Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
									{question.gradingGuidelines ||
										"No grading guidelines provided"}
								</Typography>
							</Paper>
						</Box>
					) : (
						<Box>
							<Typography variant="h6" fontWeight="bold" gutterBottom>
								Answer Options
							</Typography>
							<Stack spacing={2}>
								{question.answers && question.answers.length > 0 ? (
									question.answers.map((answer, index) => (
										<Paper
											key={`answer-${answer._id || index}-${
												answer.body?.slice(0, 20) || "empty"
											}`}
											variant="outlined"
											sx={{
												p: 2,
												bgcolor: answer.isCorrect
													? "success.light"
													: "background.elevated",
												borderColor: answer.isCorrect
													? "success.main"
													: "divider",
												borderRadius: 2,
											}}
										>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 2 }}
											>
												<Typography
													variant="body2"
													fontWeight="bold"
													sx={{
														minWidth: 24,
														height: 24,
														borderRadius: "50%",
														bgcolor: answer.isCorrect
															? "success.main"
															: "grey.300",
														color: answer.isCorrect
															? "white"
															: "text.secondary",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													{String.fromCharCode(65 + index)}
												</Typography>
												<Typography variant="body1" sx={{ flexGrow: 1 }}>
													{answer.body}
												</Typography>
												{answer.isCorrect && (
													<Chip
														label="Correct"
														size="small"
														color="success"
														variant="filled"
													/>
												)}
											</Box>
										</Paper>
									))
								) : (
									<Typography variant="body2" color="text.secondary">
										No answer options provided
									</Typography>
								)}
							</Stack>
						</Box>
					)}
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Stack direction="row" spacing={2} sx={{ width: "100%" }}>
					<Button onClick={onClose} color="inherit" size="large">
						Close
					</Button>
					<Box sx={{ flexGrow: 1 }} />
					<Button
						onClick={handleCopyAsNew}
						startIcon={<CopyIcon />}
						variant="outlined"
						size="large"
					>
						Copy as New
					</Button>
					<Button
						onClick={handleEdit}
						startIcon={<EditIcon />}
						variant="contained"
						size="large"
					>
						Edit Question
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};

QuestionViewDialog.propTypes = {
	question: PropTypes.object,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onCopyAsNew: PropTypes.func.isRequired,
};

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({
	open,
	onClose,
	onConfirm,
	itemType,
	itemTitle,
}) => {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						sx={{
							bgcolor: "error.main",
							width: 40,
							height: 40,
						}}
					>
						<WarningIcon />
					</Avatar>
					<Box>
						<Typography variant="h6" fontWeight="bold">
							Delete {itemType}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							This action cannot be undone
						</Typography>
					</Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					Are you sure you want to delete this {itemType.toLowerCase()}?
				</Typography>
				{itemTitle && (
					<Paper
						variant="outlined"
						sx={{
							p: 2,
							mt: 2,
							bgcolor: "background.elevated",
							borderRadius: 2,
						}}
					>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							{itemType} to be deleted:
						</Typography>
						<Typography variant="body1" fontWeight="medium">
							{itemTitle}
						</Typography>
					</Paper>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button onClick={onClose} color="inherit" size="large">
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					color="error"
					variant="contained"
					size="large"
					startIcon={<DeleteIcon />}
				>
					Delete {itemType}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

DeleteConfirmationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	itemType: PropTypes.string.isRequired,
	itemTitle: PropTypes.string,
};

export default function QuestionsList({
	filters = {
		grades: [],
		subjects: [],
		type: "",
	},
	onCopyAsNew,
}) {
	const { t } = useTranslation();
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [questionToDelete, setQuestionToDelete] = useState(null);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const queryClient = useQueryClient();

	// Add delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteQuestion,
		onSuccess: () => {
			// Invalidate and refetch questions
			queryClient.invalidateQueries({ queryKey: ["questions"] });
		},
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["questions", page, limit, filters],
		queryFn: () => {
			// Extract grade and subject filters for backend
			const backendFilters = {
				grades: filters.grades || [],
				subjects: filters.subjects || [],
			};

			return getQuestions(page, limit, backendFilters);
		},
		select: (data) => {
			console.log("data", data);
			let filtered = data.data;

			// Only apply type filtering on client side since backend doesn't handle it
			if (filters && filters.type && filters.type !== "") {
				filtered = filtered.filter((question) => {
					const matchesType =
						(filters.type === "single" &&
							!question.isMultiAnswer &&
							!question.isTextAnswer) ||
						(filters.type === "multiple" && question.isMultiAnswer) ||
						(filters.type === "text" && question.isTextAnswer);

					return matchesType;
				});
			}

			return {
				data: filtered,
				pagination: data.pagination,
			};
		},
	});

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	const handleDeleteQuestion = async (questionId) => {
		try {
			await deleteMutation.mutateAsync(questionId);
		} catch (error) {
			console.error("Error deleting question:", error);
		}
	};

	// Function to get type icon and color
	const getTypeIcon = (question) => {
		if (question.isTextAnswer) {
			return {
				icon: <TextFieldsIcon />,
				color: "success",
				label: "Text Answer",
			};
		} else if (question.isMultiAnswer) {
			return {
				icon: <CheckBoxIcon />,
				color: "warning",
				label: "Multiple Choice",
			};
		} else {
			return {
				icon: <RadioButtonCheckedIcon />,
				color: "info",
				label: "Single Choice",
			};
		}
	};

	// Function to truncate text
	const truncateText = (text, maxLength = 50) => {
		if (!text) return "No question text";
		return text.length > maxLength
			? `${text.substring(0, maxLength)}...`
			: text;
	};

	// Function to safely get grades and subjects
	const getGradesAndSubjects = (question) => {
		if (!question.gradeSubjects || !Array.isArray(question.gradeSubjects)) {
			return { grades: [], subjects: [] };
		}

		const grades = question.gradeSubjects
			.filter((gs) => gs.grade)
			.map((gs) => gs.grade.name || gs.grade._id || "Unknown")
			.filter(Boolean);

		const subjects = question.gradeSubjects
			.filter((gs) => gs.subject)
			.map((gs) => gs.subject.name || gs.subject._id || "Unknown")
			.filter(Boolean);

		return { grades: [...new Set(grades)], subjects: [...new Set(subjects)] };
	};

	const renderQuestionDetails = () => {
		if (!selectedQuestion) return null;

		return (
			<QuestionViewDialog
				question={selectedQuestion}
				open={viewDialogOpen}
				onClose={() => setViewDialogOpen(false)}
				onCopyAsNew={onCopyAsNew}
			/>
		);
	};

	const TypeLegend = () => (
		<Paper
			sx={{
				p: 2,
				mb: 2,
				bgcolor: (theme) =>
					theme.palette.mode === "dark"
						? theme.palette.grey[900]
						: theme.palette.background.paper,
				border: 1,
				borderColor: "divider",
			}}
		>
			<Typography
				variant="subtitle2"
				sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
			>
				Question Type Legend:
			</Typography>
			<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					<RadioButtonCheckedIcon color="info" fontSize="small" />
					<Typography variant="body2" sx={{ color: "text.primary" }}>
						Single Choice
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					<CheckBoxIcon color="warning" fontSize="small" />
					<Typography variant="body2" sx={{ color: "text.primary" }}>
						Multiple Choice
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					<TextFieldsIcon color="success" fontSize="small" />
					<Typography variant="body2" sx={{ color: "text.primary" }}>
						Text Answer
					</Typography>
				</Box>
			</Box>
		</Paper>
	);

	return (
		<Box>
			<TypeLegend />

			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error" sx={{ mb: 2 }}>
					Error loading questions: {error.message}
				</Alert>
			) : (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t("navbar.questions")}</TableCell>
								<TableCell>{t("common.type")}</TableCell>
								<TableCell>{t("questions.gradeLevels")}</TableCell>
								<TableCell>{t("questions.subjects")}</TableCell>
								<TableCell align="right">{t("common.actions")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.data?.map((question) => {
								const typeInfo = getTypeIcon(question);
								const { grades, subjects } = getGradesAndSubjects(question);

								return (
									<TableRow
										key={question._id}
										onClick={() => {
											setSelectedQuestion(question);
											setViewDialogOpen(true);
										}}
										sx={{
											cursor: "pointer",
											transition: "all 0.2s ease-in-out",
											"&:hover": {
												backgroundColor: (theme) =>
													theme.palette.mode === "dark"
														? "rgba(255, 255, 255, 0.08)"
														: "rgba(0, 0, 0, 0.04)",
												transform: "translateY(-1px)",
												boxShadow: (theme) => theme.shadows[2],
											},
											"&:active": {
												transform: "translateY(0px)",
											},
										}}
									>
										<TableCell>
											<Tooltip
												title={question.body || "No question text"}
												arrow
											>
												<Typography variant="body2">
													{truncateText(question.body)}
												</Typography>
											</Tooltip>
										</TableCell>
										<TableCell>
											<Tooltip title={typeInfo.label} arrow>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													{React.cloneElement(typeInfo.icon, {
														color: typeInfo.color,
													})}
												</Box>
											</Tooltip>
										</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
												{grades.length > 0 ? (
													grades.map((grade, index) => (
														<Chip
															key={`table-grade-${grade}-${index}`}
															label={grade}
															size="small"
															variant="outlined"
														/>
													))
												) : (
													<Typography variant="body2" color="text.secondary">
														No grades
													</Typography>
												)}
											</Box>
										</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
												{subjects.length > 0 ? (
													subjects.map((subject, index) => (
														<Chip
															key={`table-subject-${subject}-${index}`}
															label={subject}
															size="small"
															variant="outlined"
															color="primary"
														/>
													))
												) : (
													<Typography variant="body2" color="text.secondary">
														No subjects
													</Typography>
												)}
											</Box>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Delete">
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation(); // Prevent row click
														setQuestionToDelete(question);
														setDeleteDialogOpen(true);
													}}
													sx={{
														color: "error.main",
														"&:hover": {
															backgroundColor: "error.light",
															color: "error.contrastText",
														},
													}}
												>
													<DeleteIcon />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* Pagination controls */}
			<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
				<Pagination
					count={data?.pagination?.pages || 1}
					page={page}
					onChange={handlePageChange}
					color="primary"
				/>
			</Box>

			{renderQuestionDetails()}

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={() => {
					handleDeleteQuestion(questionToDelete._id);
					setDeleteDialogOpen(false);
				}}
				itemType="Question"
				itemTitle={questionToDelete?.body}
			/>
		</Box>
	);
}

QuestionsList.propTypes = {
	filters: PropTypes.shape({
		grades: PropTypes.arrayOf(PropTypes.string),
		subjects: PropTypes.arrayOf(PropTypes.string),
		type: PropTypes.string,
	}),
	onCopyAsNew: PropTypes.func.isRequired,
};

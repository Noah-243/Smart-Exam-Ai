/**
 * QuestionSelectionDialog Component
 *
 * This component provides a full-screen dialog interface for selecting multiple questions to include in a test.
 * 
 * Features:
 * - Filters questions by selected grade and subject
 * - Allows toggling filters on/off
 * - Displays questions in a table with checkboxes for selection
 * - Enables bulk selection and clearing
 * - Option to assign points per question individually or in bulk
 * - Shows summary of selected questions and total points
 * 
 * Props:
 * @param {boolean} open - Whether the dialog is open
 * @param {Function} onClose - Callback to close the dialog
 * @param {Function} onSelectQuestion - Callback with the selected questions and their points
 * @param {string} selectedGrade - The ID of the selected grade to filter questions
 * @param {string} selectedSubject - The ID of the selected subject to filter questions
 *
 * Internal State:
 * - useFilters: Toggle whether to filter by grade/subject
 * - selectedQuestions: Map of selected question IDs to question objects and assigned points
 * - bulkPoints: Number of points to assign when using bulk mode
 * - useBulkPoints: Toggle for applying the same point value to all selected questions
 * - showPointsConfig: Toggle for showing the points configuration panel
 *
 * Key Functions:
 * - handleQuestionToggle: Select/deselect an individual question
 * - handleSelectAll / handleClearAll: Bulk selection actions
 * - handlePointsChange: Change individual question's point value
 * - handleBulkPointsChange: Update all selected questions with bulk point value
 * - handleUseBulkPointsChange: Enable/disable bulk points mode
 * - handleConfirm: Finalize selection and trigger `onSelectQuestion`
 * - getQuestionSummary: Utility to format display data (type, subjects, grades)
 *
 * External Libraries:
 * - MUI: For UI components and styling
 * - React Query: To fetch all available questions
 * - PropTypes: For prop validation
 *
 * Usage:
 * ```jsx
 * <QuestionSelectionDialog
 *   open={isDialogOpen}
 *   onClose={handleClose}
 *   onSelectQuestion={addQuestionsToTest}
 *   selectedGrade="grade_id"
 *   selectedSubject="subject_id"
 * />
 * ```
 */

import { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Paper,
	TextField,
	FormControlLabel,
	Switch,
	Chip,
	Tooltip,
	Checkbox,
	Alert,
	Stack,
	Collapse,
} from "@mui/material";
import {
	SelectAll as SelectAllIcon,
	ClearAll as ClearAllIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "../../api/questions";
import PropTypes from "prop-types";

export default function QuestionSelectionDialog({
	open,
	onClose,
	onSelectQuestion,
	selectedGrade,
	selectedSubject,
}) {
	const [useFilters, setUseFilters] = useState(true);
	const [selectedQuestions, setSelectedQuestions] = useState(new Map());
	const [bulkPoints, setBulkPoints] = useState(10);
	const [useBulkPoints, setUseBulkPoints] = useState(true);
	const [showPointsConfig, setShowPointsConfig] = useState(false);

	const { data: questions } = useQuery({
		queryKey: ["questions"],
		queryFn: getQuestions,
		select: (data) => {
			if (!useFilters || !selectedGrade || !selectedSubject) {
				return data.data;
			}
			return data.data.filter(
				(q) =>
					q.grades?.some((g) => g._id === selectedGrade) &&
					q.subjects?.some((s) => s._id === selectedSubject)
			);
		},
	});

	const handleQuestionToggle = (question) => {
		setSelectedQuestions((prev) => {
			const newMap = new Map(prev);
			if (newMap.has(question._id)) {
				newMap.delete(question._id);
			} else {
				newMap.set(question._id, {
					question,
					points: useBulkPoints ? bulkPoints : 10,
				});
			}
			return newMap;
		});
	};

	const handleSelectAll = () => {
		if (!questions) return;

		const newMap = new Map();
		questions.forEach((question) => {
			newMap.set(question._id, {
				question,
				points: useBulkPoints ? bulkPoints : 10,
			});
		});
		setSelectedQuestions(newMap);
	};

	const handleClearAll = () => {
		setSelectedQuestions(new Map());
	};

	const handlePointsChange = (questionId, points) => {
		setSelectedQuestions((prev) => {
			const newMap = new Map(prev);
			const existing = newMap.get(questionId);
			if (existing) {
				newMap.set(questionId, {
					...existing,
					points: Number(points) || 0,
				});
			}
			return newMap;
		});
	};

	const handleBulkPointsChange = (points) => {
		setBulkPoints(Number(points) || 0);
		if (useBulkPoints) {
			setSelectedQuestions((prev) => {
				const newMap = new Map();
				prev.forEach((value, key) => {
					newMap.set(key, {
						...value,
						points: Number(points) || 0,
					});
				});
				return newMap;
			});
		}
	};

	const handleUseBulkPointsChange = (checked) => {
		setUseBulkPoints(checked);
		if (checked) {
			// Apply bulk points to all selected questions
			setSelectedQuestions((prev) => {
				const newMap = new Map();
				prev.forEach((value, key) => {
					newMap.set(key, {
						...value,
						points: bulkPoints,
					});
				});
				return newMap;
			});
		}
	};

	const handleConfirm = () => {
		if (selectedQuestions.size > 0) {
			const questionsToAdd = Array.from(selectedQuestions.values());
			onSelectQuestion(questionsToAdd);
			onClose();
			// Reset state
			setSelectedQuestions(new Map());
			setShowPointsConfig(false);
		}
	};

	const handleClose = () => {
		setSelectedQuestions(new Map());
		setShowPointsConfig(false);
		onClose();
	};

	const getQuestionSummary = (question) => {
		const summary = {
			type: question.isTextAnswer
				? "Text Answer"
				: question.isMultiAnswer
				? "Multiple Choice (Multiple Answers)"
				: "Multiple Choice (Single Answer)",
			grades:
				question.grades?.map((g) => g.name).join(", ") || "No grades assigned",
			subjects:
				question.subjects?.map((s) => s.name).join(", ") ||
				"No subjects assigned",
			answerCount: question.answers?.length || 0,
		};
		return summary;
	};

	const selectedCount = selectedQuestions.size;
	const totalPoints = Array.from(selectedQuestions.values()).reduce(
		(sum, item) => sum + (item.points || 0),
		0
	);

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
			<DialogTitle>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">Select Questions</Typography>
					<Box display="flex" gap={1}>
						<Button
							startIcon={<SelectAllIcon />}
							onClick={handleSelectAll}
							size="small"
							disabled={!questions?.length}
						>
							Select All
						</Button>
						<Button
							startIcon={<ClearAllIcon />}
							onClick={handleClearAll}
							size="small"
							disabled={selectedCount === 0}
						>
							Clear All
						</Button>
					</Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
					{/* Selection Summary */}
					{selectedCount > 0 && (
						<Alert severity="info" sx={{ mb: 2 }}>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
							>
								<Typography variant="body2">
									<strong>{selectedCount}</strong> question
									{selectedCount !== 1 ? "s" : ""} selected
								</Typography>
								<Typography variant="body2">
									Total Points: <strong>{totalPoints}</strong>
								</Typography>
							</Box>
						</Alert>
					)}

					{/* Controls */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<FormControlLabel
							control={
								<Switch
									checked={useFilters}
									onChange={(e) => setUseFilters(e.target.checked)}
								/>
							}
							label="Use Grade/Subject Filters"
						/>

						{selectedCount > 0 && (
							<Button
								endIcon={
									showPointsConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />
								}
								onClick={() => setShowPointsConfig(!showPointsConfig)}
								size="small"
							>
								Points Configuration
							</Button>
						)}
					</Box>

					{/* Points Configuration */}
					<Collapse in={showPointsConfig && selectedCount > 0}>
						<Paper sx={{ p: 3, mb: 2 }}>
							<Typography variant="subtitle1" gutterBottom>
								Points Configuration
							</Typography>
							<Stack spacing={2}>
								<FormControlLabel
									control={
										<Switch
											checked={useBulkPoints}
											onChange={(e) =>
												handleUseBulkPointsChange(e.target.checked)
											}
										/>
									}
									label="Use same points for all selected questions"
								/>

								{useBulkPoints && (
									<TextField
										label="Points per question"
										type="number"
										value={bulkPoints}
										onChange={(e) => handleBulkPointsChange(e.target.value)}
										inputProps={{ min: 0, max: 100 }}
										helperText={`Will assign ${bulkPoints} points to each of the ${selectedCount} selected questions`}
										sx={{ maxWidth: 300 }}
									/>
								)}

								{!useBulkPoints && (
									<Alert severity="info">
										You can set individual points for each question in the table
										below
									</Alert>
								)}
							</Stack>
						</Paper>
					</Collapse>

					{/* Questions Table */}
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell padding="checkbox">
										<Checkbox
											indeterminate={
												selectedCount > 0 &&
												selectedCount < (questions?.length || 0)
											}
											checked={
												selectedCount > 0 &&
												selectedCount === (questions?.length || 0)
											}
											onChange={(e) => {
												if (e.target.checked) {
													handleSelectAll();
												} else {
													handleClearAll();
												}
											}}
										/>
									</TableCell>
									<TableCell>Question</TableCell>
									<TableCell>Details</TableCell>
									{!useBulkPoints && selectedCount > 0 && (
										<TableCell align="center">Points</TableCell>
									)}
								</TableRow>
							</TableHead>
							<TableBody>
								{questions?.map((question) => {
									const summary = getQuestionSummary(question);
									const isSelected = selectedQuestions.has(question._id);
									const selectedData = selectedQuestions.get(question._id);

									return (
										<TableRow
											key={question._id}
											sx={{
												backgroundColor: isSelected
													? "rgba(25, 118, 210, 0.08)"
													: "inherit",
												"&:hover": {
													backgroundColor: isSelected
														? "rgba(25, 118, 210, 0.12)"
														: "rgba(0, 0, 0, 0.04)",
												},
											}}
										>
											<TableCell padding="checkbox">
												<Checkbox
													checked={isSelected}
													onChange={() => handleQuestionToggle(question)}
												/>
											</TableCell>
											<TableCell>
												<Tooltip title={question.body}>
													<Typography
														sx={{
															fontWeight: isSelected ? "medium" : "normal",
														}}
													>
														{question.body?.length > 100
															? `${question.body.substring(0, 100)}...`
															: question.body}
													</Typography>
												</Tooltip>
											</TableCell>
											<TableCell>
												<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
													<Chip
														label={summary.type}
														size="small"
														color="primary"
													/>
													<Tooltip title={`Grades: ${summary.grades}`}>
														<Chip
															label={`${question.grades?.length || 0} Grade${
																(question.grades?.length || 0) !== 1 ? "s" : ""
															}`}
															size="small"
														/>
													</Tooltip>
													<Tooltip title={`Subjects: ${summary.subjects}`}>
														<Chip
															label={`${
																question.subjects?.length || 0
															} Subject${
																(question.subjects?.length || 0) !== 1
																	? "s"
																	: ""
															}`}
															size="small"
														/>
													</Tooltip>
													<Chip
														label={`${summary.answerCount} Answer${
															summary.answerCount !== 1 ? "s" : ""
														}`}
														size="small"
													/>
												</Box>
											</TableCell>
											{!useBulkPoints && selectedCount > 0 && (
												<TableCell align="center">
													{isSelected ? (
														<TextField
															type="number"
															value={selectedData?.points || 0}
															onChange={(e) =>
																handlePointsChange(question._id, e.target.value)
															}
															inputProps={{ min: 0, max: 100 }}
															size="small"
															sx={{ width: 80 }}
														/>
													) : (
														<Typography variant="body2" color="text.secondary">
															-
														</Typography>
													)}
												</TableCell>
											)}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>

					{questions?.length === 0 && (
						<Alert severity="warning">
							No questions found.{" "}
							{useFilters ? "Try adjusting your filters or " : ""}
							Create some questions first to add them to your test.
						</Alert>
					)}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancel</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					disabled={selectedCount === 0}
				>
					Add {selectedCount} Question{selectedCount !== 1 ? "s" : ""}
					{selectedCount > 0 && ` (${totalPoints} points)`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

QuestionSelectionDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSelectQuestion: PropTypes.func.isRequired,
	selectedGrade: PropTypes.string,
	selectedSubject: PropTypes.string,
};

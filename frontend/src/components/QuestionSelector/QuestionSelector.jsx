/**
 * QuestionSelector Component
 *
 * A table interface for selecting and assigning points to questions for a test.
 * It supports optional filtering by selected grade and subject, and shows the total
 * number of points assigned to selected questions.
 *
 * Props:
 * @param {string} selectedGrade - The ID of the grade to filter questions by (if filters are enabled)
 * @param {string} selectedSubject - The ID of the subject to filter questions by (if filters are enabled)
 * @param {Function} onQuestionsSelect - Callback that returns the list of selected questions with points
 * @param {Array} initialQuestions - Array of initially selected questions with `_id` and optional `points`
 *
 * Internal State:
 * - selectedQuestions: Array of selected question objects with points
 * - useFilters: Boolean toggle for enabling grade/subject filters
 *
 * Data Fetching:
 * - Uses React Query to fetch all available questions using `getQuestions`
 * - Applies filtering logic if filters are enabled
 *
 * Key Functions:
 * - handleQuestionToggle: Toggles selection of a question
 * - handlePointsChange: Updates point value for a specific selected question
 * - useEffect: Calls `onQuestionsSelect` whenever `selectedQuestions` changes
 * - getQuestionSummary: Returns metadata about a question (type, grades, subjects, answers)
 *
 * UI:
 * - Displays a table of all (or filtered) questions
 * - Includes checkboxes for selection and point inputs
 * - Shows color-coded chips with question metadata
 * - Highlights total assigned points with color (green for 100, red otherwise)
 *
 * Dependencies:
 * - React, MUI (Material UI), React Query
 */

import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Checkbox,
	TextField,
	Paper,
	Button,
	FormControlLabel,
	Switch,
	Chip,
	Tooltip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "../../api/questions";

export default function QuestionSelector({
	selectedGrade,
	selectedSubject,
	onQuestionsSelect,
	initialQuestions = [],
}) {
	const [selectedQuestions, setSelectedQuestions] = useState(
		initialQuestions.map((q) => ({
			...q,
			points: q.points || 0,
		}))
	);
	const [useFilters, setUseFilters] = useState(false);

	const { data: questions } = useQuery({
		queryKey: ["questions"],
		queryFn: getQuestions,
		select: (data) => {
			if (!useFilters || !selectedGrade || !selectedSubject) {
				return data.data;
			}
			return data.data.filter(
				(q) =>
					q.grades.includes(selectedGrade) &&
					q.subjects.includes(selectedSubject)
			);
		},
	});

	const handleQuestionToggle = (question) => {
		setSelectedQuestions((prev) => {
			const exists = prev.find((q) => q._id === question._id);
			if (exists) {
				return prev.filter((q) => q._id !== question._id);
			}
			return [
				...prev,
				{
					_id: question._id, // Store the question ID
					points: 0,
				},
			];
		});
	};

	const handlePointsChange = (questionId, points) => {
		setSelectedQuestions((prev) =>
			prev.map((q) =>
				q._id === questionId ? { ...q, points: Number(points) } : q
			)
		);
	};

	useEffect(() => {
		onQuestionsSelect(selectedQuestions);
	}, [selectedQuestions]);

	const totalPoints = selectedQuestions.reduce(
		(sum, q) => sum + (q.points || 0),
		0
	);

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

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography variant="h6">Select Questions</Typography>
				<FormControlLabel
					control={
						<Switch
							checked={useFilters}
							onChange={(e) => setUseFilters(e.target.checked)}
						/>
					}
					label="Use Grade/Subject Filters"
				/>
			</Box>
			<Typography
				color={totalPoints === 100 ? "success.main" : "error.main"}
				gutterBottom
			>
				Total Points: {totalPoints}/100
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">Select</TableCell>
							<TableCell>Question</TableCell>
							<TableCell>Details</TableCell>
							<TableCell align="right">Points</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{questions?.map((question) => {
							const summary = getQuestionSummary(question);
							return (
								<TableRow key={question._id}>
									<TableCell padding="checkbox">
										<Checkbox
											checked={selectedQuestions.some(
												(q) => q._id === question._id
											)}
											onChange={() => handleQuestionToggle(question)}
										/>
									</TableCell>
									<TableCell>
										<Tooltip title={question.body}>
											<Typography>
												{question.body.length > 100
													? `${question.body.substring(0, 100)}...`
													: question.body}
											</Typography>
										</Tooltip>
									</TableCell>
									<TableCell>
										<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
											<Chip label={summary.type} size="small" color="primary" />
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
													label={`${question.subjects?.length || 0} Subject${
														(question.subjects?.length || 0) !== 1 ? "s" : ""
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
									<TableCell align="right">
										{selectedQuestions.some((q) => q._id === question._id) && (
											<TextField
												type="number"
												size="small"
												value={
													selectedQuestions.find((q) => q._id === question._id)
														?.points || 0
												}
												onChange={(e) =>
													handlePointsChange(question._id, e.target.value)
												}
												inputProps={{
													min: 0,
													max: 100,
												}}
											/>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}

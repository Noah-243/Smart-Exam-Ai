/**
 * EditTestForm.js
 *
 * This component allows users (typically teachers or admins) to edit an existing test.
 * It displays a dialog containing form fields to update the test's title, description,
 * grade, subject, list of questions, and comments.
 *
 *  Data Initialization:
 * - Uses `useState` to store form data and errors.
 * - Initializes `testData` from the passed `test` prop (title, description, grade, subject, questions).
 *
 *  Data Fetching:
 * - `useQuery` is used to fetch the list of grades and subjects from the server.
 *
 *  Data Mutation:
 * - Uses `useMutation` to update the test using the `updateTest` API function.
 * - On success: invalidates the test list and calls `onClose`.
 *
 *  Validation:
 * - Ensures total question points add up to exactly 100.
 *
 *  Props:
 * @param {Object} test - The test object being edited. Should include fields like title, description, grade, subject, questions, and comments.
 * @param {Function} onClose - Callback function that is called when the dialog is closed or update is successful.
 *
 *  Dependencies:
 * - React, Material UI, React Query, dayjs
 * - `QuestionSelector` component is used to manage and select test questions.
 *
 * Usage:
 * <EditTestForm test={selectedTest} onClose={() => setOpen(false)} />
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
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import { updateTest } from "../../api/tests";
import QuestionSelector from "../QuestionSelector/QuestionSelector";

/**
 * EditTestForm Component
 * Renders a form for editing an existing test including title, description,
 * grade, subject, questions, and comments.
 * Uses React Query for fetching and updating data.
 *
 * Props:
 * - test: the test object to edit (required)
 * - onClose: callback to close the form/dialog (required)
 */
export default function EditTestForm({ test, onClose }) {
	const queryClient = useQueryClient();
	const [testData, setTestData] = useState({
		title: test.title,
		description: test.description,
		grade: test.grade._id,
		subject: test.subject._id,
		questions: test.questions.map((q) => ({
			...q,
			points: q.points || 0,
		})),
		comments: test.comments || "",
	});
	const [error, setError] = useState("");

	const { data: grades } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	const { data: subjects } = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
	});

	const updateTestMutation = useMutation({
		mutationFn: (data) => updateTest(test._id, data),
		onSuccess: () => {
			queryClient.invalidateQueries(["tests"]);
			onClose();
		},
		onError: (error) => {
			setError(error.message);
		},
	});

	/**
	 * handleSubmit
	 * Validates that total question points equal 100,
	 * then triggers the mutation to update the test.
	 */
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

		updateTestMutation.mutate(testData);
	};

	/**
	 * handleQuestionSelect
	 * Updates the test's questions based on user selection.
	 */
	const handleQuestionSelect = (questions) => {
		setTestData((prev) => ({
			...prev,
			questions: questions,
		}));
	};

	return (
		<>
			<DialogTitle>Edit Test</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
					{error && <Alert severity="error">{error}</Alert>}
					<TextField
						label="Title"
						value={testData.title}
						onChange={(e) =>
							setTestData((prev) => ({
								...prev,
								title: e.target.value,
							}))
						}
						fullWidth
					/>
					<TextField
						label="Description"
						value={testData.description}
						onChange={(e) =>
							setTestData((prev) => ({
								...prev,
								description: e.target.value,
							}))
						}
						multiline
						rows={3}
						fullWidth
					/>
					<FormControl fullWidth>
						<InputLabel>Grade</InputLabel>
						<Select
							value={testData.grade}
							onChange={(e) =>
								setTestData((prev) => ({
									...prev,
									grade: e.target.value,
								}))
							}
							label="Grade"
						>
							{grades?.data?.map((grade) => (
								<MenuItem key={grade._id} value={grade._id}>
									{grade.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>Subject</InputLabel>
						<Select
							value={testData.subject}
							onChange={(e) =>
								setTestData((prev) => ({
									...prev,
									subject: e.target.value,
								}))
							}
							label="Subject"
						>
							{subjects?.data?.map((subject) => (
								<MenuItem key={subject._id} value={subject._id}>
									{subject.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						label="Comments"
						value={testData.comments}
						onChange={(e) =>
							setTestData((prev) => ({
								...prev,
								comments: e.target.value,
							}))
						}
						multiline
						rows={2}
						fullWidth
					/>
					<QuestionSelector
						selectedGrade={testData.grade}
						selectedSubject={testData.subject}
						onQuestionsSelect={handleQuestionSelect}
						initialQuestions={testData.questions}
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={updateTestMutation.isLoading}
				>
					Save Changes
				</Button>
			</DialogActions>
		</>
	);
}

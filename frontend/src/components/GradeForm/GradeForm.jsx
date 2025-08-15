/**
 * GradeForm Component
 *
 * Description:
 * This component renders a form inside a modal dialog used to either add a new grade
 * or edit an existing one. It supports both creation and updating of grade data via
 * React Query mutations.
 *
 * Props:
 * - open (boolean): Controls the visibility of the dialog.
 * - onClose (function): Callback to close the dialog.
 * - grade (object | null): If provided, the form will be in "edit mode"; otherwise, it will create a new grade.
 *
 * State:
 * - formData (object): Holds the form fields (name and level).
 * - error (string): Stores any error messages to display.
 *
 * Hooks Used:
 * - useState: To manage form data and errors.
 * - useEffect: To update form fields when the grade prop changes.
 * - useMutation (React Query): To submit the form to either create or update a grade.
 * - useQueryClient (React Query): To invalidate the cache after successful mutation.
 *
 * Behavior:
 * - If editing a grade, the form fields are pre-filled.
 * - If submitting an invalid form (missing name/level), an error is shown.
 * - On success, the dashboard query is invalidated and the dialog is closed.
 * - On failure, an error message is displayed.
 *
 * Libraries:
 * - React
 * - Material UI (MUI) for layout and UI components
 * - React Query for mutation and cache management
 */

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGrade, updateGrade } from "../../api/grades";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Alert,
	Box,
} from "@mui/material";

export default function GradeForm({ open, onClose, grade = null }) {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState({
		name: "",
		level: "",
	});
	const [error, setError] = useState("");

	useEffect(() => {
		if (grade) {
			setFormData({
				name: grade.name,
				level: grade.level,
			});
		} else {
			setFormData({
				name: "",
				level: "",
			});
		}
	}, [grade]);

	const { mutate: submitGrade, isLoading } = useMutation({
		mutationFn: (data) =>
			grade ? updateGrade(grade._id, data) : createGrade(data),
		onSuccess: () => {
			queryClient.invalidateQueries(["dashboard"]);
			onClose();
		},
		onError: (error) => {
			setError(error.response?.data?.error || "Error saving grade");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");

		if (!formData.name || !formData.level) {
			setError("Please fill in all required fields");
			return;
		}

		submitGrade({
			...formData,
			level: parseInt(formData.level),
		});
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{grade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
			<form onSubmit={handleSubmit}>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{error && <Alert severity="error">{error}</Alert>}
						<TextField
							name="name"
							label="Grade Name"
							value={formData.name}
							onChange={handleChange}
							required
							fullWidth
						/>
						<TextField
							name="level"
							label="Level"
							type="number"
							value={formData.level}
							onChange={handleChange}
							required
							fullWidth
							inputProps={{ min: 1, max: 12 }}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={isLoading}
					>
						{grade ? "Save Changes" : "Add Grade"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

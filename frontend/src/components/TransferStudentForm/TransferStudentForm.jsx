/**
 * TransferStudentForm Component
 *
 * Displays a dialog that allows admins to transfer a student from their current grade to another.
 * It uses React Query to fetch available grades and perform the transfer operation.
 *
 * Props:
 * - open (bool): Whether the dialog is open
 * - onClose (func): Function to close the dialog
 * - student (object): Student object with an _id field
 * - currentGradeId (string): ID of the student's current grade
 */

import { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGrades, transferStudent } from "../../api/grades";

export default function TransferStudentForm({
	open,
	onClose,
	student,
	currentGradeId,
}) {
	const [selectedGrade, setSelectedGrade] = useState("");
	const [error, setError] = useState("");
	const queryClient = useQueryClient();

	const { data: grades } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	const transferMutation = useMutation({
		mutationFn: () =>
			transferStudent(student._id, currentGradeId, selectedGrade),
		onSuccess: () => {
			queryClient.invalidateQueries(["grade", currentGradeId]);
			onClose();
		},
		onError: (error) => {
			setError(error.response?.data?.error || "Error transferring student");
		},
	});

	const handleSubmit = () => {
		if (!selectedGrade) {
			setError("Please select a grade");
			return;
		}
		transferMutation.mutate();
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Transfer Student</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<FormControl fullWidth sx={{ mt: 2 }}>
					<InputLabel>Select New Grade</InputLabel>
					<Select
						value={selectedGrade}
						onChange={(e) => setSelectedGrade(e.target.value)}
						label="Select New Grade"
					>
						{grades?.data
							.filter((grade) => grade._id !== currentGradeId)
							.map((grade) => (
								<MenuItem key={grade._id} value={grade._id}>
									{grade.name}
								</MenuItem>
							))}
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={transferMutation.isLoading}
				>
					Transfer
				</Button>
			</DialogActions>
		</Dialog>
	);
}

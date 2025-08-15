/**
 * AddStudentForm.jsx – Dialog Form for Adding a Student to a Grade
 *
 * This React component renders a modal dialog that allows teachers to add a new student
 * to a specific grade/class. It uses React state to manage form input and `react-query`
 * to handle the mutation request.
 *
 * Props:
 * - open (boolean): Controls whether the dialog is visible.
 * - onClose (function): Callback to close the dialog.
 * - gradeId (string): The ID of the grade to which the student should be added.
 *
 * Features:
 * - Input fields for name, email, and student ID.
 * - Validates that all fields are filled before submission.
 * - Sends a POST request via `addStudentToGrade()` using React Query's `useMutation`.
 * - Automatically invalidates the grade query on success to refresh data.
 * - Displays error messages from server or validation.
 *
 * Dependencies:
 * - @mui/material: For dialog UI components.
 * - @tanstack/react-query: For mutation and query invalidation.
 * - ../../api/grades: Contains the API call `addStudentToGrade`.
 */

// React hook for local state management
import { useState } from "react";

// Material UI components for building the dialog form
import {
	Dialog,             // Modal container
	DialogTitle,        // Header/title of the dialog
	DialogContent,      // Main body of the dialog
	DialogActions,      // Footer with buttons
	Button,             // Button component
	TextField,          // Input fields
	Alert,              // For displaying error messages
	Box,                // Layout component for spacing and flexbox
} from "@mui/material";

// React Query hooks for API interaction and cache control
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API function to add a student to a specific grade
import { addStudentToGrade } from "../../api/grades";

/**
 * AddStudentForm Component
 * This dialog allows a teacher to manually add a new student to a grade.
 * It contains input fields for student name, email, and student ID.
 * It uses a mutation to send data to the server and handles loading, success, and error states.
 *
 * Props:
 * - open (boolean): whether the dialog is currently open
 * - onClose (function): function to close the dialog
 * - gradeId (string): ID of the grade to which the student will be added
 */
export default function AddStudentForm({ open, onClose, gradeId }) {
	// Local form state to store input field values
	const [formData, setFormData] = useState({
		name: "",       // Full name of the student
		email: "",      // Email address
		studentId: "",  // Student ID number
	});

	// Local error state to display validation or server-side errors
	const [error, setError] = useState("");

	// Query client for cache management (e.g., invalidating after mutation)
	const queryClient = useQueryClient();

	// Mutation to add a new student to the grade
	const addStudentMutation = useMutation({
		// The function that performs the API call
		mutationFn: (data) => addStudentToGrade(gradeId, data),

		// What happens when the request is successful
		onSuccess: () => {
			// Refresh the specific grade's cached data
			queryClient.invalidateQueries(["grade", gradeId]);

			// Close the form and reset input fields
			onClose();
			setFormData({ name: "", email: "", studentId: "" });
		},

		// Handle errors returned from the API
		onError: (error) => {
			setError(error.response?.data?.error || "Error adding student");
		},
	});

	// Handle input field changes
	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value, // Update field by name
		}));
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission behavior

		// Validate all fields are filled
		if (!formData.name || !formData.email || !formData.studentId) {
			setError("Please fill in all fields");
			return;
		}

		// Trigger the mutation with form data
		addStudentMutation.mutate(formData);
	};

	// Render the modal form
	return (
		<Dialog open={open} onClose={onClose}>
			<form onSubmit={handleSubmit}>
				<DialogTitle>Add New Student</DialogTitle>

				<DialogContent>
					{/* Display error alert if an error exists */}
					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{/* Form fields for student input */}
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
						<TextField
							name="name"
							label="Full Name"
							value={formData.name}
							onChange={handleChange}
							fullWidth
							required
						/>
						<TextField
							name="email"
							label="Email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							fullWidth
							required
						/>
						<TextField
							name="studentId"
							label="Student ID"
							value={formData.studentId}
							onChange={handleChange}
							fullWidth
							required
						/>
					</Box>
				</DialogContent>

				<DialogActions>
					{/* Cancel button closes the dialog */}
					<Button onClick={onClose}>Cancel</Button>

					{/* Submit button sends the form data */}
					<Button
						type="submit"
						variant="contained"
						disabled={addStudentMutation.isLoading} // Disable while loading
					>
						Add Student
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

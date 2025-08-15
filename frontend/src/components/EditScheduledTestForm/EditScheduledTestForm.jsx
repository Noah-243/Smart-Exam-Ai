/**
 * EditScheduledTestForm.js
 *
 * This React component renders a dialog for editing a scheduled test.
 * It allows the user (usually a teacher or admin) to:
 * - View the existing test details (title, current scheduled date).
 * - Select a new date/time, grade, and duration.
 * - Submit the update via API with validation.
 *
 * Features:
 * - Preloads existing test data using useEffect.
 * - Fetches grades using React Query.
 * - Uses MUI DateTimePicker for date/time selection.
 * - Displays success/error alerts.
 * - Validates form inputs before submission.
 *
 * Props:
 * @param {Function} onClose - Callback to close the dialog.
 * @param {Object} scheduledTest - The test to edit, including current data.
 */

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import {
	Box,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getGrades } from "../../api/grades";
import { updateScheduledTest } from "../../api/scheduledTests";

/**
 * Main form component for editing an existing scheduled test.
 */
export default function EditScheduledTestForm({ onClose, scheduledTest }) {
	const queryClient = useQueryClient();

	// State to manage form input values
	const [formData, setFormData] = useState({
		scheduledAt: dayjs(), // default to now
		grade: "",
		duration: "",
	});

	// State for displaying feedback
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	/**
	 * Load the current scheduled test values into the form when component mounts.
	 */
	useEffect(() => {
		if (scheduledTest) {
			setFormData({
				scheduledAt: dayjs(scheduledTest.scheduledAt),
				grade: scheduledTest.grade?._id || "",
				duration: scheduledTest.duration || "",
			});
		}
	}, [scheduledTest]);

	/**
	 * Query to fetch grades from server
	 */
	const { data: grades, isLoading: gradesLoading } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	/**
	 * Mutation to update the test on the server.
	 */
	const updateMutation = useMutation({
		mutationFn: (data) => updateScheduledTest(scheduledTest._id, data),
		onSuccess: () => {
			// Refresh the list of scheduled tests
			queryClient.invalidateQueries({ queryKey: ["scheduledTests"] });
			setSuccess(true);
			// Close dialog after short delay
			setTimeout(() => {
				onClose();
			}, 1500);
		},
		onError: (error) => {
			console.error("Update scheduled test error:", error);
			setError(error.response?.data?.error || "Error updating scheduled test");
		},
	});

	/**
	 * Handles form submission with validation
	 */
	const handleSubmit = () => {
		setError("");
		setSuccess(false);

		// Basic validations
		if (!formData.scheduledAt) {
			setError("Please select a date and time");
			return;
		}
		if (!formData.grade) {
			setError("Please select a grade");
			return;
		}
		if (!formData.duration || formData.duration <= 0) {
			setError("Please enter a valid duration");
			return;
		}
		if (formData.scheduledAt.isBefore(dayjs())) {
			setError("Please select a future date and time");
			return;
		}

		// Prepare data to send
		const updateData = {
			...formData,
			scheduledAt: formData.scheduledAt.toISOString(),
			test: scheduledTest.test._id,      // keep original test
			teacher: scheduledTest.teacher._id // keep original teacher
		};

		updateMutation.mutate(updateData);
	};

	/**
	 * Handles standard text/number input changes
	 */
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	/**
	 * Handles change for DateTimePicker
	 */
	const handleDateChange = (newDate) => {
		setFormData({
			...formData,
			scheduledAt: newDate,
		});
	};

	// If no test is provided, render nothing
	if (!scheduledTest) {
		return null;
	}

	// Return the dialog UI
	return (
		<>
			<DialogTitle>Edit Scheduled Test</DialogTitle>
			<DialogContent>
				{/* Header with test title and original date */}
				<Box sx={{ mt: 2, mb: 3 }}>
					<Typography variant="h6">{scheduledTest.test.title}</Typography>
					<Typography variant="body2" color="text.secondary">
						Originally scheduled for{" "}
						{dayjs(scheduledTest.scheduledAt).format("MMM D, YYYY HH:mm")}
					</Typography>
				</Box>

				{/* Error alert if exists */}
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{/* Success alert after update */}
				{success && (
					<Alert severity="success" sx={{ mb: 2 }}>
						Scheduled test updated successfully!
					</Alert>
				)}

				{/* Date, grade, and duration form inputs */}
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3, my: 2 }}>
						{/* New date/time selection */}
						<DateTimePicker
							label="New Date & Time"
							value={formData.scheduledAt}
							onChange={handleDateChange}
							disablePast
							sx={{ width: "100%" }}
						/>

						{/* Grade selection */}
						<FormControl fullWidth>
							<InputLabel>Grade</InputLabel>
							<Select
								name="grade"
								value={formData.grade}
								onChange={handleChange}
								label="Grade"
							>
								{gradesLoading ? (
									<MenuItem disabled>Loading grades...</MenuItem>
								) : (
									grades?.data.map((grade) => (
										<MenuItem key={grade._id} value={grade._id}>
											{grade.name}
										</MenuItem>
									))
								)}
							</Select>
						</FormControl>

						{/* Duration input */}
						<TextField
							name="duration"
							label="Duration (minutes)"
							type="number"
							value={formData.duration}
							onChange={handleChange}
							fullWidth
							InputProps={{ inputProps: { min: 1 } }}
						/>
					</Box>
				</LocalizationProvider>
			</DialogContent>

			{/* Bottom action buttons */}
			<DialogActions>
				<Button onClick={onClose} disabled={updateMutation.isLoading}>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					disabled={updateMutation.isLoading || success}
				>
					{updateMutation.isLoading ? "Updating..." : "Save Changes"}
				</Button>
			</DialogActions>
		</>
	);
}

// Props validation
EditScheduledTestForm.propTypes = {
	onClose: PropTypes.func.isRequired,
	scheduledTest: PropTypes.object.isRequired,
};

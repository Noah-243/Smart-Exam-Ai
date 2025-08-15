/**
 * ScheduleTestForm.jsx
 *
 * This component provides a form for scheduling a new test.
 * It allows a teacher to:
 * - Choose a test from a list (dropdown)
 * - Set a scheduled date/time
 * - Choose multiple grades (for filtering/UX)
 * - Set test duration in minutes
 * 
 * Key Features:
 * - Uses React Query to fetch available grades and mutate the schedule
 * - Uses Day.js and MUI X DateTimePicker for time handling
 * - On submission, only the first selected grade is sent to the server (per backend requirement)
 * - Shows alerts for validation or backend errors
 * 
 * Props:
 * - `onClose` (function): Closes the form dialog
 * - `tests` (array): List of test objects available to schedule
 * 
 * Technologies:
 * - React Query (`useQuery`, `useMutation`)
 * - Axios (via `createScheduledTest` API call)
 * - MUI Components (Dialog, Select, Autocomplete, DateTimePicker)
 * - Context (`useUser`) for accessing logged-in teacher ID
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
	Autocomplete,
	Chip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getGrades } from "../../api/grades";
import { createScheduledTest } from "../../api/scheduledTests";
import { useUser } from "../../contexts/UserContext";

export default function ScheduleTestForm({ onClose, tests = [] }) {
	const { user } = useUser();
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState({
		test: "",
		scheduledAt: dayjs(),
		grades: [],
		duration: "",
	});
	const [error, setError] = useState("");

	// Find the selected test details when the test changes
	useEffect(() => {
		if (formData.test) {
			const selectedTest = tests.find((test) => test._id === formData.test);
			if (selectedTest) {
				setFormData((prev) => ({
					...prev,
					duration: selectedTest.duration || "",
				}));
			}
		}
	}, [formData.test, tests]);

	const { data: grades } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	const scheduleMutation = useMutation({
		mutationFn: createScheduledTest,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["scheduledTests"],
			});
			onClose();
		},
		onError: (error) => {
			console.error("Schedule test error:", error);
			setError(error.response?.data?.error || "Error scheduling test");
		},
	});

	const handleSubmit = () => {
		setError("");

		if (
			!formData.test ||
			!formData.scheduledAt ||
			!formData.grades.length ||
			!formData.duration
		) {
			setError("Please fill in all required fields");
			return;
		}

		// Use the first grade as the primary grade (backend requires a single grade)
		const primaryGrade = formData.grades[0];

		scheduleMutation.mutate({
			test: formData.test,
			scheduledAt: formData.scheduledAt,
			grade: primaryGrade._id,
			teacher: user._id, // Add the teacher ID from the logged-in user
			duration: parseInt(formData.duration), // Convert duration to integer
		});
	};

	return (
		<>
			<DialogTitle>Schedule New Test</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
					{error && <Alert severity="error">{error}</Alert>}
					<FormControl fullWidth>
						<InputLabel>Select Test</InputLabel>
						<Select
							value={formData.test}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, test: e.target.value }))
							}
							label="Select Test"
						>
							{tests.map((test) => (
								<MenuItem key={test._id} value={test._id}>
									{test.title}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<TextField
						label="Duration (minutes)"
						type="number"
						fullWidth
						value={formData.duration}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, duration: e.target.value }))
						}
						inputProps={{ min: 1 }}
					/>

					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DateTimePicker
							label="Schedule Date & Time"
							value={formData.scheduledAt}
							onChange={(newValue) =>
								setFormData((prev) => ({ ...prev, scheduledAt: newValue }))
							}
							minDateTime={dayjs(new Date())}
							slotProps={{ textField: { fullWidth: true } }}
						/>
					</LocalizationProvider>

					<Autocomplete
						multiple
						options={grades?.data || []}
						getOptionLabel={(option) => option.name}
						value={formData.grades}
						onChange={(_, newValue) =>
							setFormData((prev) => ({ ...prev, grades: newValue }))
						}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option.name}
									{...getTagProps({ index })}
									key={option._id}
								/>
							))
						}
						renderInput={(params) => (
							<TextField {...params} label="Select Grades" />
						)}
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={scheduleMutation.isLoading}
				>
					Schedule Test
				</Button>
			</DialogActions>
		</>
	);
}

ScheduleTestForm.propTypes = {
	onClose: PropTypes.func.isRequired,
	tests: PropTypes.array,
};

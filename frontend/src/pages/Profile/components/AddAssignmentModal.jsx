import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Autocomplete,
	TextField,
	Chip,
	Alert,
} from "@mui/material";
import {
	Add as AddIcon,
	Book as BookIcon,
	Class as ClassIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

export default function AddAssignmentModal({
	open,
	onClose,
	onAdd,
	newAssignment,
	setNewAssignment,
	subjects = [],
	grades = [],
}) {
	const [error, setError] = useState("");

	// Reset error when modal opens
	useEffect(() => {
		console.log("=== MODAL STATE CHANGE ===");
		console.log("Modal open:", open);
		if (open) {
			setError("");
		}
	}, [open]);

	const handleSubjectSelect = (subjectId) => {
		console.log("Subject selected:", subjectId);

		// Ensure we have a valid subjectId
		const validSubjectId = subjectId || "";

		setNewAssignment({
			...newAssignment,
			subject: validSubjectId,
		});
	};

	const handleGradesChange = (newGrades) => {
		console.log("handleGradesChange called with:", newGrades);

		// Extract IDs from grade objects
		const gradeIds = (newGrades || []).map((grade) => {
			const id = grade.id || grade._id || grade;
			console.log("Processing grade:", grade, "-> ID:", id);
			return id;
		});

		console.log("Final grade IDs:", gradeIds);

		setNewAssignment({
			...newAssignment,
			grades: gradeIds,
		});
	};

	const handleAdd = () => {
		setError("");

		// Check if data is still loading
		if (!subjects || subjects.length === 0) {
			setError("Subjects are still loading. Please wait a moment.");
			return;
		}

		if (!grades || grades.length === 0) {
			setError("Grades are still loading. Please wait a moment.");
			return;
		}

		// Validation
		if (!newAssignment.subject) {
			setError("Please select a subject");
			return;
		}

		if (!newAssignment.grades || newAssignment.grades.length === 0) {
			setError("Please select at least one grade");
			return;
		}

		console.log("Adding assignment:", newAssignment);
		console.log(
			"Subject type:",
			typeof newAssignment.subject,
			"Value:",
			newAssignment.subject
		);
		console.log(
			"Grades type:",
			typeof newAssignment.grades,
			"Value:",
			newAssignment.grades
		);
		console.log(
			"Grades array items:",
			newAssignment.grades?.map((g) => ({ type: typeof g, value: g }))
		);
		onAdd();
		onClose();
	};

	const handleClose = () => {
		setError("");
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Box display="flex" alignItems="center">
					<AddIcon sx={{ mr: 1 }} />
					<Typography variant="h5" fontWeight="bold">
						Add New Teaching Assignment
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					Select the subject you want to teach and the grades you&apos;ll teach
					it to.
				</Typography>

				<Grid container spacing={3}>
					{/* Subject Selection */}
					<Grid item xs={12}>
						<Typography variant="h6" gutterBottom>
							Subject
						</Typography>
						<FormControl fullWidth>
							<InputLabel>Subject</InputLabel>
							<Select
								value={
									newAssignment.subject === undefined ||
									newAssignment.subject === null
										? ""
										: newAssignment.subject
								}
								onChange={(e) => {
									console.log("Select onChange:", e.target.value);
									handleSubjectSelect(e.target.value);
								}}
								label="Subject"
								disabled={!subjects || subjects.length === 0}
							>
								{subjects && subjects.length > 0 ? (
									subjects.map((subject) => (
										<MenuItem
											key={subject.id || subject._id}
											value={subject.id || subject._id}
										>
											<Box display="flex" alignItems="center">
												<BookIcon sx={{ mr: 1 }} />
												{subject.name}
											</Box>
										</MenuItem>
									))
								) : (
									<MenuItem key="loading-subjects" disabled>
										<Typography color="text.secondary">
											Loading subjects...
										</Typography>
									</MenuItem>
								)}
							</Select>
						</FormControl>
					</Grid>

					{/* Grades Selection */}
					<Grid item xs={12}>
						<Typography variant="h6" gutterBottom>
							Grades
						</Typography>
						<Autocomplete
							multiple
							options={grades || []}
							getOptionLabel={(option) => option.name || "Unknown"}
							value={
								grades && grades.length > 0 && newAssignment.grades
									? grades.filter((grade) =>
											(newAssignment.grades || []).includes(
												grade.id || grade._id
											)
									  )
									: []
							}
							onChange={(_, newValue) => handleGradesChange(newValue)}
							disabled={!grades || grades.length === 0}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Select Grades"
									placeholder={
										grades && grades.length > 0
											? "Choose the grades you&apos;ll teach this subject to"
											: "Loading grades..."
									}
								/>
							)}
							renderTags={(value, getTagProps) =>
								value.map((option, tagIndex) => (
									<Chip
										key={tagIndex}
										label={option.name}
										{...getTagProps({ index: tagIndex })}
										icon={<ClassIcon />}
										color="primary"
									/>
								))
							}
						/>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ mt: 1, display: "block" }}
						>
							Select all the grades you want to teach this subject to.
						</Typography>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions sx={{ p: 3 }}>
				<Button onClick={handleClose} size="large">
					Cancel
				</Button>
				<Button
					onClick={handleAdd}
					variant="contained"
					disabled={
						!newAssignment.subject ||
						newAssignment.grades.length === 0 ||
						!subjects ||
						subjects.length === 0 ||
						!grades ||
						grades.length === 0
					}
					size="large"
					startIcon={<AddIcon />}
				>
					Add Assignment
				</Button>
			</DialogActions>
		</Dialog>
	);
}

AddAssignmentModal.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onAdd: PropTypes.func.isRequired,
	newAssignment: PropTypes.shape({
		subject: PropTypes.string,
		grades: PropTypes.arrayOf(PropTypes.string),
	}).isRequired,
	setNewAssignment: PropTypes.func.isRequired,
	subjects: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string,
			id: PropTypes.string,
			name: PropTypes.string,
		})
	),
	grades: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string,
			id: PropTypes.string,
			name: PropTypes.string,
		})
	),
};

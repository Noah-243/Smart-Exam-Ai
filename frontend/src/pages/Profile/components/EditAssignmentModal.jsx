import { useState, useEffect } from "react";
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
	Autocomplete,
	TextField,
	Chip,
	Box,
	Typography,
	Alert,
	Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Edit as EditIcon,
	Book as BookIcon,
	Class as ClassIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

export default function EditAssignmentModal({
	open,
	onClose,
	onSave,
	assignment,
	subjects = [],
	grades = [],
	getSubjectNameById,
	getGradeNameById,
}) {
	const theme = useTheme();
	const [editData, setEditData] = useState({
		subject: "",
		grades: [],
	});
	const [error, setError] = useState("");

	// Initialize edit data when modal opens
	useEffect(() => {
		if (open && assignment) {
			setEditData({
				subject:
					typeof assignment.subject === "object"
						? assignment.subject._id || ""
						: assignment.subject || "",
				grades: (assignment.grades || []).map((grade) =>
					typeof grade === "object" ? grade._id || grade : grade
				),
			});
			setError("");
		}
	}, [open, assignment]);

	const handleSubjectChange = (subjectId) => {
		setEditData((prev) => ({
			...prev,
			subject: subjectId,
		}));
	};

	const handleGradesChange = (newGrades) => {
		setEditData((prev) => ({
			...prev,
			grades: (newGrades || []).map((grade) => grade._id || grade.id || grade),
		}));
	};

	const handleSave = () => {
		setError("");

		if (!editData.subject) {
			setError("Please select a subject");
			return;
		}

		if (editData.grades.length === 0) {
			setError("Please select at least one grade");
			return;
		}

		onSave(editData);
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
					<EditIcon sx={{ mr: 1 }} />
					<Typography variant="h5" fontWeight="bold">
						Edit Teaching Assignment
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{/* Current Assignment Display */}
				<Box
					sx={{
						mb: 4,
						p: 3,
						bgcolor: theme.palette.background.elevated,
						borderRadius: 2,
					}}
				>
					<Typography variant="h6" gutterBottom color="primary">
						Current Assignment
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Typography variant="body1">
								<strong>Subject:</strong>{" "}
								{getSubjectNameById(assignment?.subject)}
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography variant="body1" component="div">
								<strong>Classes:</strong>
								<Box
									sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
								>
									{assignment?.grades?.map((gradeId, index) => (
										<Chip
											key={index}
											label={getGradeNameById(gradeId)}
											size="small"
											color="primary"
											variant="outlined"
										/>
									))}
								</Box>
							</Typography>
						</Grid>
					</Grid>
				</Box>

				{/* Edit Form */}
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<FormControl fullWidth>
							<InputLabel>Subject</InputLabel>
							<Select
								value={editData.subject || ""}
								onChange={(e) => handleSubjectChange(e.target.value)}
								label="Subject"
							>
								{subjects && subjects.length > 0 ? (
									subjects.map((subject) => (
										<MenuItem
											key={subject._id || subject.id}
											value={subject._id || subject.id}
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

					<Grid item xs={12}>
						<Autocomplete
							multiple
							options={grades || []}
							getOptionLabel={(option) => option.name || "Unknown"}
							value={
								grades && grades.length > 0 && editData.grades
									? grades.filter((grade) =>
											(editData.grades || []).includes(grade._id || grade.id)
									  )
									: []
							}
							onChange={(_, newValue) => handleGradesChange(newValue)}
							disabled={!grades || grades.length === 0}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Classes"
									placeholder={
										grades && grades.length > 0
											? "Select classes for this assignment"
											: "Loading grades..."
									}
								/>
							)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										key={index}
										label={option.name}
										{...getTagProps({ index })}
										icon={<ClassIcon />}
										color="primary"
									/>
								))
							}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions sx={{ p: 3 }}>
				<Button onClick={handleClose} size="large">
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					size="large"
					startIcon={<EditIcon />}
				>
					Update Assignment
				</Button>
			</DialogActions>
		</Dialog>
	);
}

EditAssignmentModal.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
	assignment: PropTypes.shape({
		subject: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				_id: PropTypes.string,
				name: PropTypes.string,
			}),
		]),
		grades: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.shape({
					_id: PropTypes.string,
					name: PropTypes.string,
				}),
			])
		),
	}),
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
	getSubjectNameById: PropTypes.func.isRequired,
	getGradeNameById: PropTypes.func.isRequired,
};

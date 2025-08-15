/**
 * AddUserForm.jsx – Modal Form for Creating a New User (Student / Teacher / Admin)
 *
 * Component Overview:
 *   This component renders a dynamic user creation form inside a Material-UI Dialog.
 *   It is used by administrators to create users with different roles, such as:
 * - Students (require name, email, password, grade)
 * - Teachers (require name, email, password, specialization, subject-grade assignments)
 * - Admins (require only basic details)
 *
 * Core Features:
 * - Controlled form using React useState
 * - Dynamic field rendering based on selected role
 * - Validation for required fields and role-specific rules
 * - Data fetching using React Query:
 *   → Grades for student assignment
 *   → Subjects for teacher assignment
 * - Teacher-specific logic for building a structured teachingAssignments array
 *   (each entry includes a subject and an array of grade IDs)
 * - Submission handled via useMutation to the createUser endpoint
 * - Auto-reset and UI update on success via queryClient.invalidateQueries
 *
 * State Variables:
 * - formData: stores all input values
 * - selectedSubjects: array of selected subjects for teachers
 * - selectedGrades: object mapping subject IDs to grade ID arrays
 * - error: holds validation or server error messages
 *
 * Dependencies:
 * - React, React Query, PropTypes
 * - @mui/material for UI elements
 * - createUser (POST), getGrades (GET), getSubjects (GET) API functions
 *
 * 👤 Props:
 * @param {boolean} open – whether the dialog is open
 * @param {Function} onClose – callback to close the dialog and reset the form
 *
 * Usage:
 * <AddUserForm open={isOpen} onClose={handleClose} />
 */


import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createUser } from "../../api/users";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import PropTypes from "prop-types";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	Box,
	Typography,
	Divider,
	Chip,
	FormHelperText,
	Grid,
	Autocomplete,
} from "@mui/material";

export default function AddUserForm({ open, onClose }) {
	const queryClient = useQueryClient();

	// Local form state
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "student",
		grade: "",
		specialization: "",
		teachingAssignments: [],
	});
	const [error, setError] = useState("");
	const [selectedSubjects, setSelectedSubjects] = useState([]);
	const [selectedGrades, setSelectedGrades] = useState({});

	/**
	 * Fetch grade options for students using React Query.
	 */
	const { data: gradesData, isLoading: gradesLoading } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
		staleTime: 60000,
	});

	/**
	 * Fetch subject options for teachers using React Query.
	 */
	const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
		staleTime: 60000,
	});

	const grades = gradesData?.data || [];
	const subjects = subjectsData?.data || [];

	/**
	 * useEffect – When role changes, reset unrelated fields.
	 */
	useEffect(() => {
		if (formData.role === "student") {
			setSelectedSubjects([]);
			setSelectedGrades({});
		} else if (formData.role === "teacher") {
			setFormData((prev) => ({ ...prev, grade: "" }));
		}
	}, [formData.role]);

	/**
	 * useEffect – Build teaching assignments whenever selectedSubjects or selectedGrades change.
	 */
	useEffect(() => {
		if (formData.role === "teacher") {
			const teachingAssignments = selectedSubjects
				.map((subject) => ({
					subject: subject._id,
					grades: Object.keys(selectedGrades)
						.filter(
							(subjectId) =>
								subjectId === subject._id &&
								selectedGrades[subjectId]?.length > 0
						)
						.flatMap((subjectId) => selectedGrades[subjectId]),
				}))
				.filter((assignment) => assignment.grades.length > 0);

			setFormData((prev) => ({ ...prev, teachingAssignments }));
		}
	}, [selectedSubjects, selectedGrades, formData.role]);

	/**
	 * Mutation – Submit new user to the server.
	 */
	const { mutate: submitUser, isLoading } = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries(["dashboard"]);
			queryClient.invalidateQueries(["users"]);
			onClose();
			setFormData({
				name: "",
				email: "",
				password: "",
				role: "student",
				grade: "",
				specialization: "",
				teachingAssignments: [],
			});
			setSelectedSubjects([]);
			setSelectedGrades({});
		},
		onError: (error) => {
			setError(error.response?.data?.error || "Error creating user");
		},
	});

	/**
	 * Handles form submission.
	 *
	 * @param {Event} e - The form submit event.
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");

		// General validation
		if (!formData.name || !formData.email || !formData.password) {
			setError("Please fill in all required fields");
			return;
		}

		// Role-specific validation
		if (formData.role === "student" && !formData.grade) {
			setError("Please select a grade for the student");
			return;
		}

		if (formData.role === "teacher" && !formData.specialization) {
			setError("Please provide a specialization for the teacher");
			return;
		}

		if (
			formData.role === "teacher" &&
			formData.teachingAssignments.length === 0
		) {
			setError("Please assign at least one subject and grade to the teacher");
			return;
		}

		submitUser(formData);
	};

	/**
	 * Handles changes in basic input fields.
	 *
	 * @param {Event} e - The input change event.
	 */
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	/**
	 * Handles subject selection for teachers (Autocomplete).
	 *
	 * @param {Event} event
	 * @param {Array} newValue - Array of selected subject objects
	 */
	const handleSubjectChange = (event, newValue) => {
		setSelectedSubjects(newValue);
	};

	/**
	 * Handles assigning grades to a selected subject.
	 *
	 * @param {string} subjectId - The subject’s _id.
	 * @param {Event} event - The select change event with grade values.
	 */
	const handleGradeChange = (subjectId, event) => {
		const selected = event.target.value;
		setSelectedGrades((prev) => ({
			...prev,
			[subjectId]: selected,
		}));
	};

	// Render form in dialog
	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Add New User</DialogTitle>
			<form onSubmit={handleSubmit}>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{error && <Alert severity="error">{error}</Alert>}

						{/* Basic User Info */}
						{/* ... all form fields stay unchanged ... */}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={isLoading || gradesLoading || subjectsLoading}
					>
						Add User
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

// Prop validation for component props
AddUserForm.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

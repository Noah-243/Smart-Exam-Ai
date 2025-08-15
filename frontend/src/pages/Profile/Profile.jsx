import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useUser } from "../../contexts/UserContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateProfile } from "../../api/auth";
import {
	getTeacherProfile,
	updateTeachingAssignments,
	updateSpecializations,
} from "../../api/teachers";
import { getAllSubjects } from "../../api/subjects";
import { getGrades } from "../../api/grades";
import { useTranslation } from "react-i18next";
import {
	ProfileHeader,
	TeachingAssignmentsTable,
	AddAssignmentModal,
	EditAssignmentModal,
	AlertsSection,
} from "./components";

export default function Profile() {
	const { t } = useTranslation();
	const { user, updateUser } = useUser();
	const [isAddingAssignment, setIsAddingAssignment] = useState(false);
	const [isEditingAssignment, setIsEditingAssignment] = useState(false);
	const [editingAssignmentIndex, setEditingAssignmentIndex] = useState(null);
	const [editingAssignmentData, setEditingAssignmentData] = useState(null);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [specializations, setSpecializations] = useState([]);
	const [newAssignment, setNewAssignment] = useState({
		subject: "",
		grades: [],
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Fetch teacher profile data
	const { data: teacherData, refetch: refetchTeacher } = useQuery({
		queryKey: ["teacherProfile"],
		queryFn: () => getTeacherProfile(),
		enabled: !!user && (user?.role === "teacher" || user?.role === "admin"),
	});

	// Update specializations when teacherData changes
	useEffect(() => {
		if (teacherData?.data?.specializations) {
			setSpecializations(teacherData.data.specializations);
		}
	}, [teacherData]);

	// Fetch subjects and grades data
	const { data: subjectsData } = useQuery({
		queryKey: ["subjects"],
		queryFn: getAllSubjects,
		enabled: user?.role === "teacher" || user?.role === "admin",
	});

	const { data: gradesData } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
		enabled: user?.role === "teacher" || user?.role === "admin",
	});

	const subjects = subjectsData?.data || [];
	const grades = gradesData?.data?.items || gradesData?.data || [];
	const teachingAssignments = teacherData?.data?.teachingAssignments || [];

	// Mutations
	const updateProfileMutation = useMutation({
		mutationFn: updateProfile,
		onSuccess: (data) => {
			updateUser(data.data);
			setSuccess(t("profile.profileUpdated"));
			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			}));
		},
		onError: (error) => {
			setError(error.response?.data?.error || t("profile.errorUpdating"));
		},
	});

	const updateSpecializationsMutation = useMutation({
		mutationFn: (specializations) => updateSpecializations(specializations),
		onSuccess: () => {
			setSuccess(t("profile.specializationsUpdated"));
			refetchTeacher();
		},
		onError: (error) => {
			setError(
				error.response?.data?.error || t("profile.errorUpdatingSpecializations")
			);
		},
	});

	const updateAssignmentsMutation = useMutation({
		mutationFn: (data) => updateTeachingAssignments(data),
		onSuccess: () => {
			setSuccess(t("profile.assignmentsUpdated"));
			refetchTeacher();
		},
		onError: (error) => {
			console.log("Error updating teaching assignments:", error);
			const errorMessage =
				error.response?.data?.error ||
				error.response?.data?.message ||
				error.message ||
				t("profile.errorUpdatingAssignments");

			// Ensure error message is a string
			const finalErrorMessage =
				typeof errorMessage === "string"
					? errorMessage
					: JSON.stringify(errorMessage);

			setError(finalErrorMessage);
		},
	});

	// Event handlers
	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (
			formData.newPassword &&
			formData.newPassword !== formData.confirmPassword
		) {
			setError(t("profile.passwordsDoNotMatch"));
			return;
		}

		updateProfileMutation.mutate(formData);
	};

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSpecializationsSubmit = () => {
		setError("");
		setSuccess("");
		updateSpecializationsMutation.mutate(specializations);
	};

	// Helper function to clean assignment data
	const cleanAssignmentData = (assignments) => {
		console.log("=== CLEANING ASSIGNMENT DATA ===");
		console.log("Input assignments:", assignments);

		return assignments.map((assignment, index) => {
			console.log(`Processing assignment ${index}:`, assignment);

			let cleanSubject = assignment.subject;
			let cleanGrades = assignment.grades;

			// Handle subject cleaning
			if (
				typeof assignment.subject === "object" &&
				assignment.subject !== null
			) {
				console.log("Subject is object:", assignment.subject);
				// Try to extract ID from object
				cleanSubject = assignment.subject.id || assignment.subject._id;

				// If no ID found in object, we need to find it by name
				if (!cleanSubject && assignment.subject.name) {
					console.log(
						"No ID in subject object, finding by name:",
						assignment.subject.name
					);
					const foundSubject = subjects.find(
						(s) =>
							s.name === assignment.subject.name ||
							(s.id || s._id) === assignment.subject.name
					);
					if (foundSubject) {
						cleanSubject = foundSubject.id || foundSubject._id;
						console.log("Found subject by name:", cleanSubject);
					} else {
						console.warn(
							"Could not find subject by name:",
							assignment.subject.name
						);
						cleanSubject = assignment.subject.name; // fallback
					}
				}
			}

			// Handle grades cleaning
			if (Array.isArray(assignment.grades)) {
				cleanGrades = assignment.grades.map((grade, gradeIndex) => {
					console.log(`Processing grade ${gradeIndex}:`, grade);

					if (typeof grade === "object" && grade !== null) {
						let gradeId = grade.id || grade._id;

						// If no ID found in object, find by name
						if (!gradeId && grade.name) {
							console.log(
								"No ID in grade object, finding by name:",
								grade.name
							);
							const foundGrade = grades.find(
								(g) => g.name === grade.name || (g.id || g._id) === grade.name
							);
							if (foundGrade) {
								gradeId = foundGrade.id || foundGrade._id;
								console.log("Found grade by name:", gradeId);
							} else {
								console.warn("Could not find grade by name:", grade.name);
								gradeId = grade.name; // fallback
							}
						}

						return gradeId;
					}
					return grade;
				});
			}

			const cleanedAssignment = {
				...assignment,
				subject: cleanSubject,
				grades: cleanGrades,
			};

			console.log(`Cleaned assignment ${index}:`, cleanedAssignment);
			return cleanedAssignment;
		});
	};

	const handleAddAssignment = () => {
		if (!newAssignment.subject || newAssignment.grades.length === 0) {
			setError(t("profile.subjectAndGradesRequired"));
			return;
		}

		const updatedAssignments = [...teachingAssignments, newAssignment];
		const cleanedAssignments = cleanAssignmentData(updatedAssignments);

		console.log("Original assignments:", updatedAssignments);
		console.log("Cleaned assignments:", cleanedAssignments);

		updateAssignmentsMutation.mutate({
			teachingAssignments: cleanedAssignments,
		});
		setNewAssignment({ subject: "", grades: [] });
		setIsAddingAssignment(false);
	};

	const handleDeleteAssignment = (index) => {
		const updatedAssignments = [...teachingAssignments];
		updatedAssignments.splice(index, 1);
		const cleanedAssignments = cleanAssignmentData(updatedAssignments);

		updateAssignmentsMutation.mutate({
			teachingAssignments: cleanedAssignments,
		});
	};

	const handleEditAssignment = (index, assignment) => {
		setEditingAssignmentIndex(index);
		setEditingAssignmentData(assignment);
		setIsEditingAssignment(true);
	};

	const handleSaveEditedAssignment = (editedData) => {
		if (!editedData.subject || editedData.grades.length === 0) {
			setError(t("profile.subjectAndGradesRequired"));
			return;
		}

		const updatedAssignments = [...teachingAssignments];
		updatedAssignments[editingAssignmentIndex] = editedData;
		const cleanedAssignments = cleanAssignmentData(updatedAssignments);

		updateAssignmentsMutation.mutate({
			teachingAssignments: cleanedAssignments,
		});
		setIsEditingAssignment(false);
		setEditingAssignmentIndex(null);
		setEditingAssignmentData(null);
	};

	const getSubjectNameById = (subjectData) => {
		// If subjectData is already populated (object with name), return the name
		if (typeof subjectData === "object" && subjectData?.name) {
			return subjectData.name;
		}
		// If it's an ObjectId string, find in subjects array
		const subject = subjects.find((subj) => subj._id === subjectData);
		return subject ? subject.name : t("common.unknown");
	};

	const getGradeNameById = (gradeData) => {
		// If gradeData is already populated (object with name), return the name
		if (typeof gradeData === "object" && gradeData?.name) {
			return gradeData.name;
		}
		// If it's an ObjectId string, find in grades array
		const grade = grades.find((g) => g._id === gradeData);
		return grade ? grade.name : t("common.unknown");
	};

	return (
		<Box sx={{ p: 4, width: "100vw", ml: -3, mr: -3 }}>
			{/* Enhanced Profile Header with Basic Info and Specialization */}
			<ProfileHeader
				user={user}
				teacherData={teacherData}
				// Basic info props
				formData={formData}
				setFormData={setFormData}
				handleSubmit={handleSubmit}
				handleChange={handleChange}
				isUpdatingProfile={updateProfileMutation.isLoading}
				// Specializations props
				specializations={specializations}
				setSpecializations={setSpecializations}
				handleSpecializationsSubmit={handleSpecializationsSubmit}
				isUpdatingSpecializations={updateSpecializationsMutation.isLoading}
			/>

			{/* Alerts */}
			<AlertsSection error={error} success={success} />

			{/* Teaching Assignments */}
			{(user?.role === "teacher" || user?.role === "admin") && (
				<TeachingAssignmentsTable
					teachingAssignments={teachingAssignments}
					user={user}
					onEdit={handleEditAssignment}
					onDelete={handleDeleteAssignment}
					onAdd={() => {
						setNewAssignment({ subject: "", grades: [] });
						setIsAddingAssignment(true);
					}}
					getSubjectNameById={getSubjectNameById}
					getGradeNameById={getGradeNameById}
					isLoading={updateAssignmentsMutation.isLoading}
				/>
			)}

			{/* Add Assignment Modal */}
			<AddAssignmentModal
				open={isAddingAssignment}
				onClose={() => {
					setNewAssignment({ subject: "", grades: [] });
					setIsAddingAssignment(false);
				}}
				onAdd={handleAddAssignment}
				newAssignment={newAssignment}
				setNewAssignment={setNewAssignment}
				subjects={subjects}
				grades={grades}
			/>

			{/* Edit Assignment Modal */}
			<EditAssignmentModal
				open={isEditingAssignment}
				onClose={() => setIsEditingAssignment(false)}
				onSave={handleSaveEditedAssignment}
				assignment={editingAssignmentData}
				subjects={subjects}
				grades={grades}
				getSubjectNameById={getSubjectNameById}
				getGradeNameById={getGradeNameById}
			/>
		</Box>
	);
}

/**
 * AdminDashboard Component
 * ------------------------
 * Provides the main administrative interface for the system.
 *
 * Features:
 * - Displays key statistics: users, teachers, students, questions.
 * - Shows combined test stats, upcoming scheduled tests, and questions by subject.
 * - Displays a calendar of scheduled tests.
 * - Allows switching between tabs:
 *    1. Dashboard overview
 *    2. Students list
 *    3. Grades list (with student counts)
 * - Includes modals for adding/editing users and managing grades.
 *
 * Data:
 * - Fetched using React Query (`getDashboardStats`, `getStudentCountsByGrade`, `getScheduledTests`).
 * - Queries are enabled conditionally based on the active tab for performance.
 *
 * Hooks:
 * - useState: Controls tabs and modal dialogs.
 * - useEffect: Logs and checks data after loading.
 * - useTheme, useTranslation, useLanguage: Theme and i18n support.
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Dialog,
	Alert,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	CompareArrows as TransferIcon,
	ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { getGradeById } from "../../api/grades";
import AddStudentForm from "../../components/AddStudentForm/AddStudentForm";
import TransferStudentForm from "../../components/TransferStudentForm/TransferStudentForm";

/**
 * GradeDetails Component
 * ----------------------
 * Displays a specific grade and its students; supports adding and transferring students.
 *
 * Fetching:
 * - Uses React Query to call `getGradeById(gradeId)` and handle loading/error states.
 *
 * UI:
 * - Header with "Back to Grades" and "Add Student" actions.
 * - MUI table listing student name/email and action buttons (Transfer, Edit placeholder).
 *
 * State:
 * - isAddStudentOpen, isTransferOpen: control dialogs.
 * - selectedStudent: the student chosen for transfer.
 *
 * Navigation:
 * - `useNavigate()` to return to grades list.
 */
export default function GradeDetails() {
	const { gradeId } = useParams();
	const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
	const [isTransferOpen, setIsTransferOpen] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const navigate = useNavigate();

	
	/**
	 * React Query: fetch grade details by id.
	 * - queryKey: ["grade", gradeId] enables caching per-grade.
	 * - queryFn: wraps `getGradeById` and returns the raw API response.
	 */
	const {
		data: grade,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["grade", gradeId],
		queryFn: async () => {
			const response = await getGradeById(gradeId);
			console.log("Raw API response:", response);
			return response;
		},
	});

	console.log("Grade data:", grade);

	if (isLoading) {
		return <Typography>Loading...</Typography>;
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				Error loading grade: {error.message}
			</Alert>
		);
	}

	if (!grade?.data) {
		return (
			<Alert severity="warning" sx={{ m: 2 }}>
				Grade not found
			</Alert>
		);
	}

	const students = grade.data.students || [];
	console.log("Students array:", students);

	return (
		<Box sx={{ p: 3 }}>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate("/grades")}
				sx={{ mb: 3 }}
			>
				Back to Grades
			</Button>

			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
				<Typography variant="h4">{grade.data.name}</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setIsAddStudentOpen(true)}
				>
					Add Student
				</Button>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{students.length === 0 ? (
							<TableRow>
								<TableCell colSpan={3} align="center">
									<Typography color="text.secondary">
										No students in this grade yet
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							students.map((student) => {
								console.log("Rendering student:", student);
								return (
									<TableRow key={student._id}>
										<TableCell>{student.user?.name}</TableCell>
										<TableCell>{student.user?.email}</TableCell>
										<TableCell align="right">
											<IconButton
												size="small"
												onClick={() => {
													setSelectedStudent(student);
													setIsTransferOpen(true);
												}}
											>
												<TransferIcon />
											</IconButton>
											<IconButton size="small">
												<EditIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<AddStudentForm
				open={isAddStudentOpen}
				onClose={() => setIsAddStudentOpen(false)}
				gradeId={gradeId}
			/>

			<TransferStudentForm
				open={isTransferOpen}
				onClose={() => {
					setIsTransferOpen(false);
					setSelectedStudent(null);
				}}
				student={selectedStudent}
				currentGrade={grade.data}
			/>
		</Box>
	);
}

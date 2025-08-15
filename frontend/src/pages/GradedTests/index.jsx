import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Container,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	CircularProgress,
	Chip,
	Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getTeacherStudentTests } from "../../api/teacherTests";
import { formatDate } from "../../utils/formatDate";
import { ROUTES } from "../../routes/routeConfig";

/**
 * GradedTests Component
 * ---------------------
 * Lists all tests that have been graded for the teacher's students.
 * - Fetches teacher/student tests with React Query (`getTeacherStudentTests`)
 * - Filters to status === "graded"
 * - Renders a table (title, student, subject, graded date, score, status, actions)
 * - Handles loading/error states, and navigates to a specific graded test details page
 */
const GradedTests = () => {
	const navigate = useNavigate();
	const [error, setError] = useState("");

	const {
		data: tests,
		isLoading,
		isError,
		error: queryError,
	} = useQuery(["teacherTests"], getTeacherStudentTests, {
		onError: (err) => {
			setError(`Error loading tests: ${err.message}`);
		},
	});

	// Filter for only graded tests
	const gradedTests = tests?.filter((test) => test.status === "graded") || [];

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box sx={{ py: 4 }}>
				<Alert severity="error">{queryError.message}</Alert>
			</Box>
		);
	}
    // Main table rendering
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Graded Tests
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<Paper sx={{ p: 2, mb: 4 }}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Test Title</TableCell>
								<TableCell>Student</TableCell>
								<TableCell>Subject</TableCell>
								<TableCell>Graded Date</TableCell>
								<TableCell>Score</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{gradedTests.length > 0 ? (
								gradedTests.map((test) => (
									<TableRow key={test._id}>
										<TableCell>
											{test.scheduledTest?.test?.title || "Untitled Test"}
										</TableCell>
										<TableCell>
											{test.student?.name || "Unknown Student"}
										</TableCell>
										<TableCell>
											{test.scheduledTest?.test?.subject?.name ||
												"Unknown Subject"}
										</TableCell>
										<TableCell>{formatDate(test.gradedAt)}</TableCell>
										<TableCell>{test.score}%</TableCell>
										<TableCell>
											<Chip label="Graded" color="success" size="small" />
										</TableCell>
										<TableCell>
											<Button
												variant="outlined"
												size="small"
												onClick={() =>
													navigate(`${ROUTES.GRADED_TESTS}/${test._id}`)
												}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} align="center">
										No graded tests found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</Container>
	);
};

export default GradedTests;

/**
 * PastTests Component
 *
 * Overview:
 * -----------
 * The PastTests component displays a table of previously completed tests
 * for the logged-in student. It integrates with the backend via the
 * `getStudentPastTests` API function and uses React Query for data fetching.
 * The table shows details such as test subject, date, status, and score,
 * and allows navigation to a detailed results view for each test.
 *
 * Main Responsibilities:
 * -----------------------
 * 1. Fetch and display a list of past tests for the current student.
 * 2. Show a loading spinner while fetching data.
 * 3. Handle and display error states if data cannot be retrieved.
 * 4. Format and display test metadata (e.g., subject, date, score).
 * 5. Provide a button to view detailed test results.
 *
 * External Dependencies:
 * -----------------------
 * - @tanstack/react-query: for data fetching (`useQuery`).
 * - react-router-dom: for navigation between pages.
 * - @mui/material: for UI components and layout.
 * - @mui/icons-material: for table icons and status indicators.
 * - i18next: for translations (`useTranslation`).
 * - formatDate utility: for date formatting.
 * - getStudentPastTests API: for retrieving test data.
 *
 * Props:
 * -------
 * This component does not receive any props directly; it fetches data
 * based on the currently authenticated student.
 *
 * Functions:
 * -----------
 * - handleViewResults(testId: string): Navigates to the detailed results
 *   page for the selected test.
 *
 * Data Flow:
 * -----------
 * 1. On mount, `useQuery` triggers `getStudentPastTests`.
 * 2. If loading, a spinner is shown.
 * 3. If error, a message is displayed.
 * 4. If successful, test data is rendered in a table with interactive controls.
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Button,
	CircularProgress,
	Paper,
	Divider,
} from "@mui/material";
import {
	Visibility as ViewIcon,
	CheckCircle as CheckCircleIcon,
	HourglassEmpty as HourglassEmptyIcon,
	Done as DoneIcon,
	School as SubjectIcon,
} from "@mui/icons-material";
import { getStudentPastTests } from "../../api/studentDashboard";
import { formatDate } from "../../utils/formatDate";
import { useTranslation } from "react-i18next";

const PastTests = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	// Fetch past tests
	const {
		data: pastsTestsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["pastTests"],
		queryFn: getStudentPastTests,
	});

	const handleViewResults = (testId) => {
		navigate(`/test-results/${testId}`);
	};

	// Helper for score color
	const getScoreColor = (score) => {
		if (score >= 80) return "success";
		if (score >= 60) return "primary";
		if (score >= 40) return "warning";
		return "error";
	};

	// Function to render a table for a group of tests in a subject
	const renderSubjectTable = (subjectName, tests) => (
		<Box sx={{ mb: 4 }} key={subjectName}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 2, pl: 2 }}>
				<SubjectIcon sx={{ mr: 1, color: "primary.main" }} />
				<Typography variant="h6" component="h2">
					{subjectName}
				</Typography>
				<Chip
					label={`${tests.length} test${tests.length !== 1 ? "s" : ""}`}
					size="small"
					sx={{ ml: 2 }}
				/>
			</Box>
			<TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 1 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									backgroundColor: "primary.main",
									color: "white",
									fontWeight: "bold",
								}}
							>
								Test Name
							</TableCell>
							<TableCell
								sx={{
									backgroundColor: "primary.main",
									color: "white",
									fontWeight: "bold",
								}}
							>
								Date Taken
							</TableCell>
							<TableCell
								sx={{
									backgroundColor: "primary.main",
									color: "white",
									fontWeight: "bold",
								}}
							>
								Score
							</TableCell>
							<TableCell
								sx={{
									backgroundColor: "primary.main",
									color: "white",
									fontWeight: "bold",
								}}
								align="center"
							>
								Status
							</TableCell>
							<TableCell
								sx={{
									backgroundColor: "primary.main",
									color: "white",
									fontWeight: "bold",
								}}
								align="center"
							>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{tests.map((test) => (
							<TableRow key={test._id} hover>
								<TableCell>{test.testName}</TableCell>
								<TableCell>{formatDate(test.submittedAt)}</TableCell>
								<TableCell>
									<Chip
										label={`${test.score}%`}
										color={getScoreColor(test.score)}
										variant="outlined"
									/>
								</TableCell>
								<TableCell align="center">
									{test.status === "graded" ? (
										<Chip
											icon={<CheckCircleIcon />}
											label="Graded"
											color="success"
											size="small"
										/>
									) : test.status === "pending" ? (
										<Chip
											icon={<HourglassEmptyIcon />}
											label="Pending Review"
											color="warning"
											size="small"
										/>
									) : (
										<Chip
											icon={<DoneIcon />}
											label="Completed"
											color="info"
											size="small"
										/>
									)}
								</TableCell>
								<TableCell align="center">
									{test.status === "graded" ? (
										<Button
											variant="outlined"
											startIcon={<ViewIcon />}
											size="small"
											onClick={() => handleViewResults(test._id)}
										>
											{t("viewResults")}
										</Button>
									) : (
										<Typography variant="caption" color="text.secondary">
											Awaiting Teacher Review
										</Typography>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "calc(100vh - 64px)", // Full height minus app bar
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 2 }}>
				<Typography variant="h6" color="error">
					Error loading past tests: {error.message}
				</Typography>
			</Box>
		);
	}

	const pastTests = pastsTestsData?.data || [];

	// Group tests by subject
	const testsBySubject = pastTests.reduce((acc, test) => {
		const subject = test.subject || "Unknown Subject";
		if (!acc[subject]) {
			acc[subject] = [];
		}
		acc[subject].push(test);
		return acc;
	}, {});

	// Get subjects sorted alphabetically
	const sortedSubjects = Object.keys(testsBySubject).sort();

	return (
		<Box
			sx={{
				width: "100%",
				minHeight: "calc(100vh - 64px)", // Full height minus app bar
				display: "flex",
				flexDirection: "column",
				overflow: "auto",
				p: 3,
				backgroundColor: "background.paper",
			}}
		>
			<Typography variant="h4" component="h1" gutterBottom>
				Your Past Tests
			</Typography>

			<Divider sx={{ mb: 3 }} />

			{pastTests.length === 0 ? (
				<Box
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "background.paper",
						borderRadius: 2,
						p: 4,
						boxShadow: 1,
					}}
				>
					<Typography variant="subtitle1" align="center">
						You haven&apos;t taken any tests yet.
					</Typography>
				</Box>
			) : (
				<Box sx={{ pb: 4 }}>
					{sortedSubjects.map((subject) =>
						renderSubjectTable(subject, testsBySubject[subject])
					)}
				</Box>
			)}
		</Box>
	);
};

export default PastTests;

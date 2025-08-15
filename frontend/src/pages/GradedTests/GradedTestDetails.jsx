/**
 * GradedTestDetails Component
 * ---------------------------
 * Displays a detailed breakdown of a graded test for a specific student.
 *
 * Features:
 * - Fetches graded test data from the API via `getTeacherStudentTest` using React Query.
 * - Shows:
 *    • Test info (title, subject, student, grade)
 *    • Grading details (submission date, grading date, score, points)
 *    • Teacher's overall feedback
 *    • Per-question details: question text, student's answer, correctness, points, feedback
 * - Calculates and displays total points and total possible points (10 points per question).
 * - Uses MUI components for layout, cards, tables, and icons.
 * - Back button navigates to graded tests list.
 *
 * Hooks:
 * - useParams: Retrieves `testId` from the route.
 * - useNavigate: Handles back navigation.
 * - useQuery: Fetches and caches test data.
 */

import { useParams, useNavigate } from "react-router-dom";
import {
	Box,
	Container,
	Typography,
	Paper,
	Divider,
	CircularProgress,
	Alert,
	Card,
	CardContent,
	CardHeader,
	IconButton,
	Grid,
	Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useQuery } from "@tanstack/react-query";
import { getTeacherStudentTest } from "../../api/teacherTests";
import { formatDate } from "../../utils/formatDate";
import { ROUTES } from "../../routes/routeConfig";

/**
 * GradedTestDetails Component
 * ---------------------------
 * Displays a full breakdown of a graded test for a specific student.
 * Fetches data from the backend and shows:
 * - Test details (title, subject, student, grade)
 * - Submission & grading dates
 * - Score percentage and points earned
 * - Teacher's general feedback
 * - Each question, student's answer, correctness, points, and per-question feedback
 */
const GradedTestDetails = () => {
	// Extract the testId parameter from the URL
	const { testId } = useParams();
	const navigate = useNavigate();

	/**
	 * Fetch graded test data using React Query.
	 * - Cache key: ["teacherStudentTest", testId]
	 * - Fetch function: getTeacherStudentTest(testId)
	 */
	const {
		data: test,
		isLoading,
		isError,
		error,
	} = useQuery(["teacherStudentTest", testId], () =>
		getTeacherStudentTest(testId)
	);

	// Show loading spinner while data is being fetched
	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	// Show error message if API request fails
	if (isError) {
		return (
			<Box sx={{ py: 4 }}>
				<Alert severity="error">Error loading test: {error.message}</Alert>
			</Box>
		);
	}

	// Calculate total points
	const totalPoints = test.answers.reduce(
		(sum, answer) => sum + (answer.points || 0),
		0
	);

	// Assume each question is worth 10 points
	const totalPossiblePoints = test.answers.length * 10; // Assuming 10 points max per question

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
				<IconButton
					onClick={() => navigate(ROUTES.GRADED_TESTS)}
					sx={{ mr: 1 }}
				>
					<ArrowBackIcon />
				</IconButton>
				<Typography variant="h4" component="h1">
					Graded Test Details
				</Typography>
			</Box>

			<Paper sx={{ p: 3, mb: 4 }}>
				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<Typography variant="h6">Test Information</Typography>
						<Typography>
							<strong>Test:</strong>{" "}
							{test.scheduledTest?.test?.title || "Untitled Test"}
						</Typography>
						<Typography>
							<strong>Subject:</strong>{" "}
							{test.scheduledTest?.test?.subject?.name || "Unknown Subject"}
						</Typography>
						<Typography>
							<strong>Student:</strong>{" "}
							{test.student?.name || "Unknown Student"}
						</Typography>
						<Typography>
							<strong>Grade:</strong>{" "}
							{test.student?.grade?.name || "Unknown Grade"}
						</Typography>
					</Grid>
					<Grid item xs={12} md={6}>
						<Typography variant="h6">Grading Details</Typography>
						<Typography>
							<strong>Submitted:</strong> {formatDate(test.submittedAt)}
						</Typography>
						<Typography>
							<strong>Graded:</strong> {formatDate(test.gradedAt)}
						</Typography>
						<Typography sx={{ mt: 1 }}>
							<strong>Score:</strong>{" "}
							<Chip
								label={`${test.score}%`}
								color={
									test.score >= 70
										? "success"
										: test.score >= 50
										? "warning"
										: "error"
								}
							/>
						</Typography>
						<Typography sx={{ mt: 1 }}>
							<strong>Points:</strong> {totalPoints} / {totalPossiblePoints}
						</Typography>
					</Grid>
				</Grid>

				{test.feedback && (
					<Box sx={{ mt: 3 }}>
						<Typography variant="h6">Teacher Feedback</Typography>
						<Typography
							sx={{
								mt: 1,
								p: 2,
								bgcolor: "background.elevated",
								borderRadius: 1,
							}}
						>
							{test.feedback}
						</Typography>
					</Box>
				)}
			</Paper>

			<Typography variant="h5" gutterBottom>
				Questions and Answers
			</Typography>

			{test.answers.map((answer, index) => {
				const question = test.scheduledTest?.test?.questions?.find(
					(q) => q.question?._id === answer.question
				);

				return (
					<Card key={answer.question} sx={{ mb: 2 }}>
						<CardHeader
							title={`Question ${index + 1}`}
							subheader={
								question?.question?.text || "Question text not available"
							}
						/>
						<Divider />
						<CardContent>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Typography variant="subtitle1">
										<strong>Student&apos;s Answer:</strong> {answer.answer}
									</Typography>
								</Grid>
								<Grid item xs={12} md={6}>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										{answer.isCorrect ? (
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<CheckCircleIcon color="success" sx={{ mr: 0.5 }} />
												<Typography>Correct</Typography>
											</Box>
										) : (
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<CancelIcon color="error" sx={{ mr: 0.5 }} />
												<Typography>Incorrect</Typography>
											</Box>
										)}
									</Box>
								</Grid>
								<Grid item xs={12} md={6}>
									<Typography>
										<strong>Points:</strong> {answer.points} / 10
									</Typography>
								</Grid>
								{answer.feedback && (
									<Grid item xs={12}>
										<Typography variant="subtitle2">
											Teacher Feedback:
										</Typography>
										<Typography
											sx={{
												p: 1,
												bgcolor: "background.elevated",
												borderRadius: 1,
											}}
										>
											{answer.feedback}
										</Typography>
									</Grid>
								)}
							</Grid>
						</CardContent>
					</Card>
				);
			})}
		</Container>
	);
};

export default GradedTestDetails;

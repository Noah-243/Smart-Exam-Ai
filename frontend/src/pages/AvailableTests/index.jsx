/**
 * AvailableTests Component
 * ------------------------
 * Shows all tests currently available to the logged-in student.
 * - Redirects to login if unauthenticated.
 * - Fetches tests via `getAllAvailableTests()` on mount.
 * - Displays each test's title, subject, duration, and question count.
 * - "Start Test Now" sets the auth header and navigates to the test.
 *
 * State: availableTests, loading, error.
 * Hooks: useState, useEffect, useNavigate, useUser.
 * UI: Material UI components and icons.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Card,
	CardContent,
	CardHeader,
	Button,
	Grid,
	CircularProgress,
	Alert,
	Chip,
	Divider,
	Container,
} from "@mui/material";
import {
	School as SubjectIcon,
	Timer as TimerIcon,
	QuestionAnswer as QuestionsIcon,
} from "@mui/icons-material";
import { getAllAvailableTests } from "../../api/studentDashboard";
import { ROUTES } from "../../routes/routeConfig";
import { useUser } from "../../contexts/UserContext";
import { apiConfig } from "../../api/config";

const { axiosInstance } = apiConfig;

const AvailableTests = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useUser();
	const [availableTests, setAvailableTests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTests = async () => {
			// Additional check - redirect if not authenticated
			if (!isAuthenticated) {
				console.log("Not authenticated, redirecting to login");
				navigate(ROUTES.LOGIN);
				return;
			}

			try {
				setLoading(true);

				// Fetch all available tests
				console.log("Fetching all available tests...");
				const availableResponse = await getAllAvailableTests();
				console.log("Available tests API raw response:", availableResponse);

				if (availableResponse && availableResponse.success) {
					const tests = availableResponse.data || [];
					console.log(`Found ${tests.length} available tests:`, tests);
					setAvailableTests(tests);
				} else {
					console.log("No available tests found in response");
					setAvailableTests([]);
				}

				setLoading(false);
			} catch (err) {
				console.error("Error fetching tests:", err);
				setError("No tests are currently available. Please check back later.");
				setAvailableTests([]);
				setLoading(false);
			}
		};

		fetchTests();
	}, [isAuthenticated, navigate, user]);

	const handleTakeTest = (testId) => {
		console.log("Starting test with ID:", testId);

		// Re-verify that the user is authenticated before navigation
		if (!isAuthenticated || !user?.token) {
			console.error("Authentication required to take a test");
			navigate(ROUTES.LOGIN, { state: { from: ROUTES.AVAILABLE_TESTS } });
			return;
		}

		// Set the token in axios headers before navigating
		axiosInstance.defaults.headers.common[
			"Authorization"
		] = `Bearer ${user.token}`;

		// Navigate to the test
		navigate(`${ROUTES.TAKE_TEST.replace(":scheduledTestId", testId)}`);
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="80vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg">
			<Box sx={{ my: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Available Tests
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{/* No tests available notification */}
				{availableTests.length === 0 && !loading && !error && (
					<Alert severity="info" sx={{ mb: 3 }}>
						No tests are currently available for you. Please check back later.
					</Alert>
				)}

				{/* Currently Available Tests */}
				{availableTests.map((test) => (
					<Card
						key={test._id}
						raised
						sx={{
							bgcolor: "success.light",
							mb: 2,
						}}
					>
						<CardHeader
							title={test.test?.title || "Untitled Test"}
							subheader={
								<Box display="flex" alignItems="center" gap={1}>
									<SubjectIcon fontSize="small" color="primary" />
									<Typography variant="body2">
										{test.test?.subject?.name || "General"}
									</Typography>
								</Box>
							}
							action={
								<Chip
									label="Available Now"
									color="success"
									variant="filled"
									size="small"
								/>
							}
						/>
						<Divider />
						<CardContent>
							<Grid container spacing={2}>
								<Grid item xs={6}>
									<Box display="flex" alignItems="center" gap={1}>
										<TimerIcon fontSize="small" color="action" />
										<Typography variant="body2">
											{test.duration} minutes
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={6}>
									<Box display="flex" alignItems="center" gap={1}>
										<QuestionsIcon fontSize="small" color="action" />
										<Typography variant="body2">
											{test.test?.questions?.length || 0} questions
										</Typography>
									</Box>
								</Grid>
							</Grid>

							<Box sx={{ mt: 2 }}>
								<Button
									variant="contained"
									color="success"
									fullWidth
									onClick={() => handleTakeTest(test._id)}
								>
									Start Test Now
								</Button>
							</Box>
						</CardContent>
					</Card>
				))}
			</Box>
		</Container>
	);
};

export default AvailableTests;

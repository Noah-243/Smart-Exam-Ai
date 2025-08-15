/**
 * TakeTest Page
 * -------------
 * Purpose:
 * Allows a student to take a scheduled test. It loads the test either by
 * `scheduledTestId` from the route, or (as a fallback) fetches the student's
 * available test, and then loads it by ID. Handles answering, progress, timing,
 * and submission (manual or auto on time up).
 *
 * Responsibilities:
 * - Guard route access based on authentication/permissions.
 * - Fetch test data (by route param or fallback) and initialize answers.
 * - Track answers, progress, and submission state.
 * - Auto-submit on time expiration and support manual test ID entry if errors occur.
 *
 * Data Flow:
 * - API calls:
 *   - getScheduledTestById(id): loads full scheduled test payload
 *   - getAvailableTest(): finds a currently available test (fallback path)
 *   - submitTest(payload): submits answers for grading
 * - State:
 *   - test, loading, error, answers, submitting, showIdDialog, manualTestId
 * - UI:
 *   - Header with title and timer
 *   - Progress chips + progress bar
 *   - <QuestionList/> for rendering questions and capturing answers
 *   - Submit button (shows loading / success state)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useRoutePermissions } from "../../hooks/useRoutePermissions";
import { ROUTES } from "../../routes/routeConfig";
import {
	Container,
	Box,
	Typography,
	Paper,
	Button,
	Divider,
	LinearProgress,
	Chip,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from "@mui/material";
import {
	Assignment as TestIcon,
	Timer as TimerIcon,
	Check as CheckIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import { getScheduledTestById } from "../../api/scheduledTests";
import { getAvailableTest } from "../../api/studentDashboard";
import { submitTest } from "../../api/studentTests";
import QuestionList from "./QuestionList";
import Timer from "./Timer";
import { apiConfig } from "../../api/config";

const TakeTest = () => {
	const { scheduledTestId } = useParams();
	const navigate = useNavigate();
	const { user, isAuthenticated } = useUser();
	const { canAccessRoute } = useRoutePermissions();
	const [test, setTest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [answers, setAnswers] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [showIdDialog, setShowIdDialog] = useState(false);
	const [manualTestId, setManualTestId] = useState("");
	const { axiosInstance } = apiConfig;

	useEffect(() => {
		// Authentication guard: redirect to login and preserve return path
		if (!isAuthenticated || !user) {
			navigate(ROUTES.LOGIN, {
				state: {
					from: ROUTES.TAKE_TEST.replace(":scheduledTestId", scheduledTestId),
				},
			});
			return;
		}

		axiosInstance.defaults.headers.common[
			"Authorization"
		] = `Bearer ${user.token}`;

		/**
		 * Load test by route param if provided; otherwise fallback:
		 * 1) getAvailableTest() → returns a scheduled test ID
		 * 2) getScheduledTestById(availableTestId) → full test payload
		 * Initializes `answers` for all questions once the test is loaded.
		 */
		const fetchTest = async () => {
			try {
				if (scheduledTestId) {
					try {
						const response = await getScheduledTestById(scheduledTestId);

						if (!response.data) {
							throw new Error("Test data not found in response");
						}

						setTest(response.data);

						const initialAnswers = {};
						response.data.test.questions.forEach((q) => {
							initialAnswers[q.question._id] = "";
						});
						setAnswers(initialAnswers);
						setLoading(false);
						return;
					} catch {
						// Continue to fallback method
					}
				}

				const availableTestResponse = await getAvailableTest();

				if (!availableTestResponse?.data) {
					throw new Error("No available test found");
				}

				const availableTestId = availableTestResponse.data._id;
				const fullTestResponse = await getScheduledTestById(availableTestId);

				setTest(fullTestResponse.data);

				const initialAnswers = {};
				fullTestResponse.data.test.questions.forEach((q) => {
					initialAnswers[q.question._id] = "";
				});
				setAnswers(initialAnswers);
				setLoading(false);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to load test");
				setLoading(false);
			}
		};

		fetchTest();
	}, [scheduledTestId, navigate, isAuthenticated, user, axiosInstance]);

	/**
	 * Update a single question's answer.
	 * Guards against invalid IDs by verifying question existence in the loaded test.
	 * @param {string} questionId
	 * @param {string} answer
	 */
	const handleAnswerChange = (questionId, answer) => {
		const questionExists = test.test.questions.some((q) => {
			const qId = q.question?._id || q._id;
			return qId === questionId;
		});

		if (!questionExists) {
			return;
		}

		setAnswers((prev) => ({
			...prev,
			[questionId]: answer,
		}));
	};

	/**
	 * Submit the test (manual or auto-submit).
	 * Builds the answers payload expected by the API and navigates to a confirmation page.
	 * @param {boolean} [isAutoSubmit=false]
	 */
	const handleSubmit = async (isAutoSubmit = false) => {
		try {
			setSubmitting(true);
			setError(null);

			if (!test) {
				setError("No test data available for submission");
				setSubmitting(false);
				return;
			}

			// Navigate to "submitted" screen with context in route state
			const answerArray = Object.entries(answers).map(
				([questionId, answer]) => ({
					question: questionId,
					answer: answer || "",
				})
			);

			const submissionData = {
				scheduledTest: test._id,
				answers: answerArray,
			};

			const response = await submitTest(submissionData);

			navigate("/test-submitted", {
				state: {
					testTitle: test.test.title,
					submissionId: response.data._id,
					isAutoSubmit,
				},
			});
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Failed to submit test. Please try again."
			);
			setSubmitting(false);
		}
	};

	/**
	 * Called by <Timer/> when time expires, triggers auto-submit.
	 */
	const handleTimeUp = () => {
		handleSubmit(true);
	};

	
	/**
	 * Compute answered progress as a percentage for the progress bar/chips.
	 * @returns {number} 0..100
	 */
	const getProgressPercentage = () => {
		const totalQuestions = test?.test?.questions?.length || 0;
		const answeredQuestions = Object.values(answers).filter(
			(answer) => answer && answer.trim() !== ""
		).length;
		return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
	};

	/**
	 * Manual test-load flow (from the error dialog).
	 * Fetches the test by an ID typed by the user, then initializes answers.
	 */
	const handleManualIdSubmit = () => {
		if (manualTestId.trim()) {
			setShowIdDialog(false);

			const fetchManualTest = async () => {
				try {
					const response = await getScheduledTestById(manualTestId);

					setTest(response.data);

					const initialAnswers = {};
					response.data.test.questions.forEach((q) => {
						initialAnswers[q.question._id] = "";
					});
					setAnswers(initialAnswers);
					setLoading(false);
					setError(null);
				} catch (err) {
					setError(
						err.response?.data?.message ||
							"Failed to fetch test with provided ID"
					);
				}
			};

			fetchManualTest();
		}
	};

	// ===== Route permission guard =====
	if (!canAccessRoute(ROUTES.TAKE_TEST)) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
					<Typography variant="h5" color="error" gutterBottom>
						Access Denied
					</Typography>
					<Typography variant="body1">
						You don&apos;t have permission to take tests.
					</Typography>
				</Paper>
			</Container>
		);
	}

	if (loading) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
					<CircularProgress size={60} sx={{ mb: 2 }} />
					<Typography variant="h6">Loading test...</Typography>
				</Paper>
			</Container>
		);
	}

	// ===== Error state with manual ID entry option =====
	if (error) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
					<Typography variant="h5" color="error" gutterBottom>
						Error Loading Test
					</Typography>
					<Typography variant="body1" sx={{ mb: 3 }}>
						{error}
					</Typography>
					<Button
						variant="outlined"
						onClick={() => setShowIdDialog(true)}
						sx={{ mr: 2 }}
					>
						Enter Test ID Manually
					</Button>
					<Button variant="contained" onClick={() => window.location.reload()}>
						Try Again
					</Button>

					<Dialog open={showIdDialog} onClose={() => setShowIdDialog(false)}>
						<DialogTitle>Enter Test ID</DialogTitle>
						<DialogContent>
							<TextField
								autoFocus
								margin="dense"
								label="Test ID"
								fullWidth
								variant="outlined"
								value={manualTestId}
								onChange={(e) => setManualTestId(e.target.value)}
								sx={{ mt: 2 }}
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setShowIdDialog(false)}>Cancel</Button>
							<Button onClick={handleManualIdSubmit} variant="contained">
								Load Test
							</Button>
						</DialogActions>
					</Dialog>
				</Paper>
			</Container>
		);
	}

	// ===== Defensive: no test found after loading =====
	if (!test) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
					<Typography variant="h5" color="error" gutterBottom>
						Test Not Found
					</Typography>
					<Typography variant="body1">
						The requested test could not be found.
					</Typography>
				</Paper>
			</Container>
		);
	}

	const totalQuestions = test.test.questions.length;
	const answeredQuestions = Object.values(answers).filter(
		(answer) => answer && answer.trim() !== ""
	).length;
	const progressPercentage = getProgressPercentage();

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Paper elevation={3} sx={{ p: 4 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Box display="flex" alignItems="center">
							<TestIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
							<Typography variant="h4" component="h1">
								{test.test.title}
							</Typography>
						</Box>
						<Box display="flex" alignItems="center">
							<TimerIcon color="primary" sx={{ mr: 1 }} />
							<Timer duration={test.duration} onTimeUp={handleTimeUp} />
						</Box>
					</Box>

					<Divider sx={{ my: 2 }} />

					<Box sx={{ mb: 2 }}>
						<Typography variant="body1" color="text.secondary" gutterBottom>
							{test.test.description}
						</Typography>

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mt: 2,
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Chip
									icon={<CheckIcon />}
									label={`${answeredQuestions}/${totalQuestions} Questions Answered`}
									color={progressPercentage === 100 ? "success" : "primary"}
									variant="outlined"
									sx={{ mr: 2 }}
								/>

								{progressPercentage < 100 && (
									<Chip
										icon={<ErrorIcon />}
										label={`${
											totalQuestions - answeredQuestions
										} Questions Unanswered`}
										color="warning"
										variant="outlined"
									/>
								)}
							</Box>

							<Typography variant="body2" color="text.secondary">
								{progressPercentage === 100
									? "All questions answered!"
									: "You can submit with unanswered questions"}
							</Typography>
						</Box>

						<Box sx={{ mt: 2 }}>
							<LinearProgress
								variant="determinate"
								value={progressPercentage}
								sx={{
									height: 10,
									borderRadius: 5,
									backgroundColor: "background.elevated",
									"& .MuiLinearProgress-bar": {
										backgroundColor:
											progressPercentage === 100 ? "#4caf50" : "#1976d2",
									},
								}}
							/>
						</Box>
					</Box>
				</Paper>

				<QuestionList
					questions={test.test.questions}
					answers={answers}
					onAnswerChange={handleAnswerChange}
				/>

				<Box display="flex" justifyContent="center" mt={4} mb={3}>
					<Button
						variant="contained"
						color={progressPercentage === 100 ? "success" : "primary"}
						size="large"
						onClick={() => handleSubmit(false)}
						disabled={submitting}
						startIcon={progressPercentage === 100 ? <CheckIcon /> : null}
						sx={{ px: 4, py: 1.5 }}
					>
						{submitting ? (
							<CircularProgress size={24} />
						) : progressPercentage === 100 ? (
							"Submit Test"
						) : (
							`Submit Test (${
								totalQuestions - answeredQuestions
							} Questions Unanswered)`
						)}
					</Button>
				</Box>
			</Box>
		</Container>
	);
};

export default TakeTest;

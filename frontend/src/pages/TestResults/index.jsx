/**
 * TestResults Page
 * ----------------
 * Purpose:
 * - Displays detailed results for a specific test, including questions, user answers,
 *   correct answers, and grading status.
 * - Allows teachers to review, grade, and provide feedback on student submissions.
 *
 * Main Features:
 * 1. **Data Fetching:**
 *    - Uses `useParams` to retrieve the test ID from the URL.
 *    - Uses `useQuery` (React Query) to fetch test results and related details from the backend.
 *
 * 2. **UI & Layout:**
 *    - Built with Material UI components for consistent styling and responsiveness.
 *    - Sections include:
 *        a) Test summary (title, metadata, progress indicators)
 *        b) Questions list with answers and grading controls
 *        c) Loading and error states
 *
 * 3. **Interactivity:**
 *    - Allows navigation back to other pages using `useNavigate`.
 *    - Supports grading actions via buttons, radio controls, and other form elements.
 *
 * 4. **Visual Feedback:**
 *    - Circular & Linear progress indicators for loading states.
 *    - Chips, color coding, and typography to indicate grading status.
 *
 * Dependencies:
 * - React Router: Navigation and parameter handling
 * - React Query: Server data fetching & caching
 * - Material UI: UI components, theming, and styling
 *
 * Author: [Your Name]
 * Last Updated: [Date]
 */

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
	Typography,
	Box,
	Paper,
	Grid,
	Chip,
	CircularProgress,
	Button,
	Card,
	CardContent,
	CardHeader,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	LinearProgress,
	Stack,
	Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	ArrowBack as BackIcon,
	CheckCircle as CorrectIcon,
	Cancel as WrongIcon,
	Timer as TimerIcon,
	CalendarMonth as CalendarIcon,
	Subject as SubjectIcon,
	Score as ScoreIcon,
	Feedback as FeedbackIcon,
	Quiz as QuizIcon,
} from "@mui/icons-material";
import { getStudentTestDetails } from "../../api/studentDashboard";
import { formatDate } from "../../utils/formatDate";
import { ROUTES } from "../../routes/routeConfig.jsx";

const TestResults = () => {
	const { testId } = useParams();
	const navigate = useNavigate();
	const theme = useTheme();

	const { data, isLoading, error } = useQuery({
		queryKey: ["testDetails", testId],
		queryFn: () => getStudentTestDetails(testId),
	});

	const handleBack = () => {
		navigate(ROUTES.PAST_TESTS);
	};

	if (isLoading) {
		return (
			<Box
				sx={{
					height: "100vh",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
				}}
			>
				<CircularProgress size={60} thickness={4} />
				<Typography variant="h6" sx={{ mt: 3, fontWeight: "medium" }}>
					Loading test results...
				</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="md" sx={{ py: 8 }}>
				<Paper
					elevation={3}
					sx={{
						p: 6,
						textAlign: "center",
						borderRadius: 3,
						background: `linear-gradient(135deg, ${theme.palette.error.light}10 0%, ${theme.palette.error.main}05 100%)`,
						border: `1px solid ${theme.palette.error.light}`,
					}}
				>
					<Typography variant="h5" color="error.main" fontWeight="bold" mb={2}>
						Error loading test results
					</Typography>
					<Typography variant="body1" color="text.secondary" mb={3}>
						{error.message}
					</Typography>
					<Button
						variant="contained"
						startIcon={<BackIcon />}
						onClick={handleBack}
						sx={{ borderRadius: 2, px: 3 }}
					>
						Back to Past Tests
					</Button>
				</Paper>
			</Container>
		);
	}

	const testDetails = data?.data || {};

	// Calculate the percentage of correct answers
	const correctPercentage = testDetails.totalQuestions
		? Math.round(
				(testDetails.correctAnswers / testDetails.totalQuestions) * 100
		  )
		: 0;

	// Calculate the score based on points (this is the actual score)
	const pointsPercentage = testDetails.maxPossiblePoints
		? Math.round(
				(testDetails.totalPoints / testDetails.maxPossiblePoints) * 100
		  )
		: 0;

	// Use points-based percentage as the official score
	const officialScore = pointsPercentage;

	const isPassed = officialScore >= 60;

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
				pb: 6,
			}}
		>
			<Container maxWidth="lg" sx={{ pt: 3 }}>
				{/* Back Button */}
				<Button
					variant="outlined"
					startIcon={<BackIcon />}
					onClick={handleBack}
					sx={{
						mb: 3,
						borderRadius: 2,
						fontWeight: "medium",
						textTransform: "none",
					}}
				>
					Back to Past Tests
				</Button>

				{/* Modern Test Header */}
				<Paper
					elevation={4}
					sx={{
						p: 4,
						mb: 4,
						borderRadius: 3,
						background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
						color: theme.palette.primary.contrastText,
						position: "relative",
						overflow: "hidden",
						"&::before": {
							content: '""',
							position: "absolute",
							top: 0,
							right: 0,
							width: "200px",
							height: "200px",
							background: "rgba(255,255,255,0.1)",
							borderRadius: "50%",
							transform: "translate(50%, -50%)",
						},
					}}
				>
					<Box display="flex" alignItems="center" mb={3}>
						<Box
							sx={{
								width: 56,
								height: 56,
								borderRadius: 2,
								background: "rgba(255,255,255,0.2)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mr: 3,
							}}
						>
							<QuizIcon sx={{ fontSize: 32, color: "inherit" }} />
						</Box>
						<Box>
							<Typography variant="h4" fontWeight="bold" mb={1}>
								{testDetails.testName || "Test Results"}
							</Typography>
							<Typography variant="h6" sx={{ opacity: 0.9 }}>
								Detailed Performance Report
							</Typography>
						</Box>
					</Box>

					{/* Score Display */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: 3,
						}}
					>
						<Box display="flex" alignItems="center" gap={3}>
							<Box textAlign="center">
								<Typography
									variant="h2"
									fontWeight="bold"
									sx={{ lineHeight: 1 }}
								>
									{officialScore}%
								</Typography>
								<Typography variant="body1" sx={{ opacity: 0.9 }}>
									Final Score
								</Typography>
							</Box>
							<Chip
								label={isPassed ? "PASSED" : "FAILED"}
								color={isPassed ? "success" : "error"}
								sx={{
									fontSize: "1rem",
									fontWeight: "bold",
									px: 2,
									py: 1,
									height: "auto",
								}}
							/>
						</Box>

						{/* Progress Bar */}
						<Box sx={{ minWidth: 300, flex: 1, maxWidth: 400 }}>
							<Box display="flex" justifyContent="space-between" mb={1}>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Questions Correct
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									{testDetails.correctAnswers} of {testDetails.totalQuestions}
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={correctPercentage}
								sx={{
									height: 12,
									borderRadius: 6,
									backgroundColor: "rgba(255,255,255,0.3)",
									"& .MuiLinearProgress-bar": {
										backgroundColor: "rgba(255,255,255,0.9)",
										borderRadius: 6,
									},
								}}
							/>
						</Box>
					</Box>
				</Paper>

				{/* Test Metadata */}
				<Grid container spacing={3} sx={{ mb: 4 }}>
					{[
						{
							icon: SubjectIcon,
							label: "Subject",
							value: testDetails.subject || "N/A",
						},
						{
							icon: CalendarIcon,
							label: "Date Taken",
							value: formatDate(testDetails.submittedAt),
						},
						{
							icon: TimerIcon,
							label: "Duration",
							value: `${testDetails.duration || "N/A"} minutes`,
						},
						{
							icon: ScoreIcon,
							label: "Points",
							value: `${testDetails.totalPoints}/${testDetails.maxPossiblePoints}`,
						},
					].map((item, index) => (
						<Grid item xs={12} sm={6} md={3} key={index}>
							<Paper
								elevation={2}
								sx={{
									p: 3,
									borderRadius: 3,
									textAlign: "center",
									background: theme.palette.background.paper,
									border: `1px solid ${theme.palette.divider}`,
									transition: "all 0.3s ease",
									"&:hover": {
										transform: "translateY(-2px)",
										boxShadow: theme.shadows[4],
									},
								}}
							>
								<item.icon
									sx={{
										fontSize: 32,
										color: theme.palette.primary.main,
										mb: 1,
									}}
								/>
								<Typography variant="body2" color="text.secondary" mb={0.5}>
									{item.label}
								</Typography>
								<Typography variant="h6" fontWeight="bold">
									{item.value}
								</Typography>
							</Paper>
						</Grid>
					))}
				</Grid>

				{/* Questions Section */}
				<Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
					Questions & Answers
				</Typography>

				{testDetails.questions && testDetails.questions.length > 0 ? (
					<Stack spacing={4}>
						{testDetails.questions.map((question, index) => {
							const isMultipleChoice =
								question.type === "multiple-choice" && !question.isTextAnswer;
							const studentAnswer = question.answer;
							const hasAnswerOptions =
								question.answers && question.answers.length > 0;

							return (
								<Card
									key={question._id || index}
									elevation={3}
									sx={{
										borderRadius: 3,
										overflow: "hidden",
										border: `2px solid ${
											question.isCorrect
												? theme.palette.success.light
												: theme.palette.error.light
										}`,
									}}
								>
									{/* Question Header */}
									<CardHeader
										sx={{
											background: question.isCorrect
												? `linear-gradient(135deg, ${theme.palette.success.light}20 0%, ${theme.palette.success.main}10 100%)`
												: `linear-gradient(135deg, ${theme.palette.error.light}20 0%, ${theme.palette.error.main}10 100%)`,
											borderBottom: `1px solid ${theme.palette.divider}`,
										}}
										title={
											<Box
												display="flex"
												alignItems="center"
												justifyContent="space-between"
											>
												<Typography variant="h6" fontWeight="bold">
													Question {index + 1}
												</Typography>
												<Chip
													label={question.isCorrect ? "Correct" : "Incorrect"}
													color={question.isCorrect ? "success" : "error"}
													icon={
														question.isCorrect ? <CorrectIcon /> : <WrongIcon />
													}
													sx={{ fontWeight: "bold" }}
												/>
											</Box>
										}
										subheader={
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 1 }}
											>
												{question.isTextAnswer
													? "Text Answer"
													: "Multiple Choice"}{" "}
												•{question.points}/{question.maxPoints} points
											</Typography>
										}
									/>

									<CardContent sx={{ p: 4 }}>
										<Grid container spacing={4}>
											{/* Left Column - Question & Answers */}
											<Grid item xs={12} lg={7}>
												{/* Question Text */}
												<Paper
													elevation={0}
													sx={{
														p: 3,
														mb: 3,
														borderRadius: 2,
														background:
															theme.palette.mode === "dark"
																? "rgba(255,255,255,0.05)"
																: "rgba(0,0,0,0.02)",
														border: `1px solid ${theme.palette.divider}`,
													}}
												>
													<Typography
														variant="h6"
														fontWeight="medium"
														color="text.primary"
													>
														{question.body}
													</Typography>
												</Paper>

												{/* Multiple Choice Options */}
												{isMultipleChoice && hasAnswerOptions && (
													<Box>
														<Typography
															variant="h6"
															fontWeight="bold"
															gutterBottom
															color="primary.main"
															sx={{ mb: 2 }}
														>
															Answer Options
														</Typography>
														<FormControl
															component="fieldset"
															sx={{ width: "100%" }}
														>
															<RadioGroup value={studentAnswer}>
																{question.answers.map((option, optIndex) => {
																	const isSelected =
																		studentAnswer === option.body;
																	const isCorrect = option.isCorrect;

																	return (
																		<Paper
																			key={optIndex}
																			elevation={1}
																			sx={{
																				mb: 2,
																				p: 2,
																				borderRadius: 2,
																				border: `2px solid ${
																					isSelected
																						? isCorrect
																							? theme.palette.success.main
																							: theme.palette.error.main
																						: isCorrect
																						? theme.palette.success.light
																						: theme.palette.divider
																				}`,
																				background: isSelected
																					? isCorrect
																						? `${theme.palette.success.light}20`
																						: `${theme.palette.error.light}20`
																					: isCorrect
																					? `${theme.palette.success.light}10`
																					: theme.palette.background.paper,
																				transition: "all 0.2s ease",
																			}}
																		>
																			<Box
																				display="flex"
																				alignItems="center"
																				justifyContent="space-between"
																			>
																				<FormControlLabel
																					value={option.body}
																					control={
																						<Radio
																							checked={isSelected}
																							disabled
																							color={
																								isSelected && isCorrect
																									? "success"
																									: isSelected
																									? "error"
																									: "default"
																							}
																						/>
																					}
																					label={
																						<Typography
																							variant="body1"
																							color="text.primary"
																							fontWeight={
																								isSelected || isCorrect
																									? "medium"
																									: "normal"
																							}
																						>
																							{option.body}
																						</Typography>
																					}
																					sx={{ flex: 1, m: 0 }}
																				/>
																				{isCorrect && (
																					<Chip
																						label="Correct"
																						color="success"
																						size="small"
																						icon={<CorrectIcon />}
																						sx={{ ml: 2, fontWeight: "bold" }}
																					/>
																				)}
																				{isSelected && !isCorrect && (
																					<Chip
																						label="Your Choice"
																						color="error"
																						size="small"
																						icon={<WrongIcon />}
																						sx={{ ml: 2, fontWeight: "bold" }}
																					/>
																				)}
																			</Box>
																		</Paper>
																	);
																})}
															</RadioGroup>
														</FormControl>
													</Box>
												)}

												{/* Text Answer */}
												{question.isTextAnswer && (
													<Box>
														<Typography
															variant="h6"
															fontWeight="bold"
															gutterBottom
															color="primary.main"
															sx={{ mb: 2 }}
														>
															Your Answer
														</Typography>
														<Paper
															elevation={1}
															sx={{
																p: 3,
																borderRadius: 2,
																border: `1px solid ${theme.palette.divider}`,
																background: theme.palette.background.paper,
															}}
														>
															<Typography variant="body1" color="text.primary">
																{studentAnswer || "No answer provided"}
															</Typography>
														</Paper>
													</Box>
												)}
											</Grid>

											{/* Right Column - Teacher Feedback */}
											<Grid item xs={12} lg={5}>
												<Paper
													elevation={2}
													sx={{
														p: 3,
														height: "fit-content",
														borderRadius: 3,
														background: question.feedback
															? `linear-gradient(135deg, ${theme.palette.info.light}15 0%, ${theme.palette.info.main}08 100%)`
															: theme.palette.mode === "dark"
															? "rgba(255,255,255,0.02)"
															: "rgba(0,0,0,0.02)",
														border: `1px solid ${
															question.feedback
																? theme.palette.info.light
																: theme.palette.divider
														}`,
													}}
												>
													<Box display="flex" alignItems="center" mb={2}>
														<FeedbackIcon
															sx={{
																mr: 1,
																color: question.feedback
																	? theme.palette.info.main
																	: theme.palette.text.secondary,
															}}
														/>
														<Typography
															variant="h6"
															fontWeight="bold"
															color={
																question.feedback
																	? "info.main"
																	: "text.secondary"
															}
														>
															Teacher&apos;s Feedback
														</Typography>
													</Box>
													{question.feedback ? (
														<Typography
															variant="body1"
															color="text.primary"
															sx={{
																fontStyle: "italic",
																lineHeight: 1.6,
															}}
														>
															{question.feedback}
														</Typography>
													) : (
														<Typography
															variant="body1"
															color="text.secondary"
															sx={{ fontStyle: "italic" }}
														>
															No feedback provided for this question
														</Typography>
													)}
												</Paper>
											</Grid>
										</Grid>
									</CardContent>
								</Card>
							);
						})}
					</Stack>
				) : (
					<Paper
						sx={{
							p: 6,
							borderRadius: 3,
							textAlign: "center",
							background: theme.palette.background.paper,
						}}
					>
						<Typography variant="h6" color="text.secondary">
							No question details available
						</Typography>
					</Paper>
				)}
			</Container>
		</Box>
	);
};

export default TestResults;

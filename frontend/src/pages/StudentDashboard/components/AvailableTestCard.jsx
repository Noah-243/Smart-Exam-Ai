import PropTypes from "prop-types";
import {
	Box,
	Card,
	CardContent,
	Button,
	Typography,
	Grid,
	Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Assignment as AssignmentIcon,
	CalendarToday as CalendarTodayIcon,
	Timer as TimerIcon,
	QuestionAnswer as QuestionAnswerIcon,
	PlayArrow as PlayArrowIcon,
	School as SchoolIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/routeConfig.jsx";
import axiosInstance from "../../../utils/axiosInstance";

const AvailableTestCard = ({ availableTestData, user }) => {
	const navigate = useNavigate();
	const theme = useTheme();

	const handleStartTest = () => {
		console.log("Starting test from dashboard panel");
		console.log("Available test data structure:", {
			fullData: availableTestData,
			testData: availableTestData?.data,
			testId: availableTestData?.data?._id,
			routeWithId: ROUTES.TAKE_TEST.replace(
				":scheduledTestId",
				availableTestData?.data?._id
			),
		});

		// Extract test ID, handling different possible structures
		const testId =
			availableTestData?.data?._id ||
			availableTestData?.data?.test?._id ||
			availableTestData?.data?.scheduledTest?._id;

		console.log("Using test ID:", testId);

		if (!testId) {
			console.error("No valid test ID found in the available test data");
			alert("Could not start test: Invalid test ID");
			return;
		}

		// Ensure authentication token is set
		if (user?.token) {
			// Set the authorization header
			axiosInstance.defaults.headers.common[
				"Authorization"
			] = `Bearer ${user.token}`;
			// Navigate to the test taking page with the correct route
			navigate(ROUTES.TAKE_TEST.replace(":scheduledTestId", testId));
		} else {
			// Try to refresh from localStorage
			try {
				const storedUserData = JSON.parse(localStorage.getItem("SES-USER"));
				if (storedUserData?.token) {
					axiosInstance.defaults.headers.common[
						"Authorization"
					] = `Bearer ${storedUserData.token}`;
					navigate(ROUTES.TAKE_TEST.replace(":scheduledTestId", testId));
				} else {
					console.error("No auth token found for test");
					navigate(ROUTES.LOGIN);
				}
			} catch (error) {
				console.error("Error refreshing auth:", error);
				navigate(ROUTES.LOGIN);
			}
		}
	};

	if (!availableTestData?.data) {
		return null;
	}

	return (
		<Grid item xs={12}>
			<Card
				sx={{
					mb: 3,
					bgcolor: theme.palette.background.paper,
					borderRadius: 3,
					boxShadow: theme.shadows[3],
					border: `1px solid ${theme.palette.success.main}`,
				}}
			>
				<CardContent sx={{ p: 3 }}>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						flexWrap="wrap"
					>
						<Box
							display="flex"
							alignItems="center"
							sx={{ mb: { xs: 2, md: 0 } }}
						>
							<Card
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 70,
									height: 70,
									borderRadius: "50%",
									mr: 3,
									boxShadow: 2,
									bgcolor: theme.palette.success.main,
									color: theme.palette.success.contrastText,
								}}
							>
								<AssignmentIcon sx={{ fontSize: 40 }} />
							</Card>
							<Box>
								<Typography
									variant="h5"
									gutterBottom
									fontWeight="bold"
									color="text.primary"
								>
									{availableTestData.data.test?.title ||
										availableTestData.data.name ||
										"Test Available"}
								</Typography>
								<Box
									display="flex"
									alignItems="center"
									flexWrap="wrap"
									gap={2}
									mb={1}
								>
									<Box display="flex" alignItems="center">
										<SchoolIcon
											fontSize="small"
											sx={{ mr: 0.5, color: theme.palette.success.main }}
										/>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											color="text.secondary"
										>
											{availableTestData.data.test?.subject?.name ||
												availableTestData.data.subject?.name ||
												"General"}
										</Typography>
									</Box>
									<Box display="flex" alignItems="center">
										<TimerIcon
											fontSize="small"
											sx={{ mr: 0.5, color: theme.palette.success.main }}
										/>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											color="text.secondary"
										>
											{availableTestData.data.duration} minutes
										</Typography>
									</Box>
									<Box display="flex" alignItems="center">
										<QuestionAnswerIcon
											fontSize="small"
											sx={{ mr: 0.5, color: theme.palette.success.main }}
										/>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											color="text.secondary"
										>
											{availableTestData.data.questionCount} questions
										</Typography>
									</Box>
								</Box>
								<Box display="flex" alignItems="center" mt={1}>
									<Chip
										icon={<CalendarTodayIcon fontSize="small" />}
										label={`Available until: ${
											availableTestData.data.formattedEndTime || "N/A"
										}`}
										variant="outlined"
										color="success"
										sx={{
											borderRadius: 4,
											fontWeight: "medium",
											px: 1,
										}}
									/>
								</Box>
							</Box>
						</Box>
						<Button
							variant="contained"
							color="success"
							size="large"
							onClick={handleStartTest}
							startIcon={<PlayArrowIcon />}
							sx={{
								borderRadius: 2,
								px: 3,
								py: 1,
								fontWeight: "bold",
								boxShadow: 2,
							}}
						>
							Start Test
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Grid>
	);
};

AvailableTestCard.propTypes = {
	availableTestData: PropTypes.object,
	user: PropTypes.object,
};

export default AvailableTestCard;

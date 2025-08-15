import { useNavigate } from "react-router-dom";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Button,
	Typography,
	CircularProgress,
	Alert,
	Chip,
	Grid,
	Paper,
	Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import {
	History as HistoryIcon,
	Visibility as ViewResultsIcon,
	CheckCircle as GradedIcon,
	HourglassEmpty as PendingIcon,
	Assignment as TestIcon,
	School as SubjectIcon,
	CalendarToday as DateIcon,
	TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { getStudentPastTests } from "../../../api/studentDashboard";
import { formatDate } from "../../../utils/formatDate";
import { ROUTES } from "../../../routes/routeConfig";
import { useTranslation } from "react-i18next";

const RecentTests = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const theme = useTheme();

	// Fetch recent past tests
	const {
		data: recentTestsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["recentTests"],
		queryFn: getStudentPastTests,
	});

	const handleViewResults = (testId) => {
		navigate(`/test-results/${testId}`);
	};

	const handleViewAllTests = () => {
		navigate(ROUTES.PAST_TESTS);
	};

	// Helper for score color
	const getScoreColor = (score) => {
		if (score >= 80) return "success";
		if (score >= 60) return "primary";
		if (score >= 40) return "warning";
		return "error";
	};

	// Get recent tests (limit to 3 most recent for cleaner view)
	const recentTests = recentTestsData?.data?.slice(0, 3) || [];

	return (
		<Card
			sx={{
				borderRadius: 3,
				bgcolor: theme.palette.background.paper,
				boxShadow: theme.shadows[3],
			}}
		>
			<CardHeader
				sx={{
					bgcolor: theme.palette.background.elevated,
					py: 2,
					borderBottom: `1px solid ${theme.palette.divider}`,
				}}
				title={
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<Box display="flex" alignItems="center">
							<HistoryIcon
								sx={{
									mr: 1.5,
									fontSize: 28,
									color: theme.palette.primary.main,
								}}
							/>
							<Typography variant="h5" fontWeight="bold">
								{t("recentTests.title")}
							</Typography>
						</Box>
						{recentTests.length > 0 && (
							<Button
								variant="contained"
								size="small"
								onClick={handleViewAllTests}
								startIcon={<TrendingUpIcon />}
								sx={{
									borderRadius: 2,
									fontWeight: "bold",
									textTransform: "none",
									px: 2,
								}}
							>
								{t("recentTests.viewAll")}
							</Button>
						)}
					</Box>
				}
			/>
			<CardContent sx={{ p: 3 }}>
				{isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress size={40} />
					</Box>
				) : error ? (
					<Alert severity="error" sx={{ borderRadius: 2 }}>
						{t("recentTests.error")} {error.message}
					</Alert>
				) : (
					<>
						{recentTests.length > 0 ? (
							<Grid container spacing={2}>
								{recentTests.map((test, index) => (
									<Grid item xs={12} key={test._id}>
										<Paper
											elevation={1}
											sx={{
												p: 3,
												borderRadius: 3,
												background: `linear-gradient(135deg, ${
													theme.palette.mode === "dark"
														? "rgba(255,255,255,0.02)"
														: "rgba(0,0,0,0.01)"
												} 0%, ${
													theme.palette.mode === "dark"
														? "rgba(255,255,255,0.05)"
														: "rgba(0,0,0,0.02)"
												} 100%)`,
												border: `1px solid ${theme.palette.divider}`,
												transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
												cursor:
													test.status === "graded" ? "pointer" : "default",
												"&:hover": {
													transform:
														test.status === "graded"
															? "translateY(-2px)"
															: "none",
													boxShadow:
														test.status === "graded"
															? `0 8px 25px ${
																	theme.palette.mode === "dark"
																		? "rgba(0,0,0,0.4)"
																		: "rgba(0,0,0,0.15)"
															  }`
															: theme.shadows[1],
													borderColor:
														test.status === "graded"
															? theme.palette.primary.main
															: theme.palette.divider,
												},
											}}
											onClick={() =>
												test.status === "graded" && handleViewResults(test._id)
											}
										>
											<Box
												display="flex"
												alignItems="center"
												justifyContent="space-between"
											>
												{/* Left side - Test info */}
												<Box display="flex" alignItems="center" flex={1}>
													<Box
														sx={{
															width: 48,
															height: 48,
															borderRadius: 2,
															background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															mr: 2,
															boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
														}}
													>
														<TestIcon sx={{ color: "white", fontSize: 24 }} />
													</Box>
													<Box flex={1}>
														<Typography
															variant="h6"
															fontWeight="bold"
															sx={{
																mb: 0.5,
																fontSize: "1.1rem",
																lineHeight: 1.2,
															}}
														>
															{test.testName}
														</Typography>
														<Box
															display="flex"
															alignItems="center"
															gap={2}
															mb={1}
														>
															<Box display="flex" alignItems="center">
																<SubjectIcon
																	fontSize="small"
																	sx={{
																		mr: 0.5,
																		color: theme.palette.text.secondary,
																	}}
																/>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	{test.subject}
																</Typography>
															</Box>
															<Box display="flex" alignItems="center">
																<DateIcon
																	fontSize="small"
																	sx={{
																		mr: 0.5,
																		color: theme.palette.text.secondary,
																	}}
																/>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	{formatDate(test.submittedAt, {
																		month: "short",
																		day: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	})}
																</Typography>
															</Box>
														</Box>
													</Box>
												</Box>

												{/* Right side - Score and status */}
												<Box display="flex" alignItems="center" gap={2}>
													{/* Score */}
													{test.score !== null && test.score !== undefined ? (
														<Box textAlign="center">
															<Typography
																variant="caption"
																color="text.secondary"
																display="block"
															>
																{t("recentTests.score")}
															</Typography>
															<Chip
																label={`${test.score}%`}
																color={getScoreColor(test.score)}
																sx={{
																	fontWeight: "bold",
																	fontSize: "0.9rem",
																	height: 32,
																	minWidth: 60,
																}}
															/>
														</Box>
													) : (
														<Box textAlign="center">
															<Typography
																variant="caption"
																color="text.secondary"
																display="block"
															>
																{t("recentTests.score")}
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
																sx={{ fontStyle: "italic" }}
															>
																{t("recentTests.pending")}
															</Typography>
														</Box>
													)}

													{/* Status & Action */}
													<Box textAlign="center">
														{test.status === "graded" ? (
															<>
																<Chip
																	icon={<GradedIcon />}
																	label={t("recentTests.graded")}
																	color="success"
																	size="small"
																	sx={{ mb: 1, fontWeight: "medium" }}
																/>
																<Button
																	variant="outlined"
																	startIcon={<ViewResultsIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleViewResults(test._id);
																	}}
																	sx={{
																		borderRadius: 2,
																		fontWeight: "bold",
																		textTransform: "none",
																		fontSize: "0.8rem",
																		display: "block",
																		width: "100%",
																	}}
																>
																	{t("recentTests.viewResults")}
																</Button>
															</>
														) : (
															<>
																<Chip
																	icon={<PendingIcon />}
																	label={t("recentTests.pending")}
																	color="warning"
																	size="small"
																	sx={{ mb: 1, fontWeight: "medium" }}
																/>
																<Typography
																	variant="caption"
																	color="text.secondary"
																	sx={{
																		fontStyle: "italic",
																		display: "block",
																		textAlign: "center",
																	}}
																>
																	{t("recentTests.awaitingReview")}
																</Typography>
															</>
														)}
													</Box>
												</Box>
											</Box>
										</Paper>
										{index < recentTests.length - 1 && (
											<Divider sx={{ my: 2, opacity: 0.3 }} />
										)}
									</Grid>
								))}
							</Grid>
						) : (
							<Box
								sx={{
									py: 6,
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									alignItems: "center",
									textAlign: "center",
								}}
							>
								<Box
									sx={{
										width: 80,
										height: 80,
										borderRadius: "50%",
										background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mb: 3,
									}}
								>
									<HistoryIcon
										sx={{ fontSize: 40, color: theme.palette.primary.main }}
									/>
								</Box>
								<Typography
									variant="h6"
									color="text.primary"
									fontWeight="medium"
									mb={1}
								>
									{t("recentTests.noTestsCompletedYet")}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ maxWidth: 300 }}
								>
									{t("recentTests.completedTestsWillAppearHere")}
								</Typography>
							</Box>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default RecentTests;

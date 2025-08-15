import PropTypes from "prop-types";
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
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Grid,
	Paper,
	Badge,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	CalendarToday as CalendarTodayIcon,
	Timer as TimerIcon,
	Quiz as QuizIcon,
	PlayArrow as PlayArrowIcon,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	Visibility as ViewResultsIcon,
	History as HistoryIcon,
	School as SubjectIcon,
	CheckCircle as GradedIcon,
	HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { formatDate } from "../../../utils/formatDate";
import { useTranslation } from "react-i18next";

const UpcomingTests = ({
	isLoading,
	error,
	upcomingTests,
	pastTests = [],
	handleStartTest,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const navigate = useNavigate();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDateTests, setSelectedDateTests] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	// Helper for score color
	const getScoreColor = (score) => {
		if (score >= 80) return "success";
		if (score >= 60) return "primary";
		if (score >= 40) return "warning";
		return "error";
	};

	// Handle viewing test results
	const handleViewResults = (testId) => {
		navigate(`/test-results/${testId}`);
		setDialogOpen(false);
	};

	// Handle calendar day click
	const handleDayClick = (dayTests) => {
		if (dayTests && dayTests.length > 0) {
			setSelectedDateTests(dayTests);
			setDialogOpen(true);
		}
	};

	// Calendar component
	const Calendar = ({ upcomingTests, pastTests }) => {
		const today = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		// Get first day of month and days in month
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		// Create calendar grid
		const days = [];
		const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

		// Combine and process all tests for this month
		const allTests = [
			...upcomingTests.map((test) => ({
				...test,
				type: "upcoming",
				scheduledAt: test.scheduledAt,
			})),
			...pastTests.map((test) => ({
				...test,
				type: "past",
				scheduledAt: test.submittedAt,
			})),
		];

		// Get tests for this month
		const testsThisMonth = allTests.filter((test) => {
			const testDate = new Date(test.scheduledAt);
			return testDate.getMonth() === month && testDate.getFullYear() === year;
		});

		// Create test map by date
		const testsByDate = {};
		testsThisMonth.forEach((test) => {
			const testDate = new Date(test.scheduledAt);
			const dateKey = testDate.getDate();
			if (!testsByDate[dateKey]) {
				testsByDate[dateKey] = [];
			}
			testsByDate[dateKey].push(test);
		});

		// Fill calendar grid
		for (let i = 0; i < totalCells; i++) {
			const dayNumber = i - startingDayOfWeek + 1;
			const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
			const isToday =
				isCurrentMonth &&
				dayNumber === today.getDate() &&
				month === today.getMonth() &&
				year === today.getFullYear();

			const dayTests = isCurrentMonth ? testsByDate[dayNumber] : null;
			const hasTests = dayTests && dayTests.length > 0;
			const testCount = hasTests ? dayTests.length : 0;

			// Determine the primary test type for styling
			const hasPastTests = dayTests?.some((test) => test.type === "past");
			const hasUpcomingTests = dayTests?.some(
				(test) => test.type === "upcoming"
			);

			let backgroundColor, hoverBackground;
			if (isToday) {
				backgroundColor = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
				hoverBackground = `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`;
			} else if (hasPastTests && hasUpcomingTests) {
				// Mixed - both past and upcoming tests
				backgroundColor = `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.warning.light} 100%)`;
				hoverBackground = `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.warning.main} 100%)`;
			} else if (hasPastTests) {
				// Past tests only
				backgroundColor = `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`;
				hoverBackground = `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`;
			} else if (hasUpcomingTests) {
				// Upcoming tests only
				backgroundColor = `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`;
				hoverBackground = `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`;
			} else {
				backgroundColor =
					theme.palette.mode === "dark"
						? theme.palette.background.elevated || "#2B3138"
						: theme.palette.background.paper;
				hoverBackground =
					theme.palette.mode === "dark"
						? "rgba(255,255,255,0.05)"
						: "rgba(0,0,0,0.02)";
			}

			days.push(
				<Box
					key={i}
					onClick={() => handleDayClick(dayTests)}
					sx={{
						minHeight: 50,
						border: `1px solid ${theme.palette.divider}`,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						position: "relative",
						borderRadius: 1.5,
						margin: 0.5,
						background: backgroundColor,
						color:
							isToday || hasTests
								? theme.palette.getContrastText(
										isToday
											? theme.palette.primary.main
											: hasPastTests
											? theme.palette.info.main
											: theme.palette.success.main
								  )
								: theme.palette.text.primary,
						cursor: hasTests ? "pointer" : "default",
						transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
						boxShadow:
							isToday || hasTests
								? `0 4px 12px ${
										theme.palette.mode === "dark"
											? "rgba(0,0,0,0.3)"
											: "rgba(0,0,0,0.1)"
								  }`
								: "none",
						"&:hover":
							hasTests || isToday
								? {
										transform: "translateY(-2px) scale(1.02)",
										boxShadow: `0 8px 25px ${
											theme.palette.mode === "dark"
												? "rgba(0,0,0,0.4)"
												: "rgba(0,0,0,0.15)"
										}`,
										background: hoverBackground,
								  }
								: {
										background: hoverBackground,
								  },
					}}
				>
					{isCurrentMonth && (
						<>
							<Typography
								variant="body1"
								fontWeight={isToday ? "bold" : hasTests ? "medium" : "normal"}
								sx={{
									fontSize: isToday ? "1.1rem" : "1rem",
									textShadow:
										isToday || hasTests ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
								}}
							>
								{dayNumber}
							</Typography>
							{hasTests && (
								<Badge
									badgeContent={testCount}
									color="error"
									sx={{
										position: "absolute",
										top: 4,
										right: 4,
										"& .MuiBadge-badge": {
											fontSize: "0.7rem",
											height: 18,
											minWidth: 18,
											fontWeight: "bold",
											background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
											boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
										},
									}}
								/>
							)}
						</>
					)}
				</Box>
			);
		}

		const monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		return (
			<Box
				sx={{
					background: `linear-gradient(145deg, ${
						theme.palette.mode === "dark"
							? "rgba(255,255,255,0.02)"
							: "rgba(0,0,0,0.01)"
					} 0%, ${
						theme.palette.mode === "dark"
							? "rgba(255,255,255,0.05)"
							: "rgba(0,0,0,0.02)"
					} 100%)`,
					borderRadius: 3,
					p: 3,
					backdropFilter: "blur(10px)",
					border: `1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255,255,255,0.1)"
							: "rgba(0,0,0,0.05)"
					}`,
				}}
			>
				{/* Calendar Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
						p: 2,
						background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
						borderRadius: 2,
						color: theme.palette.primary.contrastText,
						boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
					}}
				>
					<Button
						size="medium"
						onClick={() => setCurrentDate(new Date(year, month - 1))}
						sx={{
							minWidth: 40,
							height: 40,
							borderRadius: 2,
							background: "rgba(255,255,255,0.2)",
							color: "inherit",
							backdropFilter: "blur(10px)",
							border: "1px solid rgba(255,255,255,0.3)",
							transition: "all 0.3s ease",
							"&:hover": {
								background: "rgba(255,255,255,0.3)",
								transform: "scale(1.05)",
							},
						}}
					>
						<ChevronLeftIcon />
					</Button>
					<Typography
						variant="h5"
						fontWeight="bold"
						sx={{
							textShadow: "0 2px 4px rgba(0,0,0,0.2)",
							letterSpacing: "0.5px",
						}}
					>
						{monthNames[month]} {year}
					</Typography>
					<Button
						size="medium"
						onClick={() => setCurrentDate(new Date(year, month + 1))}
						sx={{
							minWidth: 40,
							height: 40,
							borderRadius: 2,
							background: "rgba(255,255,255,0.2)",
							color: "inherit",
							backdropFilter: "blur(10px)",
							border: "1px solid rgba(255,255,255,0.3)",
							transition: "all 0.3s ease",
							"&:hover": {
								background: "rgba(255,255,255,0.3)",
								transform: "scale(1.05)",
							},
						}}
					>
						<ChevronRightIcon />
					</Button>
				</Box>

				{/* Week day headers */}
				<Grid container sx={{ mb: 2 }}>
					{weekDays.map((day) => (
						<Grid item xs key={day} sx={{ textAlign: "center" }}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								fontWeight="bold"
								sx={{
									fontSize: "0.9rem",
									letterSpacing: "1px",
									textTransform: "uppercase",
									opacity: 0.8,
								}}
							>
								{day}
							</Typography>
						</Grid>
					))}
				</Grid>

				{/* Calendar grid */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(7, 1fr)",
						gap: 0.5,
						mb: 3,
					}}
				>
					{days}
				</Box>

				{/* Legend */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						gap: 2,
						p: 2,
						background:
							theme.palette.mode === "dark"
								? "rgba(255,255,255,0.03)"
								: "rgba(0,0,0,0.02)",
						borderRadius: 2,
						border: `1px solid ${theme.palette.divider}`,
						flexWrap: "wrap",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 16,
								height: 16,
								background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
								borderRadius: 2,
								boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
							}}
						/>
						<Typography
							variant="body2"
							color="text.secondary"
							fontWeight="medium"
						>
							{t("today")}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 16,
								height: 16,
								background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
								borderRadius: 2,
								boxShadow: `0 2px 8px ${theme.palette.success.main}40`,
							}}
						/>
						<Typography
							variant="body2"
							color="text.secondary"
							fontWeight="medium"
						>
							{t("upcomingTest")}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 16,
								height: 16,
								background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
								borderRadius: 2,
								boxShadow: `0 2px 8px ${theme.palette.info.main}40`,
							}}
						/>
						<Typography
							variant="body2"
							color="text.secondary"
							fontWeight="medium"
						>
							{t("pastTest")}
						</Typography>
					</Box>
				</Box>
			</Box>
		);
	};

	// Add PropTypes for Calendar component
	Calendar.propTypes = {
		upcomingTests: PropTypes.arrayOf(
			PropTypes.shape({
				scheduledAt: PropTypes.string.isRequired,
				_id: PropTypes.string.isRequired,
			})
		).isRequired,
		pastTests: PropTypes.arrayOf(
			PropTypes.shape({
				submittedAt: PropTypes.string.isRequired,
				_id: PropTypes.string.isRequired,
			})
		).isRequired,
	};

	return (
		<>
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
						"& .MuiCardHeader-title": {
							fontSize: "1.25rem",
							fontWeight: 600,
							color: theme.palette.text.primary,
						},
					}}
					title={
						<Box display="flex" alignItems="center">
							<CalendarTodayIcon
								sx={{
									mr: 1.5,
									fontSize: 28,
									color: theme.palette.primary.main,
								}}
							/>
							<Typography variant="h5">{t("testCalendar")}</Typography>
						</Box>
					}
				/>
				<CardContent sx={{ p: 3 }}>
					{isLoading ? (
						<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
							<CircularProgress />
						</Box>
					) : error ? (
						<Alert severity="error">Error loading tests: {error.message}</Alert>
					) : (
						<Grid container spacing={3}>
							{/* Left side - Test Table */}
							<Grid item xs={12} md={6}>
								<Typography variant="h6" gutterBottom fontWeight="bold">
									{t("upcomingTests")}
								</Typography>
								{upcomingTests.length > 0 ? (
									<TableContainer
										component={Paper}
										sx={{ maxHeight: 400, boxShadow: 1 }}
									>
										<Table stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell
														sx={{
															fontWeight: "bold",
															bgcolor: "background.elevated",
														}}
													>
														<Box display="flex" alignItems="center">
															<QuizIcon
																sx={{
																	mr: 1,
																	color: "primary.main",
																	fontSize: 18,
																}}
															/>
															{t("test")}
														</Box>
													</TableCell>
													<TableCell
														sx={{
															fontWeight: "bold",
															bgcolor: "background.elevated",
														}}
													>
														<Box display="flex" alignItems="center">
															<CalendarTodayIcon
																sx={{
																	mr: 1,
																	color: "primary.main",
																	fontSize: 18,
																}}
															/>
															{t("date")}
														</Box>
													</TableCell>
													<TableCell
														sx={{
															fontWeight: "bold",
															bgcolor: "background.elevated",
														}}
													>
														<Box display="flex" alignItems="center">
															<TimerIcon
																sx={{
																	mr: 1,
																	color: "primary.main",
																	fontSize: 18,
																}}
															/>
															{t("duration")}
														</Box>
													</TableCell>
													<TableCell
														sx={{
															fontWeight: "bold",
															bgcolor: "background.elevated",
														}}
													>
														{t("status")}
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{upcomingTests.map((test) => {
													const testDate = new Date(test.scheduledAt);
													const now = new Date();
													const diffInHours =
														(testDate - now) / (1000 * 60 * 60);

													let status = "Upcoming";
													let statusColor = "info";

													if (diffInHours < 0) {
														status = "Missed";
														statusColor = "error";
													} else if (diffInHours < 24) {
														status = "Today";
														statusColor = "warning";
													}

													return (
														<TableRow
															key={test._id}
															sx={{
																"&:hover": {
																	bgcolor: theme.palette.action.hover,
																},
															}}
														>
															<TableCell>
																<Box>
																	<Typography
																		variant="subtitle2"
																		fontWeight="medium"
																	>
																		{test.test?.title || "Untitled Test"}
																	</Typography>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																	>
																		{test.test?.subject?.name || "General"}
																	</Typography>
																</Box>
															</TableCell>
															<TableCell>
																<Typography variant="body2">
																	{testDate.toLocaleDateString("en-US", {
																		month: "short",
																		day: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	})}
																</Typography>
															</TableCell>
															<TableCell>
																<Typography variant="body2">
																	{test.duration} min
																</Typography>
															</TableCell>
															<TableCell>
																<Chip
																	label={status}
																	color={statusColor}
																	size="small"
																	sx={{ fontWeight: "bold" }}
																/>
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</TableContainer>
								) : (
									<Box sx={{ textAlign: "center", py: 4 }}>
										<CalendarTodayIcon
											sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
										/>
										<Typography variant="body1" color="text.secondary">
											{t("noUpcomingTestsScheduled")}
										</Typography>
									</Box>
								)}

								{upcomingTests.length > 0 && (
									<Box sx={{ mt: 2, textAlign: "center" }}>
										<Button
											variant="contained"
											startIcon={<PlayArrowIcon />}
											onClick={handleStartTest}
											sx={{
												bgcolor: theme.palette.primary.main,
												color: theme.palette.primary.contrastText,
												fontWeight: "bold",
												borderRadius: 2,
												px: 3,
												"&:hover": {
													bgcolor: theme.palette.primary.dark,
												},
											}}
										>
											{t("takeAvailableTest")}
										</Button>
									</Box>
								)}
							</Grid>

							{/* Right side - Calendar */}
							<Grid item xs={12} md={6}>
								<Typography variant="h6" gutterBottom fontWeight="bold">
									{t("calendarView")}
								</Typography>
								<Paper sx={{ p: 2, bgcolor: "background.elevated" }}>
									<Calendar
										upcomingTests={upcomingTests}
										pastTests={pastTests}
									/>
								</Paper>
							</Grid>
						</Grid>
					)}
				</CardContent>
			</Card>

			{/* Test Details Dialog */}
			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						background: `linear-gradient(145deg, ${
							theme.palette.background.paper
						} 0%, ${
							theme.palette.background.elevated ||
							theme.palette.background.paper
						} 100%)`,
					},
				}}
			>
				<DialogTitle
					sx={{
						background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
						color: theme.palette.primary.contrastText,
						textAlign: "center",
						fontWeight: "bold",
					}}
				>
					<CalendarTodayIcon sx={{ mr: 1, verticalAlign: "middle" }} />
					{t("testsOn")}
					{selectedDateTests &&
						selectedDateTests.length > 0 &&
						formatDate(
							selectedDateTests[0].scheduledAt ||
								selectedDateTests[0].submittedAt,
							{
								weekday: "long",
								month: "long",
								day: "numeric",
								year: "numeric",
							}
						)}
				</DialogTitle>
				<DialogContent sx={{ p: 3 }}>
					{selectedDateTests && (
						<List>
							{selectedDateTests.map((test, index) => (
								<Box key={test._id}>
									<ListItem
										sx={{
											borderRadius: 2,
											mb: 1,
											background:
												test.type === "past"
													? `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.info.main}10 100%)`
													: `linear-gradient(135deg, ${theme.palette.success.light}20 0%, ${theme.palette.success.main}10 100%)`,
											border: `1px solid ${
												test.type === "past"
													? theme.palette.info.main
													: theme.palette.success.main
											}40`,
										}}
									>
										<ListItemIcon>
											{test.type === "past" ? (
												<HistoryIcon color="info" />
											) : (
												<QuizIcon color="success" />
											)}
										</ListItemIcon>
										<ListItemText
											primary={
												<Box
													display="flex"
													alignItems="center"
													justifyContent="space-between"
												>
													<Typography variant="subtitle1" fontWeight="medium">
														{test.testName ||
															test.test?.title ||
															"Untitled Test"}
													</Typography>
													{test.type === "past" && test.score !== null && (
														<Chip
															label={`${test.score}%`}
															color={getScoreColor(test.score)}
															size="small"
															sx={{ fontWeight: "bold" }}
														/>
													)}
												</Box>
											}
											secondary={
												<Box>
													<Box
														display="flex"
														alignItems="center"
														gap={2}
														mt={1}
													>
														<Box display="flex" alignItems="center">
															<SubjectIcon fontSize="small" sx={{ mr: 0.5 }} />
															<Typography variant="caption">
																{test.subject ||
																	test.test?.subject?.name ||
																	"General"}
															</Typography>
														</Box>
														{test.type === "past" && (
															<Box display="flex" alignItems="center">
																{test.status === "graded" ? (
																	<GradedIcon
																		fontSize="small"
																		color="success"
																		sx={{ mr: 0.5 }}
																	/>
																) : (
																	<PendingIcon
																		fontSize="small"
																		color="warning"
																		sx={{ mr: 0.5 }}
																	/>
																)}
																<Typography variant="caption">
																	{test.status === "graded"
																		? "Graded"
																		: "Pending Review"}
																</Typography>
															</Box>
														)}
													</Box>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ mt: 1, display: "block" }}
													>
														{test.type === "past"
															? `Submitted: ${formatDate(test.submittedAt)}`
															: `Scheduled: ${formatDate(test.scheduledAt)}`}
													</Typography>
												</Box>
											}
										/>
										{test.type === "past" && test.status === "graded" && (
											<Button
												variant="contained"
												startIcon={<ViewResultsIcon />}
												size="small"
												onClick={() => handleViewResults(test._id)}
												sx={{
													ml: 2,
													borderRadius: 2,
													fontWeight: "bold",
												}}
											>
												{t("viewResults")}
											</Button>
										)}
									</ListItem>
									{index < selectedDateTests.length - 1 && (
										<Divider sx={{ my: 1 }} />
									)}
								</Box>
							))}
						</List>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button
						onClick={() => setDialogOpen(false)}
						variant="outlined"
						sx={{ borderRadius: 2 }}
					>
						{t("close")}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

UpcomingTests.propTypes = {
	isLoading: PropTypes.bool,
	error: PropTypes.object,
	upcomingTests: PropTypes.array,
	pastTests: PropTypes.array,
	handleStartTest: PropTypes.func.isRequired,
};

UpcomingTests.defaultProps = {
	upcomingTests: [],
	pastTests: [],
};

export default UpcomingTests;

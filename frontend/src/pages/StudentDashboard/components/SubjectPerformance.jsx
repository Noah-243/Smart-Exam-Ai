import PropTypes from "prop-types";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Button,
	Typography,
	CircularProgress,
	Alert,
	Avatar,
	Grid,
	LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Assessment as AssessmentIcon,
	TrendingUp as TrendingUpIcon,
	TrendingDown as TrendingDownIcon,
	TrendingFlat as TrendingFlatIcon,
	Refresh as RefreshIcon,
	School as SchoolIcon,
} from "@mui/icons-material";

const SubjectPerformance = ({
	loadingPerformance,
	performanceError,
	performanceData,
	dashboardData,
	getNestedProperty,
	refreshPerformanceData,
	handleStartTest,
}) => {
	const theme = useTheme();

	// Create a subject card component
	const SubjectCard = ({ subject }) => {
		const hasTests = subject.testCount > 0;

		const getScoreColor = (score) => {
			if (score >= 80) return theme.palette.success.main;
			if (score >= 60) return theme.palette.warning.main;
			return theme.palette.error.main;
		};

		const getTrendIcon = () => {
			if (subject.trend === "up") {
				return <TrendingUpIcon sx={{ color: "success.main", fontSize: 20 }} />;
			} else if (subject.trend === "down") {
				return <TrendingDownIcon sx={{ color: "error.main", fontSize: 20 }} />;
			} else if (subject.recentScores && subject.recentScores.length >= 2) {
				const recent = subject.recentScores[0].score;
				const previous = subject.recentScores[1].score;
				if (recent > previous) {
					return (
						<TrendingUpIcon sx={{ color: "success.main", fontSize: 20 }} />
					);
				} else if (recent < previous) {
					return (
						<TrendingDownIcon sx={{ color: "error.main", fontSize: 20 }} />
					);
				} else {
					return <TrendingFlatIcon sx={{ color: "info.main", fontSize: 20 }} />;
				}
			}
			return (
				<TrendingFlatIcon sx={{ color: "text.secondary", fontSize: 20 }} />
			);
		};

		return (
			<Card
				sx={{
					height: "100%",
					borderRadius: 3,
					bgcolor: theme.palette.background.paper,
					boxShadow: theme.shadows[2],
					border: `1px solid ${theme.palette.divider}`,
					transition: "all 0.3s ease",
					"&:hover": {
						boxShadow: theme.shadows[4],
						transform: "translateY(-2px)",
					},
				}}
			>
				<CardHeader
					avatar={
						<Avatar
							sx={{
								bgcolor: theme.palette.primary.main,
								color: theme.palette.primary.contrastText,
								width: 48,
								height: 48,
								fontSize: "1.2rem",
								fontWeight: "bold",
							}}
						>
							{subject.name.charAt(0)}
						</Avatar>
					}
					title={
						<Typography variant="h6" fontWeight="bold">
							{subject.name}
						</Typography>
					}
					subheader={
						<Typography variant="body2" color="text.secondary">
							{hasTests
								? `${subject.testCount} test${
										subject.testCount !== 1 ? "s" : ""
								  } taken`
								: "No tests taken yet"}
						</Typography>
					}
					sx={{
						bgcolor: theme.palette.background.elevated,
						"& .MuiCardHeader-title": {
							fontSize: "1.1rem",
						},
					}}
				/>
				<CardContent sx={{ pt: 2 }}>
					{hasTests ? (
						<Box>
							{/* Average Score */}
							<Box sx={{ mb: 3 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 1,
									}}
								>
									<Typography
										variant="body2"
										color="text.secondary"
										fontWeight="medium"
									>
										Average Score
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Typography
											variant="h6"
											fontWeight="bold"
											sx={{ color: getScoreColor(subject.averageScore) }}
										>
											{subject.averageScore?.toFixed(1) || "0.0"}%
										</Typography>
										{getTrendIcon()}
									</Box>
								</Box>
								<LinearProgress
									variant="determinate"
									value={subject.averageScore || 0}
									sx={{
										height: 8,
										borderRadius: 4,
										bgcolor: theme.palette.background.elevated,
										"& .MuiLinearProgress-bar": {
											bgcolor: getScoreColor(subject.averageScore),
											borderRadius: 4,
										},
									}}
								/>
							</Box>

							{/* Stats Grid */}
							<Grid container spacing={2}>
								<Grid item xs={6}>
									<Box sx={{ textAlign: "center", p: 1 }}>
										<Typography
											variant="h5"
											fontWeight="bold"
											color="primary.main"
										>
											{subject.testCount}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Tests Taken
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={6}>
									<Box sx={{ textAlign: "center", p: 1 }}>
										<Typography
											variant="h5"
											fontWeight="bold"
											color="success.main"
										>
											{subject.highestScore?.toFixed(1) || "0.0"}%
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Best Score
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</Box>
					) : (
						<Box sx={{ textAlign: "center", py: 3 }}>
							<AssessmentIcon
								sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
							/>
							<Typography variant="body2" color="text.secondary">
								No test data available
							</Typography>
						</Box>
					)}
				</CardContent>
			</Card>
		);
	};

	// Add PropTypes for SubjectCard
	SubjectCard.propTypes = {
		subject: PropTypes.shape({
			name: PropTypes.string.isRequired,
			testCount: PropTypes.number,
			averageScore: PropTypes.number,
			highestScore: PropTypes.number,
			trend: PropTypes.string,
			recentScores: PropTypes.arrayOf(
				PropTypes.shape({
					score: PropTypes.number,
				})
			),
		}).isRequired,
	};

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
					"& .MuiCardHeader-title": {
						fontSize: "1.25rem",
						fontWeight: 600,
						color: theme.palette.text.primary,
					},
				}}
				title={
					<Box display="flex" alignItems="center">
						<SchoolIcon
							sx={{ mr: 1.5, fontSize: 28, color: theme.palette.primary.main }}
						/>
						<Typography variant="h5">Subject Performance</Typography>
					</Box>
				}
				action={
					<Button
						variant="outlined"
						size="small"
						onClick={refreshPerformanceData}
						startIcon={
							loadingPerformance ? (
								<CircularProgress size={16} />
							) : (
								<RefreshIcon />
							)
						}
						disabled={loadingPerformance}
						sx={{
							mr: 2,
							bgcolor: theme.palette.primary.main,
							color: theme.palette.primary.contrastText,
							borderColor: theme.palette.primary.main,
							fontWeight: "bold",
							borderRadius: 2,
							"&:hover": {
								bgcolor: theme.palette.primary.dark,
								borderColor: theme.palette.primary.dark,
							},
						}}
					>
						{loadingPerformance ? "Refreshing..." : "Refresh"}
					</Button>
				}
			/>
			<CardContent sx={{ p: 3 }}>
				{loadingPerformance ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress size={40} />
					</Box>
				) : performanceError ? (
					<Alert severity="error" sx={{ fontSize: "1rem" }}>
						Error loading performance data: {performanceError.message}
					</Alert>
				) : (
					(() => {
						// Extract performance data from the correct structure
						const subjectPerformance =
							getNestedProperty(performanceData, "data.subjectPerformance") ||
							getNestedProperty(performanceData, "subjectPerformance") ||
							[];

						// Get dashboard stats for comparison
						const dashboardStats = getNestedProperty(
							performanceData,
							"data.stats"
						) || {
							totalTestsTaken: dashboardData?.stats?.totalTestsTaken || 0,
							averageScore: dashboardData?.stats?.averageScore || 0,
						};

						// Check if we have test data in the dashboard but not in subjects
						const hasTestsInDashboard =
							(dashboardStats.totalTestsTaken || 0) > 0;
						const hasTestsInSubjects =
							subjectPerformance &&
							subjectPerformance.some(
								(subject) => (subject.testCount || 0) > 0
							);

						// Check if student has completed tests but performance data hasn't synced yet
						const hasDataSyncIssue =
							dashboardData?.stats?.totalTestsTaken > 0 && !hasTestsInSubjects;

						if (subjectPerformance && subjectPerformance.length > 0) {
							// Filter subjects that have tests
							const subjectsWithTests = subjectPerformance.filter(
								(subject) => (subject.testCount || 0) > 0
							);

							return (
								<>
									{hasDataSyncIssue && (
										<Alert
											severity="info"
											sx={{ mb: 3, fontSize: "1rem" }}
											action={
												<Button
													color="inherit"
													size="medium"
													onClick={refreshPerformanceData}
													startIcon={
														loadingPerformance ? (
															<CircularProgress size={16} />
														) : null
													}
													disabled={loadingPerformance}
													sx={{ fontWeight: "bold" }}
												>
													Sync Data
												</Button>
											}
										>
											Your performance data needs to be synchronized. You have{" "}
											{dashboardData?.stats?.totalTestsTaken} completed test(s)
											that are not yet reflected in the subject performance.
										</Alert>
									)}

									{subjectsWithTests.length > 0 ? (
										<Grid container spacing={3}>
											{subjectsWithTests.map((subject, index) => (
												<Grid
													item
													xs={12}
													sm={6}
													md={4}
													key={subject.id || subject._id || index}
												>
													<SubjectCard subject={subject} />
												</Grid>
											))}
										</Grid>
									) : (
										<Box sx={{ textAlign: "center", py: 4 }}>
											<AssessmentIcon
												sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
											/>
											<Typography
												variant="h6"
												color="text.secondary"
												gutterBottom
											>
												No performance data yet
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mb: 3 }}
											>
												Take some tests to see your subject performance here
											</Typography>
											<Button
												variant="contained"
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
												Find Available Tests
											</Button>
										</Box>
									)}

									{/* Conditional message for data inconsistency */}
									{hasTestsInDashboard && !hasTestsInSubjects && (
										<Box sx={{ mt: 3 }}>
											<Alert
												severity="info"
												sx={{ fontSize: "1rem" }}
												action={
													<Button
														color="inherit"
														size="medium"
														onClick={refreshPerformanceData}
														sx={{ fontWeight: "bold" }}
													>
														Refresh
													</Button>
												}
											>
												Performance data will appear here after completing
												tests.
											</Alert>
										</Box>
									)}
								</>
							);
						} else {
							// This case handles when subjectPerformance is empty or null
							return (
								<Box sx={{ textAlign: "center", py: 4 }}>
									<AssessmentIcon
										sx={{ fontSize: 80, color: "primary.light", mb: 3 }}
									/>
									<Typography color="textSecondary" align="center" variant="h6">
										No subject performance data available yet.
									</Typography>
									<Typography
										color="textSecondary"
										align="center"
										variant="body1"
										sx={{ mt: 1, mb: 3 }}
									>
										Take some tests to see your performance statistics.
									</Typography>
									<Box
										sx={{ display: "flex", gap: 2, justifyContent: "center" }}
									>
										<Button
											variant="contained"
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
											See Available Tests
										</Button>
										<Button
											variant="outlined"
											onClick={refreshPerformanceData}
											startIcon={
												loadingPerformance ? (
													<CircularProgress size={16} />
												) : (
													<RefreshIcon />
												)
											}
											disabled={loadingPerformance}
											sx={{
												bgcolor: theme.palette.primary.main,
												color: theme.palette.primary.contrastText,
												borderColor: theme.palette.primary.main,
												fontWeight: "bold",
												borderRadius: 2,
												px: 3,
												"&:hover": {
													bgcolor: theme.palette.primary.dark,
													borderColor: theme.palette.primary.dark,
												},
											}}
										>
											Refresh Data
										</Button>
									</Box>
								</Box>
							);
						}
					})()
				)}
			</CardContent>
		</Card>
	);
};

SubjectPerformance.propTypes = {
	loadingPerformance: PropTypes.bool,
	performanceError: PropTypes.object,
	performanceData: PropTypes.object,
	dashboardData: PropTypes.object,
	getNestedProperty: PropTypes.func.isRequired,
	refreshPerformanceData: PropTypes.func.isRequired,
	handleStartTest: PropTypes.func.isRequired,
};

export default SubjectPerformance;

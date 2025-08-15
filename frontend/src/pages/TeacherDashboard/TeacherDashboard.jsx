import { useQuery } from "@tanstack/react-query";
import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	List,
	ListItem,
	ListItemText,
	Divider,
	CircularProgress,
	Alert,
	Paper,
	Avatar,
	Chip,
	ListItemIcon,
	LinearProgress,
	useTheme,
} from "@mui/material";
import {
	School as SchoolIcon,
	Class as ClassIcon,
	Assessment as AssessmentIcon,
	Person as PersonIcon,
	Email as EmailIcon,
	Book as BookIcon,
	EventNote as EventNoteIcon,
	Timeline as TimelineIcon,
	Grade as GradeIcon,
} from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { getTeacherDashboardData } from "../../api/teacherDashboard";
import { useTranslation } from "react-i18next";

export default function TeacherDashboard() {
	const { t } = useTranslation();
	const { user } = useUser();
	const theme = useTheme();

	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["teacherDashboard"],
		queryFn: getTeacherDashboardData,
		enabled: !!user,
	});

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "50vh",
					bgcolor: theme.palette.background.default,
				}}
			>
				<CircularProgress size={60} thickness={4} />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
				{t("dashboard.errorLoadingData")}: {error.message}
			</Alert>
		);
	}

	const teacherData = dashboardData?.data?.teacher;

	return (
		<Box
			sx={{
				p: 4,
				bgcolor: theme.palette.background.default,
				minHeight: "100vh",
			}}
		>
			{/* Header Card */}
			<Paper
				elevation={2}
				sx={{
					p: 3,
					mb: 4,
					borderRadius: 3,
					background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					color: theme.palette.primary.contrastText,
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Avatar
					sx={{
						width: 64,
						height: 64,
						bgcolor: theme.palette.background.paper,
						color: theme.palette.primary.main,
						fontSize: "2rem",
						boxShadow: theme.shadows[3],
					}}
				>
					{user?.name?.charAt(0).toUpperCase()}
				</Avatar>
				<Box>
					<Typography variant="h3" fontWeight="bold">
						{t("dashboard.welcome")}, {user?.name}
					</Typography>
					<Typography variant="h6" sx={{ opacity: 0.9 }}>
						{t("dashboard.teacherDashboard")}
					</Typography>
				</Box>
			</Paper>

			<Grid container spacing={3}>
				{/* Teacher Info Card */}
				<Grid item xs={12} md={4}>
					<Card
						sx={{
							height: "100%",
							borderRadius: 3,
							bgcolor: theme.palette.background.paper,
							boxShadow: theme.shadows[2],
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: theme.shadows[4],
							},
						}}
					>
						<CardContent sx={{ p: 3 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									mb: 3,
									pb: 2,
									borderBottom: `1px solid ${theme.palette.divider}`,
								}}
							>
								<Avatar
									sx={{
										bgcolor: theme.palette.action.hover,
										color: theme.palette.primary.main,
										width: 56,
										height: 56,
										mr: 2,
									}}
								>
									<SchoolIcon sx={{ fontSize: 30 }} />
								</Avatar>
								<Typography variant="h5" fontWeight="bold" color="text.primary">
									{t("dashboard.teacherInformation")}
								</Typography>
							</Box>
							<List sx={{ pt: 1 }}>
								<ListItem sx={{ py: 2, px: 0 }}>
									<ListItemIcon>
										<PersonIcon color="primary" sx={{ fontSize: 28 }} />
									</ListItemIcon>
									<ListItemText
										primary={
											<Typography variant="subtitle1" color="text.secondary">
												{t("dashboard.specialization")}
											</Typography>
										}
										secondary={
											<Typography
												variant="h6"
												fontWeight="medium"
												color="text.primary"
											>
												{teacherData?.specialization ||
													t("dashboard.notSpecified")}
											</Typography>
										}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem sx={{ py: 2, px: 0 }}>
									<ListItemIcon>
										<EmailIcon color="primary" sx={{ fontSize: 28 }} />
									</ListItemIcon>
									<ListItemText
										primary={
											<Typography variant="subtitle1" color="text.secondary">
												{t("dashboard.email")}
											</Typography>
										}
										secondary={
											<Typography
												variant="h6"
												fontWeight="medium"
												color="text.primary"
											>
												{user?.email}
											</Typography>
										}
									/>
								</ListItem>
							</List>
						</CardContent>
					</Card>
				</Grid>

				{/* Teaching Assignments Card */}
				<Grid item xs={12} md={8}>
					<Card
						sx={{
							height: "100%",
							borderRadius: 3,
							bgcolor: theme.palette.background.paper,
							boxShadow: theme.shadows[2],
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: theme.shadows[4],
							},
						}}
					>
						<CardContent sx={{ p: 3 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									mb: 3,
									pb: 2,
									borderBottom: `1px solid ${theme.palette.divider}`,
								}}
							>
								<Avatar
									sx={{
										bgcolor: theme.palette.success.light,
										color: theme.palette.success.dark,
										width: 56,
										height: 56,
										mr: 2,
									}}
								>
									<ClassIcon sx={{ fontSize: 30 }} />
								</Avatar>
								<Typography variant="h5" fontWeight="bold" color="text.primary">
									Teaching Assignments
								</Typography>
							</Box>
							<List sx={{ pt: 1 }}>
								{teacherData?.teachingAssignments?.map((assignment, index) => (
									<ListItem key={index} sx={{ py: 2, px: 0 }}>
										<ListItemIcon>
											<BookIcon
												sx={{ fontSize: 28, color: theme.palette.success.main }}
											/>
										</ListItemIcon>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="h6"
												fontWeight="medium"
												color="text.primary"
											>
												{assignment.subject.name}
											</Typography>
											<Box sx={{ mt: 1 }}>
												{assignment.grades.map((grade) => (
													<Chip
														key={grade._id}
														label={grade.name}
														size="medium"
														sx={{
															mr: 1,
															mb: 1,
															borderRadius: 3,
															fontWeight: "medium",
															bgcolor: theme.palette.success.light,
															color: theme.palette.success.dark,
															"&:hover": {
																bgcolor: theme.palette.success.main,
																color: theme.palette.success.contrastText,
															},
														}}
													/>
												))}
											</Box>
										</Box>
									</ListItem>
								))}
							</List>
						</CardContent>
					</Card>
				</Grid>

				{/* Tests Overview Card */}
				<Grid item xs={12}>
					<Card
						sx={{
							borderRadius: 3,
							bgcolor: theme.palette.background.paper,
							boxShadow: theme.shadows[2],
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: theme.shadows[4],
							},
						}}
					>
						<CardContent sx={{ p: 3 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									mb: 3,
									pb: 2,
									borderBottom: `1px solid ${theme.palette.divider}`,
								}}
							>
								<Avatar
									sx={{
										bgcolor: theme.palette.warning.light,
										color: theme.palette.warning.dark,
										width: 56,
										height: 56,
										mr: 2,
									}}
								>
									<AssessmentIcon sx={{ fontSize: 30 }} />
								</Avatar>
								<Typography variant="h5" fontWeight="bold" color="text.primary">
									Tests Overview
								</Typography>
							</Box>
							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
									{/* Upcoming Tests Section */}
									<Box
										sx={{
											p: 3,
											borderRadius: 3,
											bgcolor: theme.palette.warning.light,
											border: `2px solid ${theme.palette.warning.main}`,
											mb: 3,
										}}
									>
										<Typography
											variant="h6"
											sx={{
												display: "flex",
												alignItems: "center",
												color: theme.palette.warning.dark,
												mb: 2,
												fontWeight: "bold",
											}}
										>
											<EventNoteIcon sx={{ mr: 1 }} />{" "}
											{t("dashboard.upcomingTests")}
										</Typography>
									</Box>
									<List sx={{ mt: 0 }}>
										{teacherData?.upcomingTests?.map((test) => (
											<Paper
												key={test._id}
												elevation={1}
												sx={{
													p: 3,
													borderRadius: 3,
													mb: 2,
													bgcolor: theme.palette.background.paper,
													border: `1px solid ${theme.palette.divider}`,
													transition: "all 0.2s ease-in-out",
													"&:hover": {
														bgcolor: theme.palette.action.hover,
														borderColor: theme.palette.primary.light,
													},
												}}
											>
												<ListItem sx={{ p: 0 }}>
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="h6"
															fontWeight="medium"
															color="text.primary"
														>
															{test.test.title}
														</Typography>
														<Box sx={{ mt: 1 }}>
															<Chip
																icon={<GradeIcon />}
																label={test.grade.name}
																size="small"
																sx={{
																	my: 1,
																	fontWeight: "medium",
																	bgcolor: theme.palette.info.light,
																	color: theme.palette.info.dark,
																}}
															/>
															<Typography
																variant="body1"
																component="div"
																color="text.secondary"
																sx={{
																	display: "flex",
																	alignItems: "center",
																	mt: 1,
																}}
															>
																<EventNoteIcon sx={{ mr: 1, fontSize: 18 }} />
																{new Date(test.scheduledAt).toLocaleString()}
															</Typography>
														</Box>
													</Box>
												</ListItem>
											</Paper>
										))}
									</List>
								</Grid>
								<Grid item xs={12} md={6}>
									{/* Recent Results Section */}
									<Box
										sx={{
											p: 3,
											borderRadius: 3,
											bgcolor: theme.palette.success.light,
											border: `2px solid ${theme.palette.success.main}`,
											mb: 3,
										}}
									>
										<Typography
											variant="h6"
											sx={{
												display: "flex",
												alignItems: "center",
												color: theme.palette.success.dark,
												mb: 2,
												fontWeight: "bold",
											}}
										>
											<TimelineIcon sx={{ mr: 1 }} />{" "}
											{t("dashboard.recentResults")}
										</Typography>
									</Box>
									<List sx={{ mt: 0 }}>
										{teacherData?.recentResults?.map((result) => (
											<Paper
												key={result._id}
												elevation={1}
												sx={{
													p: 3,
													borderRadius: 3,
													mb: 2,
													bgcolor: theme.palette.background.paper,
													border: `1px solid ${theme.palette.divider}`,
													transition: "all 0.2s ease-in-out",
													"&:hover": {
														bgcolor: theme.palette.action.hover,
														borderColor: theme.palette.primary.light,
													},
												}}
											>
												<ListItem sx={{ p: 0 }}>
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="h6"
															fontWeight="medium"
															color="text.primary"
														>
															{result.test.title}
														</Typography>
														<Box sx={{ mt: 1 }}>
															<Chip
																icon={<GradeIcon />}
																label={result.grade.name}
																size="small"
																sx={{
																	my: 1,
																	fontWeight: "medium",
																	bgcolor: theme.palette.info.light,
																	color: theme.palette.info.dark,
																}}
															/>
															<Box sx={{ mt: 2 }}>
																<Box
																	sx={{
																		display: "flex",
																		justifyContent: "space-between",
																		alignItems: "center",
																		mb: 1,
																	}}
																>
																	<Typography
																		variant="body1"
																		component="div"
																		color="text.secondary"
																	>
																		{t("dashboard.averageScore")}
																	</Typography>
																	<Typography
																		variant="h6"
																		fontWeight="bold"
																		component="div"
																		color={getScoreColor(
																			result.averageScore,
																			theme
																		)}
																	>
																		{result.averageScore}%
																	</Typography>
																</Box>
																<LinearProgress
																	variant="determinate"
																	value={result.averageScore}
																	sx={{
																		height: 8,
																		borderRadius: 4,
																		bgcolor: theme.palette.action.hover,
																		"& .MuiLinearProgress-bar": {
																			bgcolor: getScoreColor(
																				result.averageScore,
																				theme
																			),
																			borderRadius: 4,
																		},
																	}}
																/>
															</Box>
														</Box>
													</Box>
												</ListItem>
											</Paper>
										))}
									</List>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
}

// Helper function to determine score color based on theme
function getScoreColor(score, theme) {
	if (score >= 80) return theme.palette.success.main; // Green for high scores
	if (score >= 60) return theme.palette.warning.main; // Orange for medium scores
	return theme.palette.error.main; // Red for low scores
}

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	CircularProgress,
	Chip,
	Card,
	CardContent,
	Avatar,
	IconButton,
	Tooltip,
	Tabs,
	Tab,
	Badge,
	useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
	getTeacherStudentTests,
	getTeacherGrades,
} from "../../api/teacherTests";
import { ROUTES } from "../../routes/routeConfig.jsx";
import { formatDate } from "../../utils/formatDate";
import {
	MenuBook as MenuBookIcon,
	Assessment as AssessmentIcon,
	HourglassEmpty as PendingIcon,
	CheckCircle as GradedIcon,
	FilterList as FilterListIcon,
} from "@mui/icons-material";
const TeacherTests = () => {
	const navigate = useNavigate();
	const [activeGradeTab, setActiveGradeTab] = useState(0);
	const [activeStatusTabs, setActiveStatusTabs] = useState({});
	const theme = useTheme();

	// Fetch teacher's grades (both assigned and with scheduled tests)
	const {
		data: teacherGrades,
		isLoading: isLoadingGrades,
		isError: isGradesError,
		error: gradesError,
	} = useQuery({
		queryKey: ["teacherGrades"],
		queryFn: getTeacherGrades,
	});

	// Fetch student tests
	const {
		data: tests,
		isLoading: isLoadingTests,
		isError: isTestsError,
		error: testsError,
	} = useQuery({
		queryKey: ["teacherTests"],
		queryFn: getTeacherStudentTests,
	});

	// Extract all unique grades (now includes both assigned and scheduled test grades)
	const allAssignedGrades = useMemo(() => {
		if (!teacherGrades) return [];

		// teacherGrades now comes directly from the new API endpoint
		// which already includes both assigned grades and grades with scheduled tests
		return teacherGrades.sort((a, b) =>
			a.level ? a.level - b.level : a.name.localeCompare(b.name)
		);
	}, [teacherGrades]);

	// Group tests by grade and then by subject and scheduled test
	const organizedTests = useMemo(() => {
		if (!tests) return {};

		// Create an object to store tests organized by grade, subject, and scheduled test
		const testsByGrade = {};

		// Initialize with all assigned grades (even empty ones)
		allAssignedGrades.forEach((grade) => {
			testsByGrade[grade.name] = {};
		});

		// Add "Unassigned Grade" to catch any tests without proper grade
		testsByGrade["Unassigned Grade"] = {};

		tests.forEach((test) => {
			// Get grade name from test, or use "Unassigned Grade" as fallback
			const gradeName = test.scheduledTest?.grade?.name || "Unassigned Grade";
			const subject =
				test.scheduledTest?.test?.subject?.name || "Unknown Subject";

			// Get the scheduled test ID and name for the third level of grouping
			const scheduledTestId = test.scheduledTest?._id || "unknown";
			const scheduledTestName =
				test.scheduledTest?.test?.title || "Untitled Test";

			// Create objects if they don't exist
			if (!testsByGrade[gradeName]) {
				testsByGrade[gradeName] = {};
			}

			if (!testsByGrade[gradeName][subject]) {
				testsByGrade[gradeName][subject] = {};
			}

			if (!testsByGrade[gradeName][subject][scheduledTestId]) {
				testsByGrade[gradeName][subject][scheduledTestId] = {
					name: scheduledTestName,
					pending: [],
					graded: [],
				};
			}

			// Add test to the appropriate category
			if (test.status === "pending") {
				testsByGrade[gradeName][subject][scheduledTestId].pending.push(test);
			} else if (test.status === "graded") {
				testsByGrade[gradeName][subject][scheduledTestId].graded.push(test);
			}
		});

		return testsByGrade;
	}, [tests, allAssignedGrades]);

	// Get list of grades for tabs
	const gradesList = useMemo(() => {
		if (allAssignedGrades.length === 0) {
			return Object.keys(organizedTests).sort();
		}
		// Use assigned grades plus any unassigned grade
		return [
			...allAssignedGrades.map((grade) => grade.name),
			...(organizedTests["Unassigned Grade"] &&
			Object.keys(organizedTests["Unassigned Grade"]).length > 0
				? ["Unassigned Grade"]
				: []),
		];
	}, [organizedTests, allAssignedGrades]);

	// Calculate counts for each grade
	const gradeCounts = useMemo(() => {
		const counts = {};

		gradesList.forEach((gradeName) => {
			let pendingCount = 0;
			let gradedCount = 0;

			if (organizedTests[gradeName]) {
				Object.keys(organizedTests[gradeName]).forEach((subject) => {
					Object.keys(organizedTests[gradeName][subject]).forEach(
						(scheduledTestId) => {
							const testGroup =
								organizedTests[gradeName][subject][scheduledTestId];
							pendingCount += testGroup.pending.length;
							gradedCount += testGroup.graded.length;
						}
					);
				});
			}

			counts[gradeName] = {
				pending: pendingCount,
				graded: gradedCount,
				total: pendingCount + gradedCount,
			};
		});

		return counts;
	}, [organizedTests, gradesList]);

	// Handle outer tab change (grades)
	const handleGradeTabChange = (event, newValue) => {
		setActiveGradeTab(newValue);
	};

	// Handle inner tab change (pending/graded)
	const handleStatusTabChange = (gradeName, newValue) => {
		setActiveStatusTabs((prev) => ({
			...prev,
			[gradeName]: newValue,
		}));
	};

	// Get active status tab for current grade
	const getActiveStatusTab = (gradeName) => {
		return activeStatusTabs[gradeName] || 0;
	};

	const isLoading = isLoadingGrades || isLoadingTests;
	const isError = isGradesError || isTestsError;
	const error = gradesError || testsError;

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "70vh",
				}}
			>
				<CircularProgress size={60} thickness={4} />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box sx={{ py: 4 }}>
				<Typography color="error">
					Error loading data: {error.message}
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 4, bgcolor: theme.palette.background.default }}>
			<Paper
				elevation={0}
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
						boxShadow: 3,
					}}
				>
					<AssessmentIcon sx={{ fontSize: 36 }} />
				</Avatar>
				<Box>
					<Typography variant="h3" fontWeight="bold">
						Student Tests
					</Typography>
					<Typography variant="h6" sx={{ opacity: 0.8 }}>
						Organize, review and grade student tests
					</Typography>
				</Box>
			</Paper>

			{/* Grade Tabs */}
			{gradesList.length > 0 && (
				<Paper
					sx={{
						borderRadius: 2,
						mb: 3,
						overflow: "hidden",
						boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
					}}
				>
					<Tabs
						value={activeGradeTab}
						onChange={handleGradeTabChange}
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
						sx={{
							".MuiTabs-indicator": {
								backgroundColor: theme.palette.primary.main,
								height: 3,
							},
							".MuiTab-root.Mui-selected": {
								color: theme.palette.primary.main,
								fontWeight: "bold",
							},
						}}
					>
						{gradesList.map((grade, index) => {
							const gradeName = grade;
							const counts = gradeCounts[gradeName] || {
								pending: 0,
								graded: 0,
								total: 0,
							};

							return (
								<Tab
									key={gradeName}
									label={
										<Box sx={{ display: "flex", alignItems: "center" }}>
											{gradeName}
											<Chip
												size="small"
												label={counts.total}
												sx={{
													ml: 1,
													fontWeight: "bold",
													bgcolor:
														activeGradeTab === index
															? theme.palette.primary.light
															: theme.palette.action.hover,
													color: theme.palette.primary.main,
												}}
											/>
											{counts.pending > 0 && (
												<Badge
													badgeContent={counts.pending}
													color="warning"
													sx={{ ml: 1 }}
												>
													<PendingIcon sx={{ fontSize: 16 }} />
												</Badge>
											)}
										</Box>
									}
									sx={{
										textTransform: "none",
										fontSize: "0.9rem",
										py: 2,
									}}
								/>
							);
						})}
					</Tabs>
				</Paper>
			)}

			<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
				<Tooltip title="Filter Tests">
					<IconButton>
						<FilterListIcon />
					</IconButton>
				</Tooltip>
			</Box>

			{Object.keys(organizedTests).length === 0 ? (
				<Card
					sx={{
						borderRadius: 3,
						boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
						p: 3,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "200px",
					}}
				>
					<AssessmentIcon
						sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
					/>
					<Typography variant="h6" color="text.secondary">
						No tests found
					</Typography>
				</Card>
			) : (
				// Only show the active grade tab
				gradesList.map((grade, index) => {
					const gradeName = grade;
					const activeStatusTab = getActiveStatusTab(gradeName);
					const counts = gradeCounts[gradeName] || {
						pending: 0,
						graded: 0,
						total: 0,
					};

					return (
						<Box
							key={grade}
							sx={{ display: activeGradeTab === index ? "block" : "none" }}
						>
							{/* Status Tabs (Pending/Graded) */}
							<Paper
								sx={{
									borderRadius: 2,
									mb: 3,
									overflow: "hidden",
									boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
								}}
							>
								<Tabs
									value={activeStatusTab}
									onChange={(e, newValue) =>
										handleStatusTabChange(gradeName, newValue)
									}
									variant="fullWidth"
									sx={{
										".MuiTabs-indicator": {
											backgroundColor: theme.palette.primary.main,
											height: 3,
										},
										".MuiTab-root.Mui-selected": {
											color: theme.palette.primary.main,
											fontWeight: "bold",
										},
									}}
								>
									<Tab
										label={
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<PendingIcon sx={{ mr: 1, fontSize: 20 }} />
												<Typography>Needs Grading</Typography>
												{counts.pending > 0 && (
													<Chip
														size="small"
														label={counts.pending}
														color="warning"
														sx={{ ml: 1, fontWeight: "bold" }}
													/>
												)}
											</Box>
										}
										sx={{ textTransform: "none", py: 2 }}
									/>
									<Tab
										label={
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<GradedIcon sx={{ mr: 1, fontSize: 20 }} />
												<Typography>Past Grades</Typography>
												{counts.graded > 0 && (
													<Chip
														size="small"
														label={counts.graded}
														color="success"
														sx={{ ml: 1, fontWeight: "bold" }}
													/>
												)}
											</Box>
										}
										sx={{ textTransform: "none", py: 2 }}
									/>
								</Tabs>
							</Paper>

							{organizedTests[grade] &&
								Object.keys(organizedTests[grade]).map((subject) => {
									// For pending tab, check if any scheduled test has pending tests
									const hasPendingTests = Object.keys(
										organizedTests[grade][subject]
									).some(
										(testId) =>
											organizedTests[grade][subject][testId].pending.length > 0
									);

									// For graded tab, check if any scheduled test has graded tests
									const hasGradedTests = Object.keys(
										organizedTests[grade][subject]
									).some(
										(testId) =>
											organizedTests[grade][subject][testId].graded.length > 0
									);

									// Skip rendering if no relevant tests for active tab
									if (
										(activeStatusTab === 0 && !hasPendingTests) ||
										(activeStatusTab === 1 && !hasGradedTests)
									) {
										return null;
									}

									return (
										<Card
											key={subject}
											sx={{
												mb: 3,
												borderRadius: 3,
												boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
												overflow: "hidden",
												transition:
													"transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
												"&:hover": {
													transform: "translateY(-3px)",
													boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
												},
											}}
										>
											<CardContent sx={{ p: 0 }}>
												<Box
													sx={{
														p: 2,
														display: "flex",
														alignItems: "center",
														borderBottom: "1px solid rgba(0,0,0,0.08)",
														bgcolor: "#f8f9fa",
													}}
												>
													<Avatar
														sx={{
															bgcolor: "#e8f5e9",
															color: "#2e7d32",
															mr: 2,
														}}
													>
														<MenuBookIcon />
													</Avatar>
													<Typography variant="h6">{subject}</Typography>
												</Box>

												{/* Scheduled Tests Section */}
												{Object.keys(organizedTests[grade][subject]).map(
													(scheduledTestId) => {
														const scheduledTest =
															organizedTests[grade][subject][scheduledTestId];
														const hasPending = scheduledTest.pending.length > 0;
														const hasGraded = scheduledTest.graded.length > 0;

														// Skip rendering if no relevant tests for active tab
														if (
															(activeStatusTab === 0 && !hasPending) ||
															(activeStatusTab === 1 && !hasGraded)
														) {
															return null;
														}

														return (
															<Box
																key={scheduledTestId}
																sx={{ px: 2, py: 1, mb: 2 }}
															>
																<Typography
																	variant="h6"
																	sx={{
																		mt: 2,
																		mb: 1,
																		px: 1,
																		py: 0.5,
																		borderLeft: "3px solid #673ab7",
																		color: "#424242",
																	}}
																>
																	{scheduledTest.name}
																</Typography>

																{/* Pending Tests Section - only show in "Needs Grading" tab */}
																{activeStatusTab === 0 && hasPending && (
																	<Box sx={{ px: 2, py: 1 }}>
																		<Box
																			sx={{
																				display: "flex",
																				alignItems: "center",
																				mb: 1,
																				mt: 1,
																			}}
																		>
																			<PendingIcon
																				sx={{
																					color: theme.palette.warning.main,
																					mr: 1,
																				}}
																			/>
																			<Typography
																				variant="subtitle1"
																				fontWeight="medium"
																				color={theme.palette.warning.main}
																			>
																				Tests Awaiting Grading
																			</Typography>
																			<Chip
																				label={scheduledTest.pending.length}
																				size="small"
																				sx={{
																					ml: 1,
																					bgcolor: theme.palette.warning.light,
																					color: theme.palette.warning.dark,
																				}}
																			/>
																		</Box>
																		<TableContainer
																			sx={{
																				borderRadius: 2,
																				border: "1px solid rgba(0,0,0,0.08)",
																			}}
																		>
																			<Table size="small">
																				<TableHead>
																					<TableRow>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Student
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Submitted
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Status
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Actions
																						</TableCell>
																					</TableRow>
																				</TableHead>
																				<TableBody>
																					{scheduledTest.pending.map((test) => (
																						<TableRow key={test._id} hover>
																							<TableCell>
																								{test.student?.name ||
																									"Unknown Student"}
																							</TableCell>
																							<TableCell>
																								{formatDate(test.submittedAt)}
																							</TableCell>
																							<TableCell>
																								<Chip
																									label="Pending"
																									color="warning"
																									size="small"
																								/>
																							</TableCell>
																							<TableCell>
																								<Button
																									variant="contained"
																									size="small"
																									color="primary"
																									onClick={() =>
																										navigate(
																											`${ROUTES.TEACHER_TESTS}/${test._id}/grade`
																										)
																									}
																								>
																									Grade
																								</Button>
																							</TableCell>
																						</TableRow>
																					))}
																				</TableBody>
																			</Table>
																		</TableContainer>
																	</Box>
																)}

																{/* Graded Tests Section - only show in "Past Grades" tab */}
																{activeStatusTab === 1 && hasGraded && (
																	<Box
																		sx={{
																			px: 2,
																			py: 1,
																		}}
																	>
																		<Box
																			sx={{
																				display: "flex",
																				alignItems: "center",
																				mb: 1,
																				mt: 1,
																			}}
																		>
																			<GradedIcon
																				sx={{
																					color: theme.palette.success.main,
																					mr: 1,
																				}}
																			/>
																			<Typography
																				variant="subtitle1"
																				fontWeight="medium"
																				color={theme.palette.success.main}
																			>
																				Graded Tests
																			</Typography>
																			<Chip
																				label={scheduledTest.graded.length}
																				size="small"
																				sx={{
																					ml: 1,
																					bgcolor: theme.palette.success.light,
																					color: theme.palette.success.dark,
																				}}
																			/>
																		</Box>
																		<TableContainer
																			sx={{
																				borderRadius: 2,
																				border: "1px solid rgba(0,0,0,0.08)",
																			}}
																		>
																			<Table size="small">
																				<TableHead>
																					<TableRow>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Student
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Submitted
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Graded
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Score
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Status
																						</TableCell>
																						<TableCell
																							sx={{ fontWeight: "bold" }}
																						>
																							Actions
																						</TableCell>
																					</TableRow>
																				</TableHead>
																				<TableBody>
																					{scheduledTest.graded.map((test) => (
																						<TableRow key={test._id} hover>
																							<TableCell>
																								{test.student?.name ||
																									"Unknown Student"}
																							</TableCell>
																							<TableCell>
																								{formatDate(test.submittedAt)}
																							</TableCell>
																							<TableCell>
																								{formatDate(test.gradedAt)}
																							</TableCell>
																							<TableCell>
																								<Chip
																									label={`${test.score}%`}
																									size="small"
																									sx={{
																										bgcolor: getScoreColor(
																											test.score,
																											theme
																										),
																										color: "white",
																										fontWeight: "bold",
																									}}
																								/>
																							</TableCell>
																							<TableCell>
																								<Chip
																									label="Graded"
																									color="success"
																									size="small"
																								/>
																							</TableCell>
																							<TableCell>
																								<Button
																									variant="outlined"
																									size="small"
																									onClick={() =>
																										navigate(
																											`${ROUTES.TEACHER_TESTS}/${test._id}/grade`
																										)
																									}
																								>
																									View
																								</Button>
																							</TableCell>
																						</TableRow>
																					))}
																				</TableBody>
																			</Table>
																		</TableContainer>
																	</Box>
																)}
															</Box>
														);
													}
												)}

												{/* Empty state shown if no tests match the active tab filter */}
												{(activeStatusTab === 0 && !hasPendingTests) ||
												(activeStatusTab === 1 && !hasGradedTests) ? (
													<Box
														sx={{
															p: 3,
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															justifyContent: "center",
														}}
													>
														<AssessmentIcon
															sx={{
																fontSize: 40,
																color: "text.secondary",
																mb: 1,
															}}
														/>
														<Typography variant="body1" color="text.secondary">
															{activeStatusTab === 0
																? "No tests pending grading for this subject"
																: "No graded tests for this subject"}
														</Typography>
													</Box>
												) : null}
											</CardContent>
										</Card>
									);
								})}

							{/* Empty state when no matching tests for active status tab */}
							{(!organizedTests[grade] ||
								Object.keys(organizedTests[grade]).every((subject) => {
									const hasRelevantTests = Object.keys(
										organizedTests[grade][subject]
									).some((testId) => {
										if (activeStatusTab === 0) {
											return (
												organizedTests[grade][subject][testId].pending.length >
												0
											);
										} else {
											return (
												organizedTests[grade][subject][testId].graded.length > 0
											);
										}
									});
									return !hasRelevantTests;
								})) && (
								<Card
									sx={{
										borderRadius: 3,
										boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
										p: 3,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										minHeight: "200px",
									}}
								>
									<AssessmentIcon
										sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
									/>
									<Typography variant="h6" color="text.secondary">
										{activeStatusTab === 0
											? `No tests awaiting grading for ${grade}`
											: `No graded tests for ${grade}`}
									</Typography>
								</Card>
							)}
						</Box>
					);
				})
			)}
		</Box>
	);
};

// Helper function to determine score color - now uses theme colors
function getScoreColor(score, theme) {
	if (score >= 80) return theme.palette.success.main; // Green for high scores
	if (score >= 60) return theme.palette.warning.main; // Orange for medium scores
	return theme.palette.error.main; // Red for low scores
}

export default TeacherTests;

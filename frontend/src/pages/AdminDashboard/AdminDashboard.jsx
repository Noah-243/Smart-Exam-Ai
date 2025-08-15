/**
 * AdminDashboard Component
 * ------------------------
 * This is the main administrative dashboard view for the application.
 * It provides:
 *  - A statistics overview of users, teachers, students, and questions.
 *  - Combined test statistics (total tests, upcoming tests) and questions grouped by subject.
 *  - A calendar view of scheduled tests.
 *  - Tabs for viewing and managing:
 *      1. Dashboard overview
 *      2. Students list
 *      3. Grades list with student counts
 *  - Modal forms for adding/editing users and managing grades.
 *
 * Data fetching:
 *  - Uses React Query to load:
 *      • Dashboard stats (`getDashboardStats`)
 *      • Student counts per grade (`getStudentCountsByGrade`)
 *      • Scheduled tests (`getScheduledTests`)
 *  - Queries are enabled conditionally based on the active tab for performance.
 *
 * UI/Styling:
 *  - Built with MUI components and theming (`useTheme`).
 *  - Supports internationalization (`useTranslation`) and RTL layouts via `useLanguage`.
 *  - Displays loading states and error messages when fetching data.
 *
 * State management:
 *  - Controls modal visibility, selected user/grade for editing, and active tab.
 */

import React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Box,
	Grid,
	Typography,
	Card,
	CardContent,
	CircularProgress,
	Alert,
	Tooltip,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme,
} from "@mui/material";
import {
	People as PeopleIcon,
	School as SchoolIcon,
	QuestionMark as QuestionIcon,
	Dashboard as DashboardIcon,
	People as UsersIcon,
	School as GradesIcon,
	Assignment as TestIcon,
	CalendarToday as CalendarIcon,
	Assignment as AssignmentIcon,
	Event as EventIcon,
} from "@mui/icons-material";
import { getDashboardStats } from "../../api/dashboard";
import { getStudentCountsByGrade } from "../../api/grades";
// import { getTests } from "../../api/tests";
import { getScheduledTests } from "../../api/scheduledTests";
// Removed adminDashboard.css import - now using theme system
import AddUserForm from "../../components/AddUserForm/AddUserForm";
import GradeForm from "../../components/GradeForm/GradeForm";
import EditUserForm from "../../components/EditUserForm/EditUserForm";
import Clock from "../../components/Clock/Clock";
import UsersTable from "../../components/UsersTable/UsersTable";
import GradesTable from "../../components/GradesTable/GradesTable";
import TestCalendar from "../../components/TestCalendar/TestCalendar";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminDashboard() {
	const { t } = useTranslation();
	const theme = useTheme();

	// Safely get language context with error handling
	let language = "en";
	let isRTL = false;

	try {
		const languageContext = useLanguage();
		console.log("Language context:", languageContext);
		language = languageContext?.language || "en";
		isRTL = language === "he";
	} catch (error) {
		console.error("Error accessing language context:", error);
	}

	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
	const [selectedGrade, setSelectedGrade] = useState(null);
	const [isEditUserOpen, setIsEditUserOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [activeTab, setActiveTab] = useState(0);

	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["dashboard"],
		queryFn: getDashboardStats,
	});

	// Removed unused queryClient reference

	const stats = {
		totalUsers: dashboardData?.data?.users?.total || 0,
		teachers: dashboardData?.data?.users?.teachers || 0,
		students: dashboardData?.data?.users?.students || 0,
		questions: dashboardData?.data?.questions?.total || 0,
	};

	// Fetch student counts for grades tab
	const {
		data: studentCountsData,
		isLoading: isLoadingCounts,
		isError: isCountsError,
		error: countsError,
	} = useQuery({
		queryKey: ["studentCounts"],
		queryFn: getStudentCountsByGrade,
		enabled: activeTab === 2, // Only fetch when grades tab is active
		staleTime: 60000, // Consider data fresh for 1 minute
		refetchOnWindowFocus: false,
	});

	// Fetch scheduled tests data for the calendar
	const { data: scheduledTestsData, isLoading: isLoadingScheduledTests } =
		useQuery({
			queryKey: ["scheduledTests"],
			queryFn: getScheduledTests,
			enabled: activeTab === 0, // Only fetch when dashboard tab is active
		});

	// Log student counts data for debugging
	useEffect(() => {
		if (activeTab === 2) {
			console.log(
				"Active tab is Grades, studentCountsData:",
				studentCountsData
			);
		}
	}, [activeTab, studentCountsData]);

	// Modify useEffect to check dashboard data when it loads
	useEffect(() => {
		if (dashboardData?.data) {
			console.log("Dashboard data loaded:", dashboardData.data);

			// Specifically check the questions and subjects structure
			const questions = dashboardData.data.questions;
			if (questions) {
				console.log("Questions data:", questions);
				console.log("Total questions:", questions.total);

				// Check bySubject array structure
				const bySubject = questions.bySubject;
				if (Array.isArray(bySubject)) {
					console.log("Subject array length:", bySubject.length);
					if (bySubject.length > 0) {
						console.log("First subject item:", bySubject[0]);
						console.log("Available properties:", Object.keys(bySubject[0]));
					}
				} else {
					console.log("bySubject is not an array:", bySubject);
				}
			}

			// Check tests data structure
			const tests = dashboardData.data.tests;
			if (tests) {
				console.log("Tests data:", tests);
				console.log("Total tests:", tests.total);
				console.log("Published tests:", tests.published);
				console.log("Draft tests:", tests.draft);
			}
		}
	}, [dashboardData]);

	// Prepare grades data with student counts when available
	const gradesData = React.useMemo(() => {
		const grades = dashboardData?.data?.grades || { items: [], levels: [] };
		console.log("Original grades data:", grades);

		// If student counts are loaded, integrate them with the grades
		if (studentCountsData?.data && grades.items.length > 0) {
			console.log("Integrating student counts with grades");
			const countMap = {};
			studentCountsData.data.forEach((item) => {
				countMap[item._id] = item.studentCount;
			});
			console.log("Student count map:", countMap);

			// Update grades with student counts
			const updatedItems = grades.items.map((grade) => {
				const gradeId = grade._id.toString();
				const studentCount = countMap[gradeId] || 0;
				console.log(
					`Grade ${grade.name} (${gradeId}) has ${studentCount} students`
				);
				return {
					...grade,
					studentCount: studentCount,
				};
			});

			return {
				...grades,
				items: updatedItems,
			};
		}

		return grades;
	}, [dashboardData?.data?.grades, studentCountsData?.data]);

	// Removed unused mutation functions

	const renderStatCard = (title, value, icon, color) => (
		<Card
			sx={{
				height: "100%",
				backgroundColor: theme.palette.background.paper,
				color: theme.palette.text.primary,
				boxShadow: theme.shadows[3],
			}}
		>
			<CardContent>
				<Box
					className="statCardContent"
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Box className="statInfo">
						<Typography variant="h6" color={theme.palette.text.secondary}>
							{title}
						</Typography>
						<Typography variant="h3" color={theme.palette.text.primary}>
							{value}
						</Typography>
					</Box>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "56px",
							height: "56px",
							borderRadius: "12px",
							backgroundColor:
								color === "primary"
									? theme.palette.primary.main + "33"
									: color === "secondary"
									? theme.palette.secondary.main + "33"
									: color === "success"
									? theme.palette.success.main + "33"
									: theme.palette.warning.main + "33",
						}}
					>
						{React.cloneElement(icon, {
							sx: {
								color:
									color === "primary"
										? theme.palette.primary.main
										: color === "secondary"
										? theme.palette.secondary.main
										: color === "success"
										? theme.palette.success.main
										: theme.palette.warning.main,
								fontSize: 32,
							},
						})}
					</Box>
				</Box>
			</CardContent>
		</Card>
	);

	// Render combined statistics card with test stats and subject stats
	const renderCombinedStatsCard = () => {
		const testStats = dashboardData?.data?.tests || {
			total: 0,
		};

		// Count upcoming tests from scheduledTestsData
		const upcomingTests =
			scheduledTestsData?.data?.filter((test) => {
				const testDate = new Date(test.scheduledAt);
				const now = new Date();
				return testDate > now;
			})?.length || 0;

		// Debug logging for data
		console.log("Test Stats:", testStats);
		console.log(
			"Questions by Subject:",
			dashboardData?.data?.questions?.bySubject
		);

		return (
			<Card
				sx={{
					height: "100%",
					backgroundColor: theme.palette.background.paper,
					color: theme.palette.text.primary,
					boxShadow: theme.shadows[3],
				}}
			>
				<CardContent sx={{ p: 3 }}>
					{/* Test Statistics Section */}
					<Box sx={{ mb: 4 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Typography
								variant="h5"
								sx={{ fontWeight: 600, color: theme.palette.text.primary }}
							>
								{t("admin.testStatistics")}
							</Typography>
							<TestIcon
								sx={{ color: theme.palette.primary.main, fontSize: 36 }}
							/>
						</Box>

						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
									}}
								>
									<AssignmentIcon
										sx={{ color: theme.palette.info.main, fontSize: 36 }}
									/>
									<Typography
										variant="body1"
										fontSize="1.1rem"
										color={theme.palette.text.secondary}
									>
										{t("admin.totalTests")}
									</Typography>
								</Box>
								<Typography
									variant="h4"
									fontWeight="medium"
									sx={{
										color: theme.palette.text.primary,
										fontSize: "1.5rem",
									}}
								>
									{testStats.total}
								</Typography>
							</Box>

							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
									}}
								>
									<EventIcon
										sx={{ color: theme.palette.info.main, fontSize: 32 }}
									/>
									<Typography
										variant="body1"
										fontSize="1.1rem"
										color={theme.palette.text.secondary}
									>
										{t("admin.upcoming")}
									</Typography>
								</Box>
								<Typography
									variant="h4"
									fontWeight="medium"
									sx={{
										color: theme.palette.info.main,
										fontSize: "1.5rem",
									}}
								>
									{upcomingTests}
								</Typography>
							</Box>
						</Box>
					</Box>

					{/* Questions by Subject Section */}
					<Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Typography variant="h5" sx={{ fontWeight: 600 }}>
								{t("admin.questionsStatistics")}
							</Typography>
							<QuestionIcon
								sx={{ color: theme.palette.primary.main, fontSize: 36 }}
							/>
						</Box>

						<Typography
							variant="body1"
							fontSize="1.1rem"
							color={theme.palette.text.secondary}
							sx={{ mb: 2 }}
						>
							{t("admin.bySubject")}
						</Typography>

						<TableContainer>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell
											sx={{
												color: theme.palette.text.secondary,
												borderBottom: `1px solid ${theme.palette.divider}`,
											}}
										>
											{t("navbar.courses")}
										</TableCell>
										<TableCell
											align="right"
											sx={{
												color: theme.palette.text.secondary,
												borderBottom: `1px solid ${theme.palette.divider}`,
											}}
										>
											{t("navbar.questions")}
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{dashboardData?.data?.questions?.bySubject?.map(
										(subject, index) => {
											// Skip subjects with 0 questions
											if (subject.count === 0) return null;

											return (
												<TableRow key={subject._id || index}>
													<TableCell
														sx={{
															color: theme.palette.text.primary,
															borderBottom: `1px solid ${theme.palette.divider}`,
														}}
													>
														{subject.name}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															color: theme.palette.text.primary,
															borderBottom: `1px solid ${theme.palette.divider}`,
														}}
													>
														{subject.count}
													</TableCell>
												</TableRow>
											);
										}
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</CardContent>
			</Card>
		);
	};

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const renderDashboardContent = () => (
		<Grid container spacing={3}>
			{/* Statistics Cards */}
			<Grid item xs={12} sm={6} md={3}>
				{renderStatCard(
					t("admin.totalUsers"),
					stats.totalUsers,
					<PeopleIcon />,
					"primary"
				)}
			</Grid>
			<Grid item xs={12} sm={6} md={3}>
				{renderStatCard(
					t("admin.teachers"),
					stats.teachers,
					<SchoolIcon />,
					"secondary"
				)}
			</Grid>
			<Grid item xs={12} sm={6} md={3}>
				{renderStatCard(
					t("admin.students"),
					stats.students,
					<PeopleIcon />,
					"success"
				)}
			</Grid>
			<Grid item xs={12} sm={6} md={3}>
				{renderStatCard(
					t("admin.questions"),
					stats.questions,
					<QuestionIcon />,
					"warning"
				)}
			</Grid>

			{/* Combined Statistics Section */}
			<Grid item xs={12} md={5}>
				{renderCombinedStatsCard()}
			</Grid>

			{/* Calendar Section - Updated to use TestCalendar component */}
			<Grid item xs={12} md={7}>
				<Card
					sx={{
						height: "100%",
						backgroundColor: theme.palette.background.paper,
						color: theme.palette.text.primary,
						display: "flex",
						flexDirection: "column",
						boxShadow: theme.shadows[3],
					}}
				>
					<CardContent
						sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Typography
								variant="h5"
								sx={{ fontWeight: 600, color: theme.palette.text.primary }}
							>
								{t("admin.testCalendar")}
							</Typography>
							<CalendarIcon
								sx={{ color: theme.palette.primary.main, fontSize: 36 }}
							/>
						</Box>

						{isLoadingScheduledTests ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									flexGrow: 1,
								}}
							>
								<CircularProgress sx={{ color: theme.palette.primary.main }} />
							</Box>
						) : (
							<Box sx={{ flexGrow: 1 }}>
								<TestCalendar scheduledTests={scheduledTestsData?.data || []} />
							</Box>
						)}
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{t("admin.errorLoadingData")}</Alert>
			</Box>
		);
	}

	return (
		<Box className="adminDashboard" dir={isRTL ? "rtl" : "ltr"}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						backgroundColor: theme.palette.background.paper,
						padding: "16px 24px",
						color: theme.palette.text.primary,
						boxShadow: theme.shadows[4],
						flexDirection: isRTL ? "row-reverse" : "row",
						borderBottom: `1px solid ${theme.palette.divider}`,
					}}
				>
					<Typography
						variant="h5"
						sx={{
							fontWeight: "600",
							letterSpacing: "0.5px",
							color: theme.palette.text.primary,
						}}
					>
						{t("admin.adminDashboard")}
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 3,
							flexDirection: isRTL ? "row-reverse" : "row",
						}}
					>
						<Tabs
							value={activeTab}
							onChange={handleTabChange}
							textColor="inherit"
							variant="standard"
							TabIndicatorProps={{
								style: {
									backgroundColor: theme.palette.primary.main,
									height: "3px",
									borderRadius: "3px",
								},
							}}
							sx={{ minHeight: "48px" }}
						>
							{[
								{ icon: <DashboardIcon />, label: t("common.dashboard") },
								{ icon: <UsersIcon />, label: t("navbar.students") },
								{ icon: <GradesIcon />, label: t("navbar.grades") },
							].map((tab, index) => (
								<Tooltip key={index} title={tab.label} arrow placement="bottom">
									<Tab
										icon={tab.icon}
										label={tab.label}
										iconPosition={isRTL ? "end" : "start"}
										sx={{
											minHeight: "48px",
											color: theme.palette.text.secondary,
											"&.Mui-selected": {
												color: theme.palette.primary.main,
												fontWeight: "bold",
												backgroundColor: theme.palette.action.selected,
											},
											padding: "6px 16px",
											margin: "0 4px",
											borderRadius: "8px",
											"&:hover": {
												backgroundColor: theme.palette.action.hover,
												color: theme.palette.primary.main,
												transition: "all 0.2s ease",
											},
											transition: "all 0.2s ease",
										}}
									/>
								</Tooltip>
							))}
						</Tabs>
						<Clock />
					</Box>
				</Box>

				<Box
					sx={{
						mt: 3,
						p: 3,
						backgroundColor: theme.palette.background.default,
					}}
				>
					{activeTab === 0 && renderDashboardContent()}
					{activeTab === 1 && (
						<UsersTable users={dashboardData?.data?.users?.all} />
					)}
					{activeTab === 2 && (
						<>
							{isLoadingCounts ? (
								<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
									<CircularProgress
										sx={{ color: theme.palette.primary.main }}
									/>
								</Box>
							) : isCountsError ? (
								<Box sx={{ p: 3 }}>
									<Alert
										severity="error"
										sx={{
											mb: 2,
											backgroundColor: theme.palette.error.main + "1A",
											color: theme.palette.error.main,
										}}
									>
										{t("admin.errorLoadingCounts")}{" "}
										{countsError?.message || t("errors.unknownError")}
									</Alert>
									<GradesTable
										grades={gradesData || { items: [], levels: [] }}
									/>
								</Box>
							) : (
								<GradesTable grades={gradesData || { items: [], levels: [] }} />
							)}
						</>
					)}
				</Box>
			</Box>

			<AddUserForm
				open={isAddUserOpen}
				onClose={() => setIsAddUserOpen(false)}
			/>
			<GradeForm
				open={isGradeModalOpen}
				onClose={() => {
					setIsGradeModalOpen(false);
					setSelectedGrade(null);
				}}
				grade={selectedGrade}
			/>
			<EditUserForm
				open={isEditUserOpen}
				onClose={() => {
					setIsEditUserOpen(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>
		</Box>
	);
}

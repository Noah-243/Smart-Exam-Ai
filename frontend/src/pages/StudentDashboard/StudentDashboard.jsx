import { useNavigate } from "react-router-dom";
import {
	Box,
	Grid,
	Typography,
	CircularProgress,
	Alert,
	Paper,
} from "@mui/material";
import { useUser } from "../../contexts/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	getStudentDashboardData,
	getAvailableTest,
	getAllAvailableTests,
	getStudentPerformanceSummary,
} from "../../api/studentDashboard";
import { ROUTES } from "../../routes/routeConfig.jsx";
import { useApiError } from "../../hooks/useApiError.jsx";
import ErrorBoundary from "../../components/ErrorBoundary/ErrorBoundary";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Import components
import StudentProfile from "./components/StudentProfile";
import AvailableTestCard from "./components/AvailableTestCard";
import SubjectPerformance from "./components/SubjectPerformance";
import UpcomingTests from "./components/UpcomingTests";
import RecentTests from "./components/RecentTests";

// Import utilities
import { getNestedProperty } from "./utils/dashboardUtils";

const StudentDashboardContent = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	const { loading } = useApiError();
	const queryClient = useQueryClient();
	const theme = useTheme();
	const { t } = useTranslation();

	// Debug log the current user
	console.log("Current user in StudentDashboard:", user);

	// Function to refresh performance data
	const refreshPerformanceData = () => {
		// Invalidate both dashboard and performance data to ensure consistent stats
		queryClient.invalidateQueries(["studentDashboard"]);
		queryClient.invalidateQueries(["studentPerformance"]);
	};

	// Move the useQuery hooks to the top level, outside of any conditionals
	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["studentDashboard"],
		queryFn: getStudentDashboardData,
	});

	const {
		data: performanceData,
		isLoading: loadingPerformance,
		error: performanceError,
	} = useQuery({
		queryKey: ["studentPerformance"],
		queryFn: () => {
			console.log("Fetching optimized performance summary");
			return getStudentPerformanceSummary();
		},
		enabled: !!user?._id,
		onSuccess: (data) => {
			// Debug the received performance data structure
			console.log("Performance data received from API:", data);
			if (data?.data?.subjectPerformance) {
				console.log("Subject performance array:", data.data.subjectPerformance);
				const hasTestsData = data.data.subjectPerformance.some(
					(subject) => (subject.testCount || 0) > 0
				);
				console.log("Has any tests data in subjects:", hasTestsData);

				// Check test counts vs. stats
				const totalTestsFromSubjects = data.data.subjectPerformance.reduce(
					(sum, subject) => sum + (subject.testCount || 0),
					0
				);
				console.log("Total tests from subjects:", totalTestsFromSubjects);
				console.log("Stats from dashboard data:", dashboardData?.data?.stats);
			}
		},
	});

	// Check for data inconsistency and refresh if needed
	useEffect(() => {
		if (dashboardData && performanceData) {
			const totalTestsTaken = dashboardData?.data?.stats?.totalTestsTaken || 0;
			const subjectPerformance =
				performanceData?.data?.subjectPerformance || [];

			const hasTestsInSubjects = subjectPerformance.some(
				(subject) => (subject.testCount || 0) > 0
			);

			// If dashboard shows tests but subjects don't, refresh the performance data
			if (totalTestsTaken > 0 && !hasTestsInSubjects) {
				console.log(
					"Detected data inconsistency - refreshing performance data"
				);
				// Add a small delay to avoid immediate refetch
				const timeoutId = setTimeout(() => refreshPerformanceData(), 2000);
				return () => clearTimeout(timeoutId);
			}
		}
	}, [dashboardData, performanceData]);

	const {
		data: availableTestData,
		isLoading: loadingAvailableTest,
		error: availableTestError,
	} = useQuery({
		queryKey: ["availableTests", user?._id],
		queryFn: async () => {
			console.log("🔍 Fetching available tests for user:", user?._id);

			// First try to get the single test (backward compatibility)
			const singleTestResponse = await getAvailableTest();
			console.log("📊 Single test response:", singleTestResponse);
			console.log("📊 Single test response structure:", {
				success: singleTestResponse?.success,
				hasData: !!singleTestResponse?.data,
				totalAvailable: singleTestResponse?.totalAvailable,
				dataType: typeof singleTestResponse?.data,
				dataIsArray: Array.isArray(singleTestResponse?.data),
			});

			// If the response indicates multiple tests are available, fetch all of them
			if (singleTestResponse?.totalAvailable > 1) {
				console.log(
					`🎯 Multiple tests detected (${singleTestResponse.totalAvailable}), fetching all available tests`
				);
				const allTestsResponse = await getAllAvailableTests();
				console.log("📊 All tests response:", allTestsResponse);
				console.log("📊 All tests response structure:", {
					success: allTestsResponse?.success,
					hasData: !!allTestsResponse?.data,
					dataLength: allTestsResponse?.data?.length,
					dataType: typeof allTestsResponse?.data,
					firstTest: allTestsResponse?.data?.[0],
				});
				return allTestsResponse;
			}

			// Return single test response in the format expected by getAllAvailableTests
			const formattedResponse = {
				success: singleTestResponse?.success,
				data: singleTestResponse?.data ? [singleTestResponse.data] : [],
				count: singleTestResponse?.data ? 1 : 0,
			};

			console.log("📊 Formatted single test response:", formattedResponse);
			return formattedResponse;
		},
		enabled: !!user?._id,
		refetchOnWindowFocus: false,
		retry: false,
		onSuccess: (data) => {
			console.log("✅ Successfully fetched available tests data:", data);
			console.log("✅ Final data structure:", {
				success: data?.success,
				hasData: !!data?.data,
				dataLength: data?.data?.length,
				dataType: typeof data?.data,
				actualTests: data?.data,
			});
		},
		onError: (error) => {
			console.error("❌ Error fetching available tests:", error);
		},
	});

	// // Remove the duplicate code
	// useEffect(() => {
	// 	console.log("Dashboard Data:", dashboardData);
	// 	console.log("Student Profile:", dashboardData?.data?.student?.profile);
	// 	console.log("Grade Info:", dashboardData?.data?.student?.profile?.grade);
	// 	console.log("User:", user);
	// }, [dashboardData, user]);

	const handleStartTest = () => {
		navigate(ROUTES.AVAILABLE_TESTS);
	};

	const upcomingTests = dashboardData?.data?.upcomingTests || [];
	const pastTests = dashboardData?.data?.pastTests || [];

	// Extract the available tests from the response
	const availableTests = availableTestData?.data || [];

	// For development/debugging: log detailed information about available tests
	console.log("🎯 Available Tests Details:", {
		testsCount: availableTests.length,
		testsData: availableTests,
		loadingState: loadingAvailableTest,
		errorState: availableTestError,
		scheduleInfo:
			availableTests.length > 0
				? availableTests.map((test) => ({
						id: test._id,
						title: test.test?.title || test.title,
						subject: test.test?.subject?.name || test.subject?.name,
						scheduledAt: new Date(test.scheduledAt).toLocaleString(),
						currentTime: new Date().toLocaleString(),
						duration: test.duration,
						endTime: new Date(
							new Date(test.scheduledAt).getTime() + test.duration * 60000
						).toLocaleString(),
				  }))
				: null,
	});

	// Debug render conditions
	console.log("🖼️ Render Conditions:", {
		loadingAvailableTest,
		availableTestsLength: availableTests.length,
		willRenderTestCards: !loadingAvailableTest && availableTests.length > 0,
		availableTestsExist: availableTests.length > 0,
		mappingResults: availableTests.map((testData) => ({
			testId: testData._id,
			hasTestData: !!testData,
			testStructure: {
				_id: testData._id,
				title: testData.test?.title || testData.title,
				subject: testData.test?.subject?.name || testData.subject?.name,
			},
		})),
	});

	if (loading) {
		return <CircularProgress />;
	}

	if (isLoading) {
		return (
			<Box sx={{ py: 3, textAlign: "center" }}>
				<CircularProgress />
				<Typography>{t("dashboard.loading")}</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ py: 3, textAlign: "center" }}>
				<Typography color="error">
					{t("dashboard.errorLoadingData")}: {error.message}
				</Typography>
			</Box>
		);
	}

	if (availableTestError) {
		return (
			<Alert severity="error" sx={{ mt: 2 }}>
				{t("dashboard.errorLoadingData")}: {availableTestError.message}
			</Alert>
		);
	}

	return (
		<Box
			sx={{
				p: 3,
				minHeight: "100vh",
				backgroundColor: theme.palette.background.default,
			}}
		>
			<Paper
				elevation={2}
				sx={{
					p: 2,
					mb: 3,
					borderRadius: 2,
					background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
					color: theme.palette.primary.contrastText,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<DashboardIcon sx={{ fontSize: 40, mr: 2 }} />
					<Typography variant="h4" fontWeight="bold">
						{t("dashboard.studentDashboard")}
					</Typography>
				</Box>
			</Paper>

			<Grid container spacing={3}>
				{/* Student Profile Card */}
				<Grid item xs={12}>
					<StudentProfile user={user} dashboardData={dashboardData?.data} />
				</Grid>

				{/* Available Tests Notification Cards */}
				{!loadingAvailableTest &&
					availableTests.length > 0 &&
					availableTests.map((testData) => (
						<AvailableTestCard
							key={testData._id}
							availableTestData={{ data: testData }}
							user={user}
						/>
					))}

				{/* Recent Tests Card - Moved up */}
				<Grid item xs={12}>
					<RecentTests />
				</Grid>

				{/* Upcoming Tests Card - Moved down */}
				<Grid item xs={12}>
					<UpcomingTests
						isLoading={isLoading}
						error={error}
						upcomingTests={upcomingTests}
						pastTests={pastTests}
						handleStartTest={handleStartTest}
					/>
				</Grid>

				{/* Subject Performance Card */}
				<Grid item xs={12}>
					<SubjectPerformance
						loadingPerformance={loadingPerformance}
						performanceError={performanceError}
						performanceData={performanceData}
						dashboardData={dashboardData?.data}
						getNestedProperty={getNestedProperty}
						refreshPerformanceData={refreshPerformanceData}
						handleStartTest={handleStartTest}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};

const StudentDashboard = () => {
	return (
		<ErrorBoundary>
			<StudentDashboardContent />
		</ErrorBoundary>
	);
};

export default StudentDashboard;

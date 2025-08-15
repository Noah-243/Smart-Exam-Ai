// React is needed for JSX transformation
import NotFound from "../pages/ErrorPages/NotFound";
import Unauthorized from "../pages/ErrorPages/Unauthorized";
import Login from "../pages/Login/Login";
import Questions from "../pages/Questions/Questions";
import Tests from "../pages/Tests/Tests";
import Profile from "../pages/Profile/Profile";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import ScheduleTest from "../pages/ScheduleTest/ScheduleTest";
import Grades from "../pages/Grades/Grades";
import GradeDetails from "../pages/GradeDetails/GradeDetails";
import TakeTest from "../pages/TakeTest";
import TestSubmitted from "../pages/TakeTest/TestSubmitted";
import PastTests from "../pages/PastTests";
import TestResults from "../pages/TestResults";
import StudentDashboard from "../pages/StudentDashboard/StudentDashboard";
import TeacherTests from "../pages/TeacherTests";
import GradeTest from "../pages/TeacherTests/GradeTest";
import GradedTests from "../pages/GradedTests";
import GradedTestDetails from "../pages/GradedTests/GradedTestDetails";
import AvailableTests from "../pages/AvailableTests";

export const ROUTES = {
	// Public routes
	LOGIN: "/login",

	// Protected routes
	HOME: "/",
	QUESTIONS: "/questions",
	TESTS: "/tests",
	PROFILE: "/profile",
	ADMIN_DASHBOARD: "/admin/dashboard",
	SCHEDULE_TESTS: "/schedule-tests",
	GRADES: "/grades",
	GRADE_DETAILS: "/grades/:gradeId",
	AVAILABLE_TESTS: "/available-tests",
	TAKE_TEST: "/take-test/:scheduledTestId",
	TEST_SUBMITTED: "/test-submitted",
	PAST_TESTS: "/past-tests",
	TEST_RESULTS: "/test-results/:testId",
	TEACHER_TESTS: "/teacher/tests",
	GRADE_TEST: "/teacher/tests/:testId/grade",
	GRADED_TESTS: "/graded-tests",
	GRADED_TEST_DETAILS: "/graded-test/:testId",
	NOT_FOUND: "/not-found",
	UNAUTHORIZED: "/unauthorized",
};

export const ROUTE_ACCESS = {
	[ROUTES.HOME]: ["teacher", "admin", "student"],
	[ROUTES.QUESTIONS]: ["teacher", "admin"],
	[ROUTES.TESTS]: ["teacher", "admin"],
	[ROUTES.PROFILE]: ["teacher", "admin", "student"],
	[ROUTES.ADMIN_DASHBOARD]: ["admin"],
	[ROUTES.SCHEDULE_TESTS]: ["teacher", "admin"],
	[ROUTES.GRADES]: ["teacher", "admin"],
	[ROUTES.GRADE_DETAILS]: ["teacher", "admin"],
	[ROUTES.AVAILABLE_TESTS]: ["student"],
	[ROUTES.TAKE_TEST]: ["student"],
	[ROUTES.TEST_SUBMITTED]: ["student"],
	[ROUTES.PAST_TESTS]: ["student"],
	[ROUTES.TEST_RESULTS]: ["student"],
	[ROUTES.TEACHER_TESTS]: ["teacher", "admin"],
	[ROUTES.GRADE_TEST]: ["teacher", "admin"],
	[ROUTES.GRADED_TESTS]: ["teacher", "admin"],
	[ROUTES.GRADED_TEST_DETAILS]: ["teacher", "admin"],
	[ROUTES.NOT_FOUND]: ["teacher", "admin", "student"],
	[ROUTES.UNAUTHORIZED]: ["teacher", "admin", "student"],
};

export const routes = [
	{
		path: ROUTES.LOGIN,
		element: <Login />,
	},
	{
		path: ROUTES.HOME,
		element: <StudentDashboard />,
	},
	{
		path: ROUTES.QUESTIONS,
		element: <Questions />,
	},
	{
		path: ROUTES.TESTS,
		element: <Tests />,
	},
	{
		path: ROUTES.PROFILE,
		element: <Profile />,
	},
	{
		path: ROUTES.ADMIN_DASHBOARD,
		element: <AdminDashboard />,
	},
	{
		path: ROUTES.SCHEDULE_TESTS,
		element: <ScheduleTest />,
	},
	{
		path: ROUTES.GRADES,
		element: <Grades />,
	},
	{
		path: ROUTES.GRADE_DETAILS,
		element: <GradeDetails />,
	},
	{
		path: ROUTES.AVAILABLE_TESTS,
		element: <AvailableTests />,
	},
	{
		path: ROUTES.TAKE_TEST,
		element: <TakeTest />,
	},
	{
		path: ROUTES.TEST_SUBMITTED,
		element: <TestSubmitted />,
	},
	{
		path: ROUTES.PAST_TESTS,
		element: <PastTests />,
	},
	{
		path: ROUTES.TEST_RESULTS,
		element: <TestResults />,
	},
	{
		path: ROUTES.TEACHER_TESTS,
		element: <TeacherTests />,
	},
	{
		path: ROUTES.GRADE_TEST,
		element: <GradeTest />,
	},
	{
		path: ROUTES.GRADED_TESTS,
		element: <GradedTests />,
	},
	{
		path: ROUTES.GRADED_TEST_DETAILS,
		element: <GradedTestDetails />,
	},
	{
		path: ROUTES.NOT_FOUND,
		element: <NotFound />,
	},
	{
		path: ROUTES.UNAUTHORIZED,
		element: <Unauthorized />,
	},
	{
		path: "*",
		element: <NotFound />,
	},
];

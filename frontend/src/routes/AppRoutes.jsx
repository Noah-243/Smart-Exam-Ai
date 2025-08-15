import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Questions from "../pages/Questions/Questions";
import Tests from "../pages/Tests/Tests";
import Home from "../pages/Home/Home";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "./routeConfig.jsx";
import ScheduleTest from "../pages/ScheduleTest/ScheduleTest";
import Grades from "../pages/Grades/Grades";
import GradeDetails from "../pages/GradeDetails/GradeDetails";
import Profile from "../pages/Profile/Profile";
import TakeTest from "../pages/TakeTest";
import TestSubmitted from "../pages/TakeTest/TestSubmitted";
import PastTests from "../pages/PastTests";
import TestResults from "../pages/TestResults";
import TeacherTests from "../pages/TeacherTests";
import GradeTest from "../pages/TeacherTests/GradeTest";
import GradedTests from "../pages/GradedTests";
import GradedTestDetails from "../pages/GradedTests/GradedTestDetails";
import AvailableTests from "../pages/AvailableTests";

export default function AppRoutes() {
	return (
		<Routes>
			{/* Public Routes */}
			<Route path={ROUTES.LOGIN} element={<Login />} />

			{/* Admin Routes */}
			<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
				<Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
			</Route>

			{/* Teacher Routes */}
			<Route
				element={
					<ProtectedRoute allowedRoles={["teacher", "admin", "student"]} />
				}
			>
				<Route path={ROUTES.HOME} element={<Home />} />
				<Route path={ROUTES.TESTS} element={<Tests />} />
				<Route path={ROUTES.QUESTIONS} element={<Questions />} />
				<Route path={ROUTES.SCHEDULE_TESTS} element={<ScheduleTest />} />
			</Route>

			{/* Teacher Test Grading Routes */}
			<Route element={<ProtectedRoute allowedRoles={["teacher", "admin"]} />}>
				<Route path={ROUTES.TEACHER_TESTS} element={<TeacherTests />} />
				<Route path={ROUTES.GRADE_TEST} element={<GradeTest />} />
			</Route>

			{/* Grade Routes */}
			<Route element={<ProtectedRoute allowedRoles={["admin", "teacher"]} />}>
				<Route path={ROUTES.GRADES} element={<Grades />} />
				<Route path={ROUTES.GRADE_DETAILS} element={<GradeDetails />} />
			</Route>

			{/* Student Routes */}
			<Route element={<ProtectedRoute allowedRoles={["student"]} />}>
				<Route path={ROUTES.AVAILABLE_TESTS} element={<AvailableTests />} />
				<Route path={ROUTES.TAKE_TEST} element={<TakeTest />} />
				<Route path={ROUTES.TEST_SUBMITTED} element={<TestSubmitted />} />
				<Route path={ROUTES.PAST_TESTS} element={<PastTests />} />
				<Route path={ROUTES.TEST_RESULTS} element={<TestResults />} />
				<Route path={ROUTES.GRADED_TESTS} element={<GradedTests />} />
				<Route
					path={ROUTES.GRADED_TEST_DETAILS}
					element={<GradedTestDetails />}
				/>
			</Route>

			{/* Profile Route */}
			<Route element={<ProtectedRoute />}>
				<Route path={ROUTES.PROFILE} element={<Profile />} />
			</Route>

			{/* Catch all - redirect to login */}
			<Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
		</Routes>
	);
}

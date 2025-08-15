import { Box } from "@mui/material";
import { useUser } from "../../contexts/UserContext";
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import TeacherDashboard from "../TeacherDashboard/TeacherDashboard";
import StudentDashboard from "../StudentDashboard/StudentDashboard";

export default function Home() {
	const { user } = useUser();
	// Check user role
	const renderContent = () => {
		switch (user?.role) {
			case "admin":
				return <AdminDashboard />;
			case "teacher":
				return <TeacherDashboard />;
			case "student":
				return <StudentDashboard />;
			default:
				return <></>;
		}
	};

	return <Box sx={{ p: 3 }}>{renderContent()}</Box>;
}

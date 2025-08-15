import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({ allowedRoles = [] }) {
	const { user, isLoading } = useUser();
	const location = useLocation();

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

	if (!user || !user.token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}

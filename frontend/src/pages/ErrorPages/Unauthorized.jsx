/**
 * Unauthorized Component
 * ----------------------
 * Displays a 403 "Access Denied" page when a user tries to access
 * a restricted route without the required permissions.
 *
 * Features:
 * - Shows a lock icon, HTTP 403 code, and an explanatory message.
 * - Provides a button to navigate back to the home page (`/`).
 * - Fully centered content using flexbox layout.
 * - Styled with Material UI components for consistent design.
 * - Navigation handled with `useNavigate` from React Router.
 */

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

const Unauthorized = () => {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				padding: 3,
				textAlign: "center",
			}}
		>
			<LockIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
			<Typography variant="h2" gutterBottom>
				403
			</Typography>
			<Typography variant="h5" color="text.secondary" gutterBottom>
				Access Denied
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				You do not have permission to access this page.
			</Typography>
			<Button variant="contained" color="primary" onClick={() => navigate("/")}>
				Go to Home
			</Button>
		</Box>
	);
};

export default Unauthorized;

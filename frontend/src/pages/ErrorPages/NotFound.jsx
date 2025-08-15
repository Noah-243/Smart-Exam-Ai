/**
 * NotFound Component
 * ------------------
 * Displays a user-friendly 404 "Page Not Found" message.
 * - Shows a large error icon, the "404" code, and explanatory text.
 * - Provides a button to navigate back to the home page (`/`).
 * - Uses Material UI for layout, typography, and styling.
 * - Centers all content vertically and horizontally using a flexbox layout.
 * - Navigation is handled with `useNavigate` from React Router.
 */

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const NotFound = () => {
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
			<ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
			<Typography variant="h2" gutterBottom>
				404
			</Typography>
			<Typography variant="h5" color="text.secondary" gutterBottom>
				Page Not Found
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				The page you are looking for doesn't exist or has been moved.
			</Typography>
			<Button variant="contained" color="primary" onClick={() => navigate("/")}>
				Go to Home
			</Button>
		</Box>
	);
};

export default NotFound;

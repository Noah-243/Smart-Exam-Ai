/**
 * GradeCard Component
 *
 * Description:
 * This component renders a card UI representing a grade (or class group),
 * including details such as the grade's name, level, and number of students.
 * When the card is clicked, it navigates to a detailed view of the grade.
 *
 * Props:
 * - grade (object): The grade object containing:
 *   - _id (string): Grade ID used for navigation.
 *   - name (string): Grade name to display.
 *   - level (string | number): Educational level of the grade.
 *   - studentCount (number, optional): Number of students in the grade.
 *
 * Behavior:
 * - On hover, the card raises slightly with a transform effect.
 * - On click, it uses React Router to navigate to `/grades/:id`.
 * - It includes icons for visual representation and a chip with the grade level.
 *
 * Used Libraries:
 * - React
 * - Material UI (MUI) components and icons
 * - React Router (`useNavigate`)
 */

import React from "react";
import {
	Card,
	CardContent,
	Typography,
	Box,
	CardActionArea,
	Chip,
} from "@mui/material";
import {
	School as SchoolIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const GradeCard = ({ grade }) => {
	const navigate = useNavigate();
	console.log("Grade data in card:", grade); // Debug log

	return (
		<Card
			onClick={() => navigate(`/grades/${grade._id}`)}
			sx={{
				height: "100%",
				transition: "transform 0.2s",
				"&:hover": {
					transform: "translateY(-4px)",
				},
			}}
		>
			<CardActionArea sx={{ height: "100%" }}>
				<CardContent>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<SchoolIcon sx={{ mr: 1 }} color="primary" />
						<Typography variant="h5" component="div">
							{grade.name}
						</Typography>
					</Box>

					<Typography color="text.secondary" gutterBottom>
						Level: {grade.level}
					</Typography>

					<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
						<PersonIcon sx={{ mr: 1 }} />
						<Typography variant="body2" color="text.secondary">
							{grade.studentCount || 0} Students
						</Typography>
					</Box>

					<Box sx={{ mt: 2 }}>
						<Chip
							label={`Grade ${grade.level}`}
							size="small"
							color="primary"
							variant="outlined"
						/>
					</Box>
				</CardContent>
			</CardActionArea>
		</Card>
	);
};

export default GradeCard;

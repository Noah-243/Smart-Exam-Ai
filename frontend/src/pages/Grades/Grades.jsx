/**
 * @fileoverview Grades Page
 *
 * This page fetches and displays a list of grades using the `getGrades` API.
 *
 * Key Features:
 * --------------
 * - Fetches grades from the backend via `getGrades`
 * - Uses Material-UI Grid to display each grade as a `GradeCard`
 * - Handles:
 *    - Successful data fetch and rendering
 *    - Unexpected API response structure
 *    - API errors
 *
 * Dependencies:
 * --------------
 * - React (useEffect, useState)
 * - Material-UI components (Grid, Typography, Container)
 * - API: `getGrades`
 * - Component: `GradeCard`
 */

import React, { useEffect, useState } from "react";
import { Grid, Typography, Container } from "@mui/material";
import { getGrades } from "../../api/grades";
import GradeCard from "../../components/GradeCard/GradeCard";


/**
 * Grades Component
 * ----------------
 * Fetches the list of grades from the server and renders them as `GradeCard` components.
 */
const Grades = () => {
	const [grades, setGrades] = useState([]);
	const [error, setError] = useState(null);

	/**
	 * useEffect hook to fetch grades when component mounts
	 */
	useEffect(() => {
		const fetchGrades = async () => {
			try {
				const response = await getGrades();
				if (response.success && Array.isArray(response.data)) {
					setGrades(response.data);
				} else {
					console.error("Unexpected API response structure:", response);
					setError("Invalid data received from server");
				}
			} catch (err) {
				console.error("Error loading grades:", err);
				setError(err.message);
			}
		};

		fetchGrades();
	}, []);

	// Display error message if API call fails
	if (error) {
		return <Typography color="error">{error}</Typography>;
	}

	// Render grades as GradeCard components
	return (
		<Container sx={{ p: 5 }}>
			<Grid container spacing={3}>
				{grades.map((grade) => (
					<Grid item xs={12} sm={6} md={4} key={grade._id}>
						<GradeCard grade={grade} />
					</Grid>
				))}
			</Grid>
		</Container>
	);
};

export default Grades;

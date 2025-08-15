/**
 * GradeHeader.js
 * This component renders a page header for the "Grade Test" screen
 * including a back button and title. The back button triggers the provided onBack callback.
 * 
 */

import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PropTypes from "prop-types";

/**
 * GradeHeader Component
 * 
 * @param {function} onBack - Callback function triggered when the back button is clicked.
 * 
 * Displays a title "Grade Test" with a back arrow icon.
 */
const GradeHeader = ({ onBack }) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				mb: 3,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center" }}>
				<IconButton aria-label="back" onClick={onBack} sx={{ mr: 1 }}>
					<ArrowBackIcon />
				</IconButton>
				<Typography variant="h4" component="h1">
					Grade Test
				</Typography>
			</Box>
		</Box>
	);
};

GradeHeader.propTypes = {
	onBack: PropTypes.func.isRequired,
};

export default GradeHeader;

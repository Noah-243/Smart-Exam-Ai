/**
 * ErrorState Component
 * --------------------
 * A reusable React component for displaying an error message inside a styled MUI Alert.
 * 
 * Props:
 * - message (string, required): The error message to display.
 * 
 * Usage:
 * <ErrorState message="Something went wrong" />
 */

import { Box, Alert } from "@mui/material";
import PropTypes from "prop-types";

const ErrorState = ({ message }) => (
	<Box
		sx={{
			p: 3,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
		}}
	>
		<Alert severity="error">{message}</Alert>
	</Box>
);

ErrorState.propTypes = {
	message: PropTypes.string.isRequired,
};

export default ErrorState;

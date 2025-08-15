/**
 * TestGradingLoadingError Component
 * 
 * Displays an error message when test data fails to load,
 * along with a "Back to Tests" button to allow user navigation.
 *
 * Props:
 * - errorMessage (string): The error text to display.
 * - onBack (function): Callback function triggered when the user clicks the back button.
 */

import { Box, Button, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PropTypes from "prop-types";

const TestGradingLoadingError = ({ errorMessage, onBack }) => {
	return (
		<Box
			sx={{
				p: 3,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Alert severity="error">Error loading test: {errorMessage}</Alert>
			<Button
				variant="outlined"
				startIcon={<ArrowBackIcon />}
				onClick={onBack}
				sx={{ mt: 2 }}
			>
				Back to Tests
			</Button>
		</Box>
	);
};

TestGradingLoadingError.propTypes = {
	errorMessage: PropTypes.string.isRequired,
	onBack: PropTypes.func.isRequired,
};

export default TestGradingLoadingError;

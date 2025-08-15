/**
 * TestGradingMissingError Component
 *
 * Shows a warning alert when test data is missing or incomplete,
 * and provides a "Back to Tests" button for user navigation.
 *
 * Props:
 * - onBack (function): Called when the user clicks the back button.
 */

import { Box, Button, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PropTypes from "prop-types";

const TestGradingMissingError = ({ onBack }) => {
	return (
		<Box
			sx={{
				p: 3,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Alert severity="warning">
				Test data is incomplete or missing. Please try another test.
			</Alert>
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

TestGradingMissingError.propTypes = {
	onBack: PropTypes.func.isRequired,
};

export default TestGradingMissingError;

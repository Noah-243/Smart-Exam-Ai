/**
 * StatusMessages.jsx
 *
 * This React component displays status alerts related to the test grading process.
 * It conditionally renders a success message or an error message using Material UI's `Alert` component.
 *
 * Component Purpose:
 * - To provide user feedback after a test grading action.
 * - Shows a styled success alert when grading is successful.
 * - Shows an error alert with a custom message if an error occurs.
 *
 * Props:
 * - submitSuccess (boolean): Indicates whether the test was successfully graded.
 *   If true, a green success alert is shown.
 *
 * - submitError (string): An error message to display if grading failed.
 *   If defined and `submitSuccess` is false, a red error alert is shown.
 *
 * Technologies Used:
 * - React (functional component)
 * - Material UI (Alert, useTheme)
 * - PropTypes for runtime prop validation
 *
 * Styling Notes:
 * - The success alert has a custom background and border color based on the theme's `success.main` color.
 *
 * Usage Example:
 * <StatusMessages
 *   submitSuccess={true}
 *   submitError=""
 * />
 */

import { Alert, useTheme } from "@mui/material";
import PropTypes from "prop-types";

const StatusMessages = ({ submitSuccess, submitError }) => {
	const theme = useTheme();

	if (submitSuccess) {
		return (
			<Alert
				severity="success"
				sx={{
					mb: 2,
					backgroundColor: theme.palette.success.main + "1A",
					border: `1px solid ${theme.palette.success.main}`,
				}}
			>
				Test graded successfully!
			</Alert>
		);
	}

	return (
		<>
			{submitError && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{submitError}
				</Alert>
			)}
		</>
	);
};

StatusMessages.propTypes = {
	submitSuccess: PropTypes.bool,
	submitError: PropTypes.string,
};

export default StatusMessages;

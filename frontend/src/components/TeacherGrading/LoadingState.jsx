/**
 * LoadingState Component
 *
 * Displays a centered loading spinner with a customizable message.
 * Useful for indicating that content is being fetched or processed.
 *
 * Props:
 * - message (string): Optional message to display below the spinner (default: "Loading...")
 *
 * Example:
 * <LoadingState message="Fetching data..." />
 */

import PropTypes from "prop-types";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Loading state component to show when content is being fetched
 */
const LoadingState = ({ message = "Loading..." }) => {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			py={4}
		>
			<CircularProgress color="primary" size={48} thickness={4} />
			<Typography variant="body1" color="textSecondary" mt={2}>
				{message}
			</Typography>
		</Box>
	);
};

LoadingState.propTypes = {
	message: PropTypes.string,
};

export default LoadingState;

/**
 * TestGradingLoading.jsx
 *
 * Displays a centered loading spinner while test grading data is loading.
 * Used to indicate a loading state in the grading interface.
 */

import { Box, CircularProgress } from "@mui/material";

const TestGradingLoading = () => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "80vh",
			}}
		>
			<CircularProgress />
		</Box>
	);
};

export default TestGradingLoading;

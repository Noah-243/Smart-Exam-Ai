import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Typography, Paper, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ROUTES } from "../../routes/routeConfig.jsx";

const TestSubmitted = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const message = location.state?.message || "Test submitted successfully!";

	/**
	 * Navigates the user back to the dashboard (home route).
	 * This is triggered when the "Return to Dashboard" button is clicked.
	 */
	const handleReturnToDashboard = () => {
		// Navigate to the home page which serves as the dashboard
		navigate(ROUTES.HOME);
	};

	return (
		<Container maxWidth="sm">
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				minHeight="80vh"
			>
				<Paper
					elevation={3}
					sx={{
						p: 4,
						textAlign: "center",
						width: "100%",
					}}
				>
					<CheckCircleOutlineIcon
						color="success"
						sx={{ fontSize: 64, mb: 2 }}
					/>

					<Typography variant="h4" component="h1" gutterBottom>
						Test Submitted
					</Typography>

					<Typography variant="body1" color="text.secondary" paragraph>
						{message}
					</Typography>

					<Typography variant="body2" color="text.secondary" paragraph>
						Your test has been submitted for grading. You will be notified when
						your results are available.
					</Typography>

					<Box mt={4}>
						<Button
							variant="contained"
							color="primary"
							onClick={handleReturnToDashboard}
						>
							Return to Dashboard
						</Button>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
};

export default TestSubmitted;

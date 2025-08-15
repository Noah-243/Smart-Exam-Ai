/**
 * ErrorBoundary Component
 *
 * A React class component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * This component uses the lifecycle methods `getDerivedStateFromError` and `componentDidCatch`
 * to catch and handle errors.
 *
 * Props:
 * - children: React children to render inside the boundary.
 *
 * State:
 * - hasError (boolean): Indicates if an error has been caught.
 * - error (Error): The actual error object caught.
 * - errorInfo (object): Additional information about the error.
 *
 * Usage:
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,        // Indicates if an error occurred
			error: null,            // Stores the error object
			errorInfo: null,        // Stores the error stack trace/info
		};
	}

	/**
	 * Lifecycle method triggered when an error is thrown.
	 * Updates the state to display the fallback UI.
	 */
	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	/**
	 * Lifecycle method for logging additional error details.
	 * Runs after an error is caught by the boundary.
	 */
	componentDidCatch(error, errorInfo) {
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});

		// Log the error (can be replaced with external service logging)
		console.error("Error caught by ErrorBoundary:", error, errorInfo);
	}

	/**
	 * Handler to retry rendering by resetting the error state.
	 */
	handleRetry = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	/**
	 * Renders either the fallback UI when an error occurs or the children otherwise.
	 */
	render() {
		if (this.state.hasError) {
			return (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "200px",
						padding: 3,
						textAlign: "center",
						backgroundColor: "background.paper",
						borderRadius: 1,
						boxShadow: 1,
					}}
				>
					<ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
					<Typography variant="h5" color="error" gutterBottom>
						Something went wrong
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
						{this.state.error?.message || "An unexpected error occurred"}
					</Typography>
					<Button
						variant="contained"
						color="primary"
						onClick={this.handleRetry}
						sx={{ mt: 2 }}
					>
						Try Again
					</Button>
				</Box>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;

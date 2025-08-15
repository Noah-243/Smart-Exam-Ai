import { Alert } from "@mui/material";
import PropTypes from "prop-types";

export default function AlertsSection({ error, success }) {
	if (!error && !success) return null;

	return (
		<>
			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}
			{success && (
				<Alert severity="success" sx={{ mb: 3 }}>
					{success}
				</Alert>
			)}
		</>
	);
}

AlertsSection.propTypes = {
	error: PropTypes.string,
	success: PropTypes.string,
};

/**
 * Timer Component
 *
 * A countdown timer that tracks the remaining time in minutes and seconds
 * and triggers a callback when the time reaches zero.
 *
 * Props:
 * @param {number} duration - The total countdown duration in minutes.
 * @param {function} onTimeUp - Callback function executed when the timer reaches zero.
 *
 * Features:
 * - Converts the provided duration (minutes) into seconds for countdown logic.
 * - Decreases time every second using `setInterval`.
 * - Calls `onTimeUp` once timeLeft reaches zero or below.
 * - Dynamically changes the color of the timer as it approaches the end:
 *   - Red (`error.main`) for ≤ 5 minutes remaining.
 *   - Orange (`warning.main`) for ≤ 10 minutes remaining.
 *   - Primary color otherwise.
 * - Visually displays time in `MM:SS` format.
 *
 * Dependencies:
 * - MUI's Box, Typography for layout & styling.
 * - MUI's AccessTimeIcon for a clock icon.
 * - PropTypes for runtime prop validation.
 */

import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PropTypes from "prop-types";

const Timer = ({ duration, onTimeUp }) => {
	const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

	useEffect(() => {
		if (timeLeft <= 0) {
			onTimeUp();
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		// Clear interval on component unmount or when timeLeft changes
		return () => clearInterval(timer);
	}, [timeLeft, onTimeUp]);

	// Format time left into minutes and seconds
	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;

	// Determine color based on time remaining
	const getColor = () => {
		if (timeLeft <= 300) return "error.main"; // Red when 5 minutes or less
		if (timeLeft <= 600) return "warning.main"; // Orange when 10 minutes or less
		return "primary.main";
	};

	return (
		<Box
			display="flex"
			alignItems="center"
			bgcolor={timeLeft <= 300 ? "error.light" : "background.paper"}
			p={2}
			borderRadius={1}
		>
			<AccessTimeIcon sx={{ mr: 1, color: getColor() }} />
			<Typography
				variant="h6"
				component="div"
				sx={{
					color: getColor(),
					fontFamily: "monospace",
					fontWeight: "bold",
				}}
			>
				{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
			</Typography>
		</Box>
	);
};

Timer.propTypes = {
	duration: PropTypes.number.isRequired,
	onTimeUp: PropTypes.func.isRequired,
};

export default Timer;

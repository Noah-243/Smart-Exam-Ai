/**
 * Clock.js – Real-Time Clock Component
 *
 * This component displays the current local time and date, updating every second.
 * It includes a styled tooltip and adapts to the current MUI theme.
 *
 * Features:
 * - Shows HH:MM:SS (live)
 * - Shows full date (e.g., Monday, Jul 22, 2025)
 * - Tooltip on hover ("Current time and date")
 * - Responsive and styled with MUI theme
 *
 * Usage:
 * <Clock />
 */

import { useState, useEffect } from "react";
import { Typography, Box, Tooltip, useTheme } from "@mui/material";
import { AccessTime as ClockIcon } from "@mui/icons-material";

export default function Clock() {
	// State to hold current time
	const [time, setTime] = useState(new Date());

	// Access theme for dynamic styling
	const theme = useTheme();

	/**
	 * useEffect hook to start a timer that updates the time every second.
	 * The interval is cleared on component unmount to prevent memory leaks.
	 */
	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer); // Cleanup on unmount
	}, []);

	/**
	 * Formats a Date object into a HH:MM:SS string.
	 * @param {Date} date - The date to format
	 * @returns {string} - Formatted time string
	 */
	const formatTime = (date) => {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	/**
	 * Formats a Date object into a readable weekday/date string.
	 * @param {Date} date - The date to format
	 * @returns {string} - Formatted date string
	 */
	const formatDate = (date) => {
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Tooltip title="Current time and date" arrow placement="bottom">
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					backgroundColor: theme.palette.action.hover,
					padding: "8px 12px",
					borderRadius: "6px",
					transition: "all 0.3s ease",
					cursor: "default",
					"&:hover": {
						backgroundColor: theme.palette.action.selected,
					},
				}}
			>
				<ClockIcon sx={{ color: theme.palette.primary.main }} />
				<Box>
					<Typography
						variant="body1"
						sx={{
							fontWeight: "medium",
							color: theme.palette.text.primary,
							letterSpacing: "0.5px",
						}}
					>
						{formatTime(time)}
					</Typography>
					<Typography
						variant="caption"
						sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem" }}
					>
						{formatDate(time)}
					</Typography>
				</Box>
			</Box>
		</Tooltip>
	);
}

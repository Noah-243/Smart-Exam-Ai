/**
 * TestCalendar.jsx
 *
 * This React component displays a calendar view of scheduled tests.
 * Users can select a date to view all tests scheduled for that day.
 * The calendar highlights dates that have tests with colored dots based on the subject.
 *
 * Component Purpose:
 * - To provide a visual and interactive calendar interface for navigating test schedules.
 * - For each selected day, a detailed list of scheduled tests is shown below the calendar.
 *
 * Main Features:
 * - Calendar display using `DateCalendar` from MUI's x-date-pickers.
 * - Colored dot indicators for days with scheduled tests (color-coded by subject).
 * - Custom tooltips on calendar days showing test time and subject.
 * - Summary card below the calendar shows all tests scheduled for the selected date.
 *
 * Internal Functions:
 * - `getSubjectColor(subjectName)`: Returns a color code based on subject name for consistent theming.
 * - `getDayTests(date)`: Filters the list of `scheduledTests` to return only those scheduled on the provided date.
 * - `ServerDay`: A custom calendar day renderer that shows a colored dot and tooltip for days with tests.
 *
 * Props:
 * - scheduledTests (array, required): An array of test objects.
 *   Each test object should include:
 *   - `_id`: Unique identifier
 *   - `scheduledAt`: ISO string of scheduled time
 *   - `status`: "completed" | "in-progress" | other
 *   - `test.title`: Title of the test
 *   - `test.subject.name`: Subject name
 *   - `grade.name`: Grade/level (optional)
 *
 * Technologies Used:
 * - React (with hooks)
 * - Material UI: Card, Typography, Chip, Tooltip, Paper, DateCalendar
 * - MUI X Date Pickers (`@mui/x-date-pickers`)
 * - `dayjs` for date formatting and comparison
 * - `react-i18next` for translations (used for fallback text like "unknown")
 *
 * Styling and UX:
 * - Uses theme colors (`useTheme`) and `alpha` for background gradients.
 * - Responsive layout with cards and dividers.
 * - Hover effects on test entries for better interactivity.
 *
 * Example Usage:
 * <TestCalendar scheduledTests={listOfScheduledTests} />
 */

import { useState } from "react";
import {
	Box,
	Typography,
	Tooltip,
	Paper,
	Chip,
	useTheme,
	Divider,
	Card,
	CardHeader,
	alpha,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
	CalendarToday as CalendarTodayIcon,
	EventNote as EventNoteIcon,
} from "@mui/icons-material";

// Subject color mapping for visual appeal (same as ScheduledTestsList)
const getSubjectColor = (subjectName) => {
	const subjectColors = {
		Math: "#2196F3", // Blue
		Mathematics: "#2196F3",
		Science: "#4CAF50", // Green
		Biology: "#4CAF50",
		Chemistry: "#4CAF50",
		Physics: "#4CAF50",
		English: "#FF9800", // Orange
		"English Language": "#FF9800",
		Literature: "#FF9800",
		History: "#9C27B0", // Purple
		Geography: "#795548", // Brown
		"Computer Science": "#607D8B", // Blue Grey
		Programming: "#607D8B",
		Art: "#E91E63", // Pink
		"Physical Education": "#F44336", // Red
		Music: "#673AB7", // Deep Purple
		Language: "#009688", // Teal
	};

	const matchedKey = Object.keys(subjectColors).find((key) =>
		subjectName?.toLowerCase().includes(key.toLowerCase())
	);

	return subjectColors[matchedKey] || "#757575"; // Default grey
};

export default function TestCalendar({ scheduledTests = [] }) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [selectedDate, setSelectedDate] = useState(dayjs());

	const getDayTests = (date) => {
		return scheduledTests.filter((test) =>
			dayjs(test.scheduledAt).isSame(date, "day")
		);
	};

	// eslint-disable-next-line react/prop-types
	const ServerDay = (props) => {
		const { day, outsideCurrentMonth, ...other } = props;
		const dayTests = getDayTests(day);
		const hasTests = dayTests.length > 0;

		// Get the first test's subject color for the dot
		const dotColor = hasTests
			? getSubjectColor(dayTests[0].test?.subject?.name)
			: theme.palette.primary.main;

		return (
			<Tooltip
				title={
					hasTests ? (
						<Box>
							{dayTests.map((test) => (
								<Typography key={test._id} variant="caption" display="block">
									{dayjs(test.scheduledAt).format("HH:mm")} - {test.test.title}
									{test.test?.subject?.name && ` (${test.test.subject.name})`}
								</Typography>
							))}
						</Box>
					) : (
						""
					)
				}
			>
				<Box sx={{ position: "relative" }}>
					<PickersDay
						{...other}
						outsideCurrentMonth={outsideCurrentMonth}
						day={day}
					/>
					{hasTests && (
						<Box
							sx={{
								position: "absolute",
								bottom: 2,
								right: 2,
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: dotColor,
								border: "1px solid",
								borderColor: theme.palette.background.paper,
								boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
							}}
						/>
					)}
				</Box>
			</Tooltip>
		);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				{/* Calendar Section */}
				<Card
					sx={{
						overflow: "hidden",
						background: `linear-gradient(145deg, ${alpha(
							theme.palette.info.main,
							0.1
						)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
						border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
					}}
				>
					<CardHeader
						sx={{
							background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
							color: "white",
							py: 1,
						}}
						avatar={<CalendarTodayIcon sx={{ color: "white", fontSize: 20 }} />}
						title={
							<Typography variant="subtitle1" fontWeight="bold" color="inherit">
								Calendar View
							</Typography>
						}
					/>
					<DateCalendar
						value={selectedDate}
						onChange={setSelectedDate}
						slots={{
							day: ServerDay,
						}}
						sx={{
							width: "100%",
							"& .MuiDayCalendar-header": {
								justifyContent: "space-around",
								"& .MuiTypography-root": {
									width: "40px",
									textAlign: "center",
									fontWeight: "bold",
									color: theme.palette.primary.main,
								},
							},
							"& .MuiDayCalendar-weekContainer": {
								justifyContent: "space-around",
								"& .MuiPickersDay-root": {
									width: "40px",
									height: "40px",
									"&:hover": {
										bgcolor: alpha(theme.palette.primary.main, 0.1),
									},
								},
							},
						}}
					/>
				</Card>

				<Divider sx={{ my: 1 }} />

				{/* Test Details Section */}
				<Card
					sx={{
						flexGrow: 1,
						overflow: "hidden",
						background: `linear-gradient(145deg, ${alpha(
							theme.palette.success.main,
							0.08
						)} 0%, ${alpha(theme.palette.success.light, 0.03)} 100%)`,
						border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
					}}
				>
					<CardHeader
						sx={{
							background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
							color: "white",
							py: 1,
						}}
						avatar={<EventNoteIcon sx={{ color: "white", fontSize: 20 }} />}
						title={
							<Typography variant="subtitle1" fontWeight="bold" color="inherit">
								{selectedDate.format("MMMM D, YYYY")}
							</Typography>
						}
						subheader={
							<Typography
								variant="caption"
								sx={{ color: "rgba(255,255,255,0.8)" }}
							>
								{getDayTests(selectedDate).length} test
								{getDayTests(selectedDate).length !== 1 ? "s" : ""} scheduled
							</Typography>
						}
					/>
					<Box sx={{ p: 2, overflow: "auto", maxHeight: "200px" }}>
						{getDayTests(selectedDate).length > 0 ? (
							getDayTests(selectedDate).map((test) => (
								<Paper
									key={test._id}
									sx={{
										p: 2,
										mb: 1,
										backgroundColor: theme.palette.background.elevated,
										border: "1px solid",
										borderColor: theme.palette.divider,
										borderLeft: "4px solid",
										borderLeftColor: getSubjectColor(test.test?.subject?.name),
										"&:hover": {
											boxShadow: theme.shadows[2],
											transform: "translateY(-1px)",
											transition: "all 0.2s ease-in-out",
										},
									}}
								>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											mb: 1,
										}}
									>
										<Typography variant="subtitle2" fontWeight="medium">
											{dayjs(test.scheduledAt).format("HH:mm")} -{" "}
											{test.test.title}
										</Typography>
										<Chip
											label={test.status || "scheduled"}
											size="small"
											color={
												test.status === "completed"
													? "success"
													: test.status === "in-progress"
													? "warning"
													: "primary"
											}
											sx={{
												fontWeight: "medium",
												textTransform: "capitalize",
												ml: 1,
											}}
										/>
									</Box>
									<Box
										sx={{
											display: "flex",
											gap: 1,
											mt: 1,
											alignItems: "center",
										}}
									>
										{test.test?.subject?.name && (
											<Chip
												label={test.test.subject.name}
												size="small"
												sx={{
													bgcolor: getSubjectColor(test.test.subject.name),
													color: "white",
													fontWeight: "medium",
													fontSize: "0.75rem",
													boxShadow: `0 2px 4px ${alpha(
														getSubjectColor(test.test.subject.name),
														0.4
													)}`,
												}}
											/>
										)}
										<Typography variant="caption" color="text.secondary">
											{test.grade ? test.grade.name : t("common.unknown")}
										</Typography>
									</Box>
								</Paper>
							))
						) : (
							<Box
								sx={{
									textAlign: "center",
									py: 4,
									color: "text.secondary",
								}}
							>
								<EventNoteIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
								<Typography variant="body2">
									No tests scheduled for this date
								</Typography>
							</Box>
						)}
					</Box>
				</Card>
			</Box>
		</LocalizationProvider>
	);
}

TestCalendar.propTypes = {
	scheduledTests: PropTypes.array.isRequired,
};

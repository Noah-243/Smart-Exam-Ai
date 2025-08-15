/**
 * Calendar.jsx – Interactive Calendar Component
 *
 * This component provides a visual calendar interface for managing and viewing scheduled tests or events.
 * It highlights days with scheduled tests using a badge and displays a list of events for the selected day.
 * Users can click a day to view its scheduled events and open a dialog to add new events (currently placeholder logic).
 *
 * Features:
 * - Displays a monthly calendar with test/event indicators using Material UI's DateCalendar.
 * - Shows detailed event info for the selected date, including title, time, and associated grades.
 * - Allows opening a dialog to add new events via a form (event submission logic can be extended).
 * - Custom rendering of days with badges indicating how many events exist for each date.
 *
 * Props:
 * - scheduledTests (Array): An array of test/event objects containing:
 *    - _id: Unique identifier
 *    - scheduledAt (Date): Date/time the test is scheduled
 *    - test: { title: string }
 *    - grades: Array of grade objects { _id, name }
 *
 * Example usage:
 * <Calendar scheduledTests={tests} />
 */

import { useState } from "react";
import {
	Box,
	Paper,
	Typography,
	IconButton,
	Grid,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Badge,
} from "@mui/material";
import {
	LocalizationProvider,
	DateCalendar,
	PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";

/**
 * Calendar component to display scheduled tests with visual badges.
 *
 * @param {Array} scheduledTests - List of test objects containing `scheduledAt`, `test.title`, and `grades[]`
 */
export default function Calendar({ scheduledTests = [] }) {
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [isAddEventOpen, setIsAddEventOpen] = useState(false);
	const [newEvent, setNewEvent] = useState({
		title: "",
		description: "",
	});

	/**
	 * Filters the scheduledTests array to return only those scheduled for the given date.
	 *
	 * @param {dayjs.Dayjs} date - The date to filter tests by.
	 * @returns {Array} - Array of test objects matching the selected date.
	 */
	const getDayTests = (date) => {
		return scheduledTests.filter((test) =>
			dayjs(test.scheduledAt).isSame(date, "day")
		);
	};

	/**
	 * Custom day renderer for the calendar that adds a badge for dates with tests.
	 *
	 * @param {Object} props - Props passed by DateCalendar for each day cell.
	 * @returns {JSX.Element} - A PickersDay component wrapped in a Badge if tests exist.
	 */
	const ServerDay = (props) => {
		const { day, outsideCurrentMonth, ...other } = props;
		const dayTests = getDayTests(day);
		const isSelected = !outsideCurrentMonth && dayTests.length > 0;

		return (
			<Badge
				key={props.day.toString()}
				overlap="circular"
				badgeContent={isSelected ? dayTests.length : undefined}
				color="primary"
			>
				<PickersDay
					{...other}
					outsideCurrentMonth={outsideCurrentMonth}
					day={day}
				/>
			</Badge>
		);
	};

	/**
	 * Handles the add event action (currently placeholder logic).
	 * This function would typically send new event data to a backend or context.
	 */
	const handleAddEvent = () => {
		if (newEvent.title.trim()) {
			const dateStr = selectedDate.format("YYYY-MM-DD");
			// Add event logic (to be implemented)
			setIsAddEventOpen(false);
			setNewEvent({ title: "", description: "" });
		}
	};

	// Get tests for the currently selected date
	const selectedDayTests = getDayTests(selectedDate);

	return (
		<Paper elevation={3} sx={{ p: 2, maxWidth: 800, margin: "auto" }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography variant="h6">Calendar</Typography>
				<Tooltip title="Add Event">
					<IconButton onClick={() => setIsAddEventOpen(true)} color="primary">
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>

			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DateCalendar
							value={selectedDate}
							onChange={(newDate) => setSelectedDate(newDate)}
							slots={{ day: ServerDay }}
						/>
					</LocalizationProvider>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper
						elevation={1}
						sx={{ p: 2, height: "100%", bgcolor: "background.default" }}
					>
						<Typography variant="subtitle1" gutterBottom>
							Events for {selectedDate.format("MMMM D, YYYY")}
						</Typography>
						{selectedDayTests.length > 0 ? (
							selectedDayTests.map((test) => (
								<Paper
									key={test._id}
									sx={{ p: 2, mb: 1, backgroundColor: "background.paper" }}
								>
									<Typography variant="subtitle1">{test.test.title}</Typography>
									<Typography variant="body2" color="text.secondary">
										{dayjs(test.scheduledAt).format("h:mm A")}
									</Typography>
									<Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
										{test.grades.map((grade) => (
											<Typography
												key={grade._id}
												variant="caption"
												color="text.secondary"
											>
												{grade.name}
											</Typography>
										))}
									</Box>
								</Paper>
							))
						) : (
							<Typography variant="body2" color="text.secondary">
								No events scheduled
							</Typography>
						)}
					</Paper>
				</Grid>
			</Grid>

			{/* Dialog for adding new event */}
			<Dialog
				open={isAddEventOpen}
				onClose={() => setIsAddEventOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Add New Event</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
						<TextField
							label="Event Title"
							fullWidth
							value={newEvent.title}
							onChange={(e) =>
								setNewEvent((prev) => ({ ...prev, title: e.target.value }))
							}
						/>
						<TextField
							label="Description"
							fullWidth
							multiline
							rows={3}
							value={newEvent.description}
							onChange={(e) =>
								setNewEvent((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
					<Button onClick={handleAddEvent} variant="contained">
						Add Event
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
}

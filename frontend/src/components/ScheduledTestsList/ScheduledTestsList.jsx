/**
 * ScheduledTestsList.jsx
 *
 * This React component displays a list of scheduled tests alongside a calendar overview.
 * It uses React Query to fetch scheduled tests and provides functionality to:
 * - View test details (title, date, grade, subject, status)
 * - Edit future scheduled tests
 * - Delete scheduled tests with confirmation
 * - Display a visual test calendar
 * 
 * Technologies used:
 * - React, MUI (Material UI)
 * - React Query (for server state fetching and caching)
 * - Axios (indirectly, via imported API functions)
 * - Day.js (for date formatting)
 *
 * Key Functional Parts:
 * - `useQuery` fetches scheduled tests from the server using `getScheduledTests`.
 * - Editable tests must be scheduled in the future and not already started.
 * - Delete operations are confirmed via dialog and success is shown via Snackbar.
 * - Test information is color-coded based on subject and status.
 *
 * Props: None (self-contained component)
 * Dependencies: `getScheduledTests`, `deleteScheduledTest`, `EditScheduledTestForm`, `TestCalendar`
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	IconButton,
	Tooltip,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
	Alert,
	Snackbar,
	useTheme,
	Divider,
	Card,
	CardHeader,
	CardContent,
} from "@mui/material";
import {
	Delete as DeleteIcon,
	Edit as EditIcon,
	Schedule as ScheduleIcon,
	CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import {
	getScheduledTests,
	deleteScheduledTest,
} from "../../api/scheduledTests";
import dayjs from "dayjs";
import TestCalendar from "../TestCalendar/TestCalendar";
import { useState } from "react";
import EditScheduledTestForm from "../EditScheduledTestForm/EditScheduledTestForm";

// Subject color mapping for visual appeal
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

	// Find matching subject or return default
	const matchedKey = Object.keys(subjectColors).find((key) =>
		subjectName?.toLowerCase().includes(key.toLowerCase())
	);

	return subjectColors[matchedKey] || "#757575"; // Default grey
};

// Status color mapping
const getStatusColor = (status) => {
	switch (status) {
		case "scheduled":
			return "primary";
		case "in-progress":
			return "warning";
		case "completed":
			return "success";
		case "cancelled":
			return "error";
		default:
			return "default";
	}
};

export default function ScheduledTestsList() {
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [testToDelete, setTestToDelete] = useState(null);
	const [testToEdit, setTestToEdit] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState(null);
	const [deleteSuccess, setDeleteSuccess] = useState(false);
	const theme = useTheme();

	const { data: scheduledTests, isLoading } = useQuery({
		queryKey: ["scheduledTests"],
		queryFn: getScheduledTests,
	});

	// Check if a test is editable (future test)
	const isTestEditable = (test) => {
		const now = dayjs();
		const testTime = dayjs(test.scheduledAt);
		return testTime.isAfter(now) && test.status === "scheduled";
	};

	const handleEditClick = (test) => {
		if (isTestEditable(test)) {
			setTestToEdit(test);
			setEditDialogOpen(true);
		}
	};

	const handleDeleteClick = (test) => {
		setTestToDelete(test);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!testToDelete) return;

		try {
			setIsDeleting(true);
			setDeleteError(null);

			// Log deletion attempt
			console.log(
				`Attempting to delete scheduled test with ID: ${testToDelete._id}`
			);

			await deleteScheduledTest(testToDelete._id);

			// Invalidate query to refresh the list
			await queryClient.invalidateQueries(["scheduledTests"]);

			setDeleteSuccess(true);
			setDeleteDialogOpen(false);
			setTestToDelete(null);
		} catch (error) {
			console.error("Error deleting scheduled test:", error);
			// Extract error message from different possible response formats
			const errorMessage =
				error.response?.data?.error ||
				error.response?.data?.message ||
				error.message ||
				"Failed to delete test. Server returned a 500 error.";

			setDeleteError(errorMessage);
			// Keep dialog open when error occurs
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setTestToDelete(null);
		setDeleteError(null);
	};

	const handleCloseEditDialog = () => {
		setEditDialogOpen(false);
		setTestToEdit(null);
	};

	const handleCloseSnackbar = () => {
		setDeleteSuccess(false);
	};

	if (isLoading) {
		return <Typography>Loading...</Typography>;
	}

	return (
		<>
			<Grid container spacing={3} sx={{ minHeight: "60vh" }}>
				<Grid item xs={12} md={6}>
					<Card
						sx={{
							height: "100%",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
							borderRadius: 3,
							border: `1px solid ${theme.palette.divider}`,
						}}
					>
						<CardHeader
							sx={{
								background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
								color: "white",
								py: 2,
							}}
							avatar={<ScheduleIcon sx={{ color: "white", fontSize: 28 }} />}
							title={
								<Typography variant="h6" fontWeight="bold" color="inherit">
									Scheduled Tests
								</Typography>
							}
							subheader={
								<Typography
									variant="body2"
									sx={{ color: "rgba(255,255,255,0.8)" }}
								>
									{scheduledTests?.data?.length || 0} tests scheduled
								</Typography>
							}
						/>
						<Divider />
						<CardContent sx={{ flexGrow: 1, p: 0, overflow: "hidden" }}>
							<TableContainer sx={{ maxHeight: "50vh", minHeight: "400px" }}>
								<Table stickyHeader>
									<TableHead>
										<TableRow>
											<TableCell
												sx={{
													bgcolor: theme.palette.background.elevated,
													fontWeight: "bold",
												}}
											>
												Test Title
											</TableCell>
											<TableCell
												sx={{
													bgcolor: theme.palette.background.elevated,
													fontWeight: "bold",
												}}
											>
												Scheduled For
											</TableCell>
											<TableCell
												sx={{
													bgcolor: theme.palette.background.elevated,
													fontWeight: "bold",
												}}
											>
												Grades
											</TableCell>
											<TableCell
												sx={{
													bgcolor: theme.palette.background.elevated,
													fontWeight: "bold",
												}}
											>
												Status
											</TableCell>
											<TableCell
												align="right"
												sx={{
													bgcolor: theme.palette.background.elevated,
													fontWeight: "bold",
												}}
											>
												Actions
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{scheduledTests?.data.map((scheduledTest, index) => {
											const editable = isTestEditable(scheduledTest);
											const isEvenRow = index % 2 === 0;
											return (
												<TableRow
													key={scheduledTest._id}
													sx={{
														bgcolor: isEvenRow
															? theme.palette.background.default
															: theme.palette.background.paper,
														"&:hover": {
															bgcolor: theme.palette.action.hover,
														},
													}}
												>
													<TableCell>
														<Box sx={{ display: "flex", alignItems: "center" }}>
															<Box
																sx={{
																	width: 4,
																	height: 40,
																	bgcolor: getSubjectColor(
																		scheduledTest.test?.subject?.name
																	),
																	borderRadius: 1,
																	mr: 2,
																}}
															/>
															<Box>
																<Typography
																	variant="subtitle2"
																	fontWeight="medium"
																>
																	{scheduledTest.test.title}
																</Typography>
																{scheduledTest.test?.subject?.name && (
																	<Typography
																		variant="caption"
																		color="text.secondary"
																	>
																		{scheduledTest.test.subject.name}
																	</Typography>
																)}
															</Box>
														</Box>
													</TableCell>
													<TableCell>
														<Typography variant="body2">
															{dayjs(scheduledTest.scheduledAt).format(
																"MMM D, YYYY HH:mm"
															)}
														</Typography>
													</TableCell>
													<TableCell>
														<Box
															sx={{
																display: "flex",
																gap: 0.5,
																flexWrap: "wrap",
															}}
														>
															{scheduledTest.grade ? (
																<Chip
																	key={scheduledTest.grade._id}
																	label={scheduledTest.grade.name}
																	size="small"
																	sx={{
																		bgcolor:
																			theme.palette.mode === "dark"
																				? theme.palette.primary.dark
																				: theme.palette.primary.light,
																		color:
																			theme.palette.mode === "dark"
																				? theme.palette.primary.contrastText
																				: theme.palette.primary.dark,
																		fontWeight: "medium",
																	}}
																/>
															) : (
																<Chip
																	label="Unknown Grade"
																	size="small"
																	color="warning"
																	sx={{ fontWeight: "medium" }}
																/>
															)}
														</Box>
													</TableCell>
													<TableCell>
														<Chip
															label={scheduledTest.status}
															color={getStatusColor(scheduledTest.status)}
															size="small"
															sx={{
																fontWeight: "medium",
																textTransform: "capitalize",
															}}
														/>
													</TableCell>
													<TableCell align="right">
														<Tooltip
															title={
																editable
																	? "Edit"
																	: "Cannot edit past or ongoing tests"
															}
														>
															<span>
																<IconButton
																	size="small"
																	onClick={() => handleEditClick(scheduledTest)}
																	disabled={!editable}
																>
																	<EditIcon />
																</IconButton>
															</span>
														</Tooltip>
														<Tooltip title="Delete">
															<IconButton
																size="small"
																color="error"
																onClick={() => handleDeleteClick(scheduledTest)}
															>
																<DeleteIcon />
															</IconButton>
														</Tooltip>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</TableContainer>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6} sx={{ height: "100%" }}>
					<Card
						sx={{
							height: "100%",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						<CardHeader
							sx={{
								background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
								color: "white",
								py: 2,
							}}
							avatar={<CalendarIcon sx={{ color: "white", fontSize: 28 }} />}
							title={
								<Typography variant="h6" fontWeight="bold" color="inherit">
									Test Calendar
								</Typography>
							}
							subheader={
								<Typography
									variant="body2"
									sx={{ color: "rgba(255,255,255,0.8)" }}
								>
									Visual schedule overview
								</Typography>
							}
						/>
						<Divider />
						<CardContent sx={{ flexGrow: 1, p: 2 }}>
							<TestCalendar scheduledTests={scheduledTests?.data || []} />
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
				<DialogTitle>Delete Scheduled Test</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete the scheduled test &quot;
						{testToDelete?.test.title}&quot;? This action cannot be undone.
					</DialogContentText>
					{deleteError && (
						<Alert severity="error" sx={{ mt: 2 }}>
							{deleteError}
						</Alert>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						disabled={isDeleting}
						variant="contained"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={handleCloseEditDialog}
				maxWidth="md"
				fullWidth
			>
				{testToEdit && (
					<EditScheduledTestForm
						scheduledTest={testToEdit}
						onClose={handleCloseEditDialog}
					/>
				)}
			</Dialog>

			{/* Success Snackbar */}
			<Snackbar
				open={deleteSuccess}
				autoHideDuration={3000}
				onClose={handleCloseSnackbar}
				message="Test deleted successfully"
			/>
		</>
	);
}

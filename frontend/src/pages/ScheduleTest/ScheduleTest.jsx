/**
 * ScheduleTest Page
 * -----------------
 * Purpose:
 * Manage scheduling of tests: shows a list of already scheduled tests and
 * provides a dialog to schedule a new test.
 *
 * Responsibilities:
 * - Fetch the catalog of available tests (for the schedule form).
 * - Display the current schedules via <ScheduledTestsList/>.
 * - Open/close the "Schedule New Test" dialog containing <ScheduleTestForm/>.
 *
 * Data flow:
 * - Tests catalog is fetched here with React Query (getTests) and passed to the form.
 * - The list of scheduled tests is handled/rendered by <ScheduledTestsList/>.
 *
 * External deps:
 * - @tanstack/react-query (useQuery)
 * - @mui/material (layout, dialog, buttons)
 * - Local components: ScheduledTestsList, ScheduleTestForm
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Paper, Grid, Button, Dialog } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { getTests } from "../../api/tests";
import ScheduledTestsList from "../../components/ScheduledTestsList/ScheduledTestsList";
import ScheduleTestForm from "../../components/ScheduleTestForm/ScheduleTestForm";

export default function ScheduleTest() {
	// Dialog visibility for the schedule form
	const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

	// Fetch available tests from the server
	const {
		data: testsData,
		isLoading: _isLoading,
		error: _error,
	} = useQuery({
		queryKey: ["tests"],
		queryFn: getTests,
	});

	return (
		<Box sx={{ p: 3 }}>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 3,
						}}
					>
						<Typography variant="h4">Schedule Tests</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setIsScheduleDialogOpen(true)}
						>
							Schedule New Test
						</Button>
					</Box>
				</Grid>
				<Grid item xs={12}>
					<Paper sx={{ p: 2 }}>
						<ScheduledTestsList />
					</Paper>
				</Grid>
			</Grid>

			<Dialog
				open={isScheduleDialogOpen}
				onClose={() => setIsScheduleDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<ScheduleTestForm
					onClose={() => setIsScheduleDialogOpen(false)}
					tests={testsData?.data || []}
				/>
			</Dialog>
		</Box>
	);
}

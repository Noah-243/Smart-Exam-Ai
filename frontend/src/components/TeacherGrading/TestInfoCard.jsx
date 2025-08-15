/**
 * TestInfoCard.jsx
 *
 * This React component displays summary information about a test submission,
 * including test details and student information. It is intended to be used
 * in a grading or review dashboard.
 *
 * Component Purpose:
 * - Presents high-level details about a student's test attempt.
 * - Splits the content into two sections: Test Information and Student Information.
 * - Provides a visual indicator of the test status using a color-coded chip.
 *
 * Props:
 * - test (object, required): The full test submission object, which should contain:
 *
 *   scheduledTest.test.title (string): The title of the test.
 *   scheduledTest.test.subject.name (string): The name of the subject.
 *   student.name (string): The name of the student who submitted the test.
 *   submittedAt (string): ISO date-time string for when the test was submitted.
 *   status (string): The status of the test (e.g., "graded", "pending").
 *
 * Technologies Used:
 * - React functional component
 * - Material UI components: Paper, Grid, Typography, Chip
 * - formatDate utility function: formats the submittedAt date into a human-readable string
 *
 * Layout:
 * - Left column (md=6): Test information (title, subject, submission date)
 * - Right column (md=6): Student information (name and test status)
 * - Uses a `<Paper>` container with padding and spacing between grid items
 *
 * Status Indicator Logic:
 * - "graded" = green chip (success)
 * - "pending" = orange chip (warning)
 * - other = default (grey)
 *
 * Example Usage:
 * <TestInfoCard test={testData} />
 */

import PropTypes from "prop-types";
import { Paper, Grid, Typography, Chip } from "@mui/material";
import { formatDate } from "../../utils/formatDate";

const TestInfoCard = ({ test }) => {
	// Get the test, student, and subject information
	const testTitle = test.scheduledTest.test.title || "Untitled Test";
	const studentName = test.student?.name || "Unknown Student";
	const subjectName =
		test.scheduledTest.test.subject?.name || "Unknown Subject";

	return (
		<Paper sx={{ p: 3, mb: 4 }}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Typography variant="h6" gutterBottom>
						Test Information
					</Typography>
					<Typography variant="body1">
						<strong>Test:</strong> {testTitle}
					</Typography>
					<Typography variant="body1">
						<strong>Subject:</strong> {subjectName}
					</Typography>
					<Typography variant="body1">
						<strong>Submitted:</strong> {formatDate(test.submittedAt)}
					</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<Typography variant="h6" gutterBottom>
						Student Information
					</Typography>
					<Typography variant="body1">
						<strong>Name:</strong> {studentName}
					</Typography>
					<Typography variant="body1">
						<strong>Status:</strong>{" "}
						<Chip
							size="small"
							label={test.status || "pending"}
							color={
								test.status === "graded"
									? "success"
									: test.status === "pending"
									? "warning"
									: "default"
							}
						/>
					</Typography>
				</Grid>
			</Grid>
		</Paper>
	);
};

TestInfoCard.propTypes = {
	test: PropTypes.shape({
		scheduledTest: PropTypes.shape({
			test: PropTypes.shape({
				title: PropTypes.string,
				subject: PropTypes.shape({
					name: PropTypes.string,
				}),
			}),
		}),
		student: PropTypes.shape({
			name: PropTypes.string,
		}),
		submittedAt: PropTypes.string,
		status: PropTypes.string,
	}).isRequired,
};

export default TestInfoCard;

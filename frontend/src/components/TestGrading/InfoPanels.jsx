/**
 * InfoPanels.jsx
 *
 * This module defines a set of React components used to display detailed
 * information about a test, the student who submitted it, and the current grading status.
 * It is intended to be used in a test grading interface or teacher dashboard.
 *
 * Components:
 *
 * 1. TestInfoPanel
 *    - Displays details about the test:
 *        - Title
 *        - Subject
 *        - Duration
 *        - Scheduled date
 *
 * 2. StudentInfoPanel
 *    - Shows information about the student and submission:
 *        - Student name
 *        - Test status (e.g., graded or pending)
 *        - Submission date
 *
 * 3. ScorePanel
 *    - Displays grading progress or final score:
 *        - Score percentage
 *        - Earned points / total points
 *        - Number of questions
 *    - If the test is not yet graded, it dynamically updates based on graded answers.
 *    - Shows a message prompting the teacher to submit the final grade.
 *
 * 4. InfoPanels (default export)
 *    - Container that arranges all three panels in a responsive grid.
 *    - Receives test data, student answers, test questions, and grading progress state.
 *
 * Props for InfoPanels:
 * - test (object): Full test object including metadata, subject, and student info.
 * - answers (array): List of student-submitted answers.
 * - questions (array): List of test questions.
 * - gradedAnswers (object): Map of question IDs to graded points.
 *
 * Dependencies:
 * - Material UI components and icons
 * - Day/date formatting via `formatDate` utility
 * - Scoring logic from `calculateTestScore` utility
 *
 * Example usage:
 * <InfoPanels
 *   test={testData}
 *   answers={studentAnswers}
 *   questions={questionList}
 *   gradedAnswers={gradedMap}
 * />
 */

import React from "react";
import {
	Grid,
	Paper,
	Typography,
	Divider,
	Box,
	Chip,
	Stack,
} from "@mui/material";
import SubjectIcon from "@mui/icons-material/Subject";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradeIcon from "@mui/icons-material/Grade";
import ScoreIcon from "@mui/icons-material/Score";
import { formatDate, calculateTestScore } from "../../utils/testGradingUtils";

/**
 * Test information panel component
 *
 * @param {Object} props Component properties
 * @param {Object} props.test Test data
 * @returns {JSX.Element} TestInfoPanel component
 */
export const TestInfoPanel = ({ test }) => {
	if (!test || !test.scheduledTest || !test.scheduledTest.test) {
		return null;
	}

	return (
		<Paper
			sx={{
				p: 3,
				height: "100%",
				bgcolor: "background.paper",
				borderLeft: "4px solid",
				borderColor: "primary.main",
			}}
		>
			<Typography
				variant="h5"
				gutterBottom
				sx={{ display: "flex", alignItems: "center" }}
			>
				<SubjectIcon sx={{ mr: 1 }} />
				Test Information
			</Typography>
			<Divider sx={{ mb: 3 }} />

			<Stack spacing={2}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Test Title:
					</Typography>
					<Typography variant="body1">
						{test.scheduledTest.test.title}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<SubjectIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Subject:
					</Typography>
					<Typography variant="body1">
						{test.scheduledTest.test.subject?.name || "No subject"}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<AccessTimeIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Duration:
					</Typography>
					<Typography variant="body1">
						{test.scheduledTest.duration || "Not specified"} minutes
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Scheduled:
					</Typography>
					<Typography variant="body1">
						{formatDate(test.scheduledTest.scheduledAt)}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	);
};

/**
 * Student information panel component
 *
 * @param {Object} props Component properties
 * @param {Object} props.test Test data with student information
 * @returns {JSX.Element} StudentInfoPanel component
 */
export const StudentInfoPanel = ({ test }) => {
	if (!test) return null;

	return (
		<Paper
			sx={{
				p: 3,
				height: "100%",
				bgcolor: "background.paper",
				borderLeft: "4px solid",
				borderColor: "success.main",
			}}
		>
			<Typography
				variant="h5"
				gutterBottom
				sx={{ display: "flex", alignItems: "center" }}
			>
				<PersonIcon sx={{ mr: 1 }} />
				Student Information
			</Typography>
			<Divider sx={{ mb: 3 }} />

			<Stack spacing={2}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Student:
					</Typography>
					<Typography variant="body1">
						{test.student?.name || "Unknown Student"}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<HourglassEmptyIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Status:
					</Typography>
					<Chip
						icon={test.status === "graded" ? <CheckCircleIcon /> : null}
						label={test.status || "No status"}
						color={test.status === "graded" ? "success" : "warning"}
						size="small"
					/>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Submitted:
					</Typography>
					<Typography variant="body1">
						{formatDate(test.submittedAt)}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	);
};

/**
 * Score information panel component showing current grading progress
 *
 * @param {Object} props Component properties
 * @param {Object} props.test Test data
 * @param {Array} props.answers Student answers array
 * @param {Array} props.questions Test questions array
 * @param {Object} props.gradedAnswers Current graded answers state
 * @returns {JSX.Element} ScorePanel component
 */
export const ScorePanel = ({
	test,
	answers = [],
	questions = [],
	gradedAnswers = {},
}) => {
	if (!test) return null;

	// Calculate current score based on graded answers
	const { scorePercentage, earnedPoints, totalPoints } = calculateTestScore(
		answers,
		questions,
		gradedAnswers
	);

	// Determine score color based on percentage
	const getScoreColor = (score) => {
		if (score >= 80) return "success.main";
		if (score >= 60) return "warning.main";
		return "error.main";
	};

	// Check if test is already graded
	const isGraded = test.status === "graded";
	const finalScore = isGraded ? test.score : scorePercentage;

	return (
		<Paper
			sx={{
				p: 3,
				height: "100%",
				bgcolor: "background.paper",
				borderLeft: "4px solid",
				borderColor: "secondary.main",
			}}
		>
			<Typography
				variant="h5"
				gutterBottom
				sx={{ display: "flex", alignItems: "center" }}
			>
				<GradeIcon sx={{ mr: 1 }} />
				{isGraded ? "Final Grade" : "Current Score"}
			</Typography>
			<Divider sx={{ mb: 3 }} />

			<Stack spacing={2}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<ScoreIcon sx={{ mr: 1, color: "text.secondary" }} />
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Score:
					</Typography>
					<Chip
						label={`${finalScore}%`}
						size="medium"
						sx={{
							fontWeight: "bold",
							fontSize: "1rem",
							bgcolor: getScoreColor(finalScore),
							color: "white",
							minWidth: 80,
						}}
					/>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Points:
					</Typography>
					<Typography
						variant="body1"
						sx={{
							fontSize: "1.1rem",
							fontWeight: "bold",
							color: "text.primary",
						}}
					>
						{earnedPoints} / {totalPoints}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Typography
						variant="body1"
						sx={{ fontWeight: "bold", minWidth: 120 }}
					>
						Questions:
					</Typography>
					<Typography variant="body1">{questions.length} total</Typography>
				</Box>

				{!isGraded && (
					<Box
						sx={{
							mt: 2,
							p: 2,
							bgcolor: "background.elevated",
							borderRadius: 1,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontStyle: "italic" }}
						>
							Score updates automatically as you grade each question. Click
							"Submit Test Grade" when finished.
						</Typography>
					</Box>
				)}
			</Stack>
		</Paper>
	);
};

/**
 * Information panels container component
 *
 * @param {Object} props Component properties
 * @param {Object} props.test Test data
 * @param {Array} props.answers Student answers array
 * @param {Array} props.questions Test questions array
 * @param {Object} props.gradedAnswers Current graded answers state
 * @returns {JSX.Element} InfoPanels component
 */
const InfoPanels = ({
	test,
	answers = [],
	questions = [],
	gradedAnswers = {},
}) => {
	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid item xs={12} md={4}>
				<TestInfoPanel test={test} />
			</Grid>
			<Grid item xs={12} md={4}>
				<StudentInfoPanel test={test} />
			</Grid>
			<Grid item xs={12} md={4}>
				<ScorePanel
					test={test}
					answers={answers}
					questions={questions}
					gradedAnswers={gradedAnswers}
				/>
			</Grid>
		</Grid>
	);
};

export default InfoPanels;

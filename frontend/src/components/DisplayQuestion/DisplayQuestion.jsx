/**
 * DisplayQuestion.js
 *
 * This React component provides a comprehensive interface for creating or editing questions.
 * It allows users (typically teachers or administrators) to define a question's content,
 * assign it to specific grades and subjects, and configure its answer format.
 *
 * Features:
 * - Dynamically fetches grades and subjects from the server using React Query.
 * - Supports both multiple-choice and open-ended answers.
 * - Allows toggling between single and multiple correct answers.
 * - Displays tags for selected grades and subjects with the ability to remove them.
 * - Performs client-side validation for required fields before submission.
 * - Uses Material UI components for a clean and responsive user interface.
 *
 * Props:
 * @param {Object} question - (Optional) A question object to pre-fill the form when editing.
 * @param {Function} onClose - Callback function triggered after cancel or successful submission.
 *
 * Usage:
 * <DisplayQuestion question={existingQuestion} onClose={() => setOpen(false)} />
 */


import {
	Button,
	Checkbox,
	Input,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	Box,
	Typography,
	Stack,
	FormControl,
	FormControlLabel,
	IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import Tag from "../Tag";


/**
 * Main component for displaying and editing a question
 */
export default function DisplayQuestion({ question = null, onClose }) {
	const [selectedGrades, setSelectedGrades] = useState([]);
	const [selectedSubjects, setSelectedSubjects] = useState([]);
	const [answerChoices, setAnswerChoices] = useState([]);
	const [questionData, setQuestionData] = useState({
		title: "",
		body: "",
		isMultiAnswer: false,
		isTextAnswer: false,
	});
	const [errors, setErrors] = useState({});

	// Fetch grades from the backend
	const {
		data: gradesData,
		isLoading: gradesLoading,
		error: gradesError,
	} = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	// Fetch subjects from the backend
	const {
		data: subjectsData,
		isLoading: subjectsLoading,
		error: subjectsError,
	} = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
	});

	const allGrades = gradesData?.data || [];
	const allSubjects = subjectsData?.data || [];

	const handleSubjectChange = (eventTargetVal) => {
		const selectedIndex = eventTargetVal[eventTargetVal.length - 1];
		const selectedSubject = allSubjects[selectedIndex - 1];
		toggleSubjectSelection(selectedSubject);
	};

	/**
	 * Toggles a subject in the selectedSubjects array
	 */
	const toggleSubjectSelection = (selectedSubject) => {
		for (let i = 0; i < selectedSubjects.length; i++) {
			if (selectedSubjects[i]._id === selectedSubject._id) {
				const newSelectedSubjects = [...selectedSubjects];
				newSelectedSubjects.splice(i, 1);
				setSelectedSubjects(newSelectedSubjects);
				return;
			}
		}
		setSelectedSubjects([...selectedSubjects, selectedSubject]);
	};

	const handleGradeChange = (eventTargetVal) => {
		const selectedIndex = eventTargetVal[eventTargetVal.length - 1];
		const selectedGrade = allGrades[selectedIndex - 1];
		toggleGradeSelection(selectedGrade);
	};

	/**
	 * Toggles a grade in the selectedGrades array
	 */
	const toggleGradeSelection = (selectedGrade) => {
		for (let i = 0; i < selectedGrades.length; i++) {
			if (selectedGrades[i]._id === selectedGrade._id) {
				const newSelectedGrades = [...selectedGrades];
				newSelectedGrades.splice(i, 1);
				setSelectedGrades(newSelectedGrades);
				return;
			}
		}
		setSelectedGrades([...selectedGrades, selectedGrade]);
	};

	// Initialize form with question data if editing
	useEffect(() => {
		if (question && allGrades.length > 0 && allSubjects.length > 0) {
			setQuestionData({
				title: question.title || "",
				body: question.body || "",
				isMultiAnswer: question.isMultiAnswer || false,
				isTextAnswer: question.isTextAnswer || false,
			});
			setAnswerChoices(question.answers || []);

			const questionGrades = allGrades.filter((grade) =>
				question.grades.includes(grade._id)
			);
			setSelectedGrades(questionGrades);

			const questionSubjects = allSubjects.filter((subject) =>
				question.subjects.includes(subject._id)
			);
			setSelectedSubjects(questionSubjects);
		}
	}, [question, allGrades, allSubjects]);

	const renderQuestionParameters = () => {
		return (
			<Stack spacing={2}>
				<FormControl fullWidth>
					<InputLabel id="gradesInputLabel">Grades</InputLabel>
					<Select
						labelId="gradesInputLabel"
						multiple
						value={selectedGrades.map((grade) => grade._id)}
						onChange={(e) => handleGradeChange(e.target.value)}
						input={<OutlinedInput label="Grades" />}
						sx={{ mb: 1 }}
						disabled={gradesLoading}
					>
						{allGrades.map((grade) => (
							<MenuItem key={grade._id} value={grade._id}>
								{grade.name}
							</MenuItem>
						))}
					</Select>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
						{selectedGrades.map((grade) => (
							<Tag
								onClick={() => toggleGradeSelection(grade)}
								key={grade._id}
								text={grade.name}
							/>
						))}
					</Box>
					{gradesError && (
						<Typography color="error" variant="caption">
							Error loading grades. Please try again.
						</Typography>
					)}
				</FormControl>

				<FormControl fullWidth>
					<InputLabel id="subjectsInputLabel">Subjects</InputLabel>
					<Select
						labelId="subjectsInputLabel"
						multiple
						value={selectedSubjects.map((subject) => subject._id)}
						onChange={(e) => handleSubjectChange(e.target.value)}
						input={<OutlinedInput label="Subjects" />}
						sx={{ mb: 1 }}
						disabled={subjectsLoading}
					>
						{allSubjects.map((subject) => (
							<MenuItem key={subject._id} value={subject._id}>
								{subject.name}
							</MenuItem>
						))}
					</Select>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
						{selectedSubjects.map((subject) => (
							<Tag
								onClick={() => toggleSubjectSelection(subject)}
								key={subject._id}
								text={subject.name}
							/>
						))}
					</Box>
					{subjectsError && (
						<Typography color="error" variant="caption">
							Error loading subjects. Please try again.
						</Typography>
					)}
				</FormControl>
			</Stack>
		);
	};

	const renderQuestionBody = () => {
		return (
			<Box>
				<Typography variant="h6" sx={{ mb: 2 }}>
					Question Body:
				</Typography>
				<FormControl fullWidth error={!!errors.body}>
					<Input
						multiline
						rows={4}
						name="body"
						value={questionData.body}
						onChange={(e) =>
							setQuestionData((prev) => ({ ...prev, body: e.target.value }))
						}
					/>
					{errors.body && (
						<Typography color="error" variant="caption" sx={{ mt: 1 }}>
							{errors.body}
						</Typography>
					)}
				</FormControl>
			</Box>
		);
	};

	const addBlankAnswer = () => {
		setAnswerChoices([
			...answerChoices,
			{ body: "", correct: false, isOpenEnded: false },
		]);
	};

	const renderAnswerOptions = () => {
		return (
			<Box>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<Typography variant="h6">Answer Options:</Typography>
					<IconButton color="primary" onClick={addBlankAnswer} sx={{ ml: 2 }}>
						<AddCircleOutlineIcon />
					</IconButton>
				</Box>
				<Stack direction="row" spacing={3}>
					<FormControlLabel
						control={
							<Checkbox
								checked={questionData.isTextAnswer}
								onChange={(e) =>
									setQuestionData((prev) => ({
										...prev,
										isTextAnswer: e.target.checked,
									}))
								}
							/>
						}
						label="Text answer?"
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={questionData.isMultiAnswer}
								onChange={(e) =>
									setQuestionData((prev) => ({
										...prev,
										isMultiAnswer: e.target.checked,
									}))
								}
							/>
						}
						label="Multi answer?"
					/>
				</Stack>
			</Box>
		);
	};

	const renderAnswerChoices = () => {
		return (
			<Stack spacing={2}>
				{answerChoices.map((answer, index) => (
					<Box
						key={index}
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: 2,
							p: 2,
							border: 1,
							borderColor: "divider",
							borderRadius: 1,
						}}
					>
						<FormControl sx={{ flex: 1 }}>
							<Input
								multiline
								value={answer.body}
								onChange={(e) => {
									const newAnswers = [...answerChoices];
									newAnswers[index] = {
										...newAnswers[index],
										body: e.target.value,
									};
									setAnswerChoices(newAnswers);
								}}
							/>
						</FormControl>

						<Stack spacing={1}>
							<FormControlLabel
								control={
									<Checkbox
										checked={answer.correct}
										onChange={(e) => {
											const newAnswers = [...answerChoices];
											newAnswers[index] = {
												...newAnswers[index],
												correct: e.target.checked,
											};
											setAnswerChoices(newAnswers);
										}}
									/>
								}
								label="Correct?"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={answer.isOpenEnded}
										onChange={(e) => {
											const newAnswers = [...answerChoices];
											newAnswers[index] = {
												...newAnswers[index],
												isOpenEnded: e.target.checked,
											};
											setAnswerChoices(newAnswers);
										}}
									/>
								}
								label="Open ended?"
							/>
						</Stack>
					</Box>
				))}
			</Stack>
		);
	};

	const validateForm = () => {
		const newErrors = {};

		if (!questionData.body?.trim()) {
			newErrors.body = "Question body is required";
		}
		if (answerChoices.length === 0) {
			newErrors.answers = "At least one answer is required";
		}
		if (selectedGrades.length === 0) {
			newErrors.grades = "At least one grade must be selected";
		}
		if (selectedSubjects.length === 0) {
			newErrors.subjects = "At least one subject must be selected";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmitQuestion = async () => {
		if (!validateForm()) {
			return;
		}

		const questionPayload = {
			...questionData,
			id: question?.id,
			grades: selectedGrades.map((grade) => grade._id),
			subjects: selectedSubjects.map((subject) => subject._id),
			answers: answerChoices.map((answer) => ({
				body: answer.body,
				isCorrect: answer.correct,
				isOpenEnded: answer.isOpenEnded,
			})),
		};

		try {
			console.log("Submitting question:", questionPayload);
			onClose && onClose();
		} catch (error) {
			console.error("Error submitting question:", error);
		}
	};

	return (
		<Stack spacing={3} sx={{ p: 2 }}>
			<Typography variant="h5">
				{question ? "Edit Question" : "Create New Question"}
			</Typography>
			{renderQuestionBody()}
			{renderAnswerOptions()}
			{renderAnswerChoices()}
			{renderQuestionParameters()}
			<Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
				<Button variant="outlined" onClick={onClose}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmitQuestion}
					disabled={gradesLoading || subjectsLoading}
				>
					{question ? "Save Changes" : "Create Question"}
				</Button>
			</Box>
		</Stack>
	);
}

DisplayQuestion.propTypes = {
	question: PropTypes.shape({
		id: PropTypes.string,
		title: PropTypes.string,
		body: PropTypes.string,
		isMultiAnswer: PropTypes.bool,
		isTextAnswer: PropTypes.bool,
		grades: PropTypes.arrayOf(PropTypes.string),
		subjects: PropTypes.arrayOf(PropTypes.string),
		answers: PropTypes.arrayOf(
			PropTypes.shape({
				body: PropTypes.string,
				correct: PropTypes.bool,
				isOpenEnded: PropTypes.bool,
			})
		),
	}),
	onClose: PropTypes.func,
};

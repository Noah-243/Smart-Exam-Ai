/**
 * QuestionsSidebar
 * ----------------
 * Purpose:
 * Sidebar UI for filtering the Questions library by subjects and grades,
 * displaying currently selected filters as removable tags, and exposing a
 * "Create Question" action.
 *
 * Responsibilities:
 * - Fetch available subjects and grades from the server (React Query).
 * - Let the user pick multiple subjects/grades (MUI <Select multiple />).
 * - Show selected items as clickable <Tag> chips to remove them.
 * - Bubble changes up via setSelectedSubjects / setSelectedGrades.
 * - Expose a button to open the create-question form.
 *
 * Data flow:
 * - Subjects/grades lists are fetched here with useQuery.
 * - Selected values are controlled by the parent and updated via setters.
 *
 * UX notes:
 * - The Selects use index-based values (index+1) that map back to the
 *   fetched arrays. This keeps the visual value separate from the object,
 *   but demands careful index mapping (see handlers).
 *
 * External deps:
 * - @tanstack/react-query: fetching grades/subjects
 * - @mui/material: Selects and inputs
 * - Local <Tag/> component for removable chips
 */

import Tag from "../../components/Tag";
import "./questions.css";
import Select from "@mui/material/Select";
import { MenuItem } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import { useQuery } from "@tanstack/react-query";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import PropTypes from "prop-types";

export default function QuestionsSidebar({
	selectedSubjects,
	selectedGrades,
	setSelectedSubjects,
	setSelectedGrades,
	showCreateQuestionForm,
}) {
	// Fetch grades from the server
	const { data: gradesData } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	// Fetch subjects from the server
	const { data: subjectsData } = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
	});

	const allSubjects = subjectsData?.data || [];
	const allGrades = gradesData?.data || [];

	 /**
   * Handle multi-select change for subjects.
   * The Select stores "index+1" in value array; we take the last picked value,
   * map it back to the actual Subject object, and toggle it.
   * @param {Array<number|string>} eventTargetVal Current Select values array
   */
	const handleSubjectChange = (eventTargetVal) => {
		const selectedIndex = eventTargetVal[eventTargetVal.length - 1];
		const selectedSubject = allSubjects[selectedIndex - 1];
		toggleSubjectSelection(selectedSubject);
	};

	 /**
   * Toggle a subject in/out of the selectedSubjects array by _id.
   * @param {Subject} selectedSubject
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

	  /**
   * Handle multi-select change for grades.
   * Mirrors the subject handler: map from Select "index+1" to Grade object.
   * @param {Array<number|string>} eventTargetVal Current Select values array
   */
	const handleGradeChange = (eventTargetVal) => {
		const selectedIndex = eventTargetVal[eventTargetVal.length - 1];
		const selectedGrade = allGrades[selectedIndex - 1];
		toggleGradeSelection(selectedGrade);
	};

 /**
   * Toggle a grade in/out of the selectedGrades array by _id.
   * @param {Grade} selectedGrade
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

	 /**
   * Render the list of selected subjects as clickable tags.
   * Clicking a tag removes that subject from the selection.
   */
	const renderSelectedSubjects = () => {
		if (!selectedSubjects || selectedSubjects.length === 0) {
			return <p key="no-subjects">No subjects selected</p>;
		}

		return (
			<div className="tagContainer" key="selected-subjects-list">
				{selectedSubjects.map((subject) => (
					<Tag
						onClick={() => toggleSubjectSelection(subject)}
						key={subject._id}
						text={subject.name}
					/>
				))}
			</div>
		);
	};

	  /**
   * Render the list of selected grades as clickable tags.
   * Clicking a tag removes that grade from the selection.
   */
	const renderSelectedGrades = () => {
		if (!selectedGrades || selectedGrades.length === 0) {
			return <p key="no-grades">No grades selected</p>;
		}

		return (
			<div className="tagContainer" key="selected-grades-list">
				{selectedGrades.map((grade) => (
					<Tag
						onClick={() => toggleGradeSelection(grade)}
						key={grade._id}
						text={grade.name}
					/>
				))}
			</div>
		);
	};

	**
   * Subjects <Select multiple /> with index-based values (index+1).
   * Displays subject names and maps values back to Subject objects on change.
   */
	const renderSubjectSelection = () => {
		return (
			<>
				<InputLabel
					style={{ color: "white" }}
					className="inputLabel"
					id="subjectsInputLabel"
				>
					Subjects
				</InputLabel>
				<Select
					labelId="subjectsInputLabel"
					className="optionSelect"
					multiple
					value={selectedSubjects.map((subject) => subject.name)}
					onChange={(e) => handleSubjectChange(e.target.value)}
					input={<OutlinedInput label="Subject" />}
				>
					{allSubjects.map((subject, index) => (
						<MenuItem key={subject._id} value={index + 1}>
							{subject.name}
						</MenuItem>
					))}
				</Select>
			</>
		);
	};

	/**
   * Grades <Select multiple /> with index-based values (index+1).
   * Displays grade names and maps values back to Grade objects on change.
   */
	const renderGradesSubjectSelection = () => {
		return (
			<>
				<InputLabel
					style={{ color: "white" }}
					className="inputLabel"
					id="gradesInputLabel"
				>
					Grades
				</InputLabel>
				<Select
					labelId="gradesInputLabel"
					className="optionSelect"
					multiple
					value={selectedGrades.map((grade) => grade.name)}
					onChange={(e) => handleGradeChange(e.target.value)}
					input={<OutlinedInput label="Subject" />}
				>
					{allGrades.map((grade, index) => (
						<MenuItem key={grade._id} value={index + 1}>
							{grade.name}
						</MenuItem>
					))}
				</Select>
			</>
		);
	};

	return (
		<div className="questionsSidebar">
			<button onClick={showCreateQuestionForm} key="create-question">
				➕ Create Question
			</button>
			{renderSubjectSelection()}
			{renderGradesSubjectSelection()}
			<label>Selected Subjects:</label>
			{renderSelectedSubjects()}
			<label>Selected Grades:</label>
			{renderSelectedGrades()}
		</div>
	);
}

QuestionsSidebar.propTypes = {
	selectedSubjects: PropTypes.array.isRequired,
	selectedGrades: PropTypes.array.isRequired,
	setSelectedSubjects: PropTypes.func.isRequired,
	setSelectedGrades: PropTypes.func.isRequired,
	showCreateQuestionForm: PropTypes.func.isRequired,
};

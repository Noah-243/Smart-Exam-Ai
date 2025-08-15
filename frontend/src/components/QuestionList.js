/**
 * QuestionList.jsx
 *
 * This component displays a list of questions retrieved from the server.
 * When the component is mounted, it sends an API request to fetch all questions,
 * and then renders them as a simple unordered list.
 *
 * Features:
 * - Uses `useEffect` to fetch questions once on component mount
 * - Stores the retrieved questions in local state using `useState`
 * - Maps over the questions array to display each question's body
 *
 * Technologies used:
 * - React (useState, useEffect)
 * - External API call: `getQuestions` from `../api/questions`
 *
 * @returns {JSX.Element} The rendered question list UI
 */

import React, { useEffect, useState } from "react";
import { getQuestions } from "../api/questions";

// State to hold the list of questions
const QuestionList = () => {
	const [questions, setQuestions] = useState([]);

	// Fetch questions when the component mounts
	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const data = await getQuestions();
				setQuestions(data.data);
			} catch (error) {
				console.error("Error fetching questions:", error);
			}
		};

		fetchQuestions(); // Trigger the fetch function
	}, []);

	return (
		<div>
			<h1>Question List</h1>
			<ul>
				{questions.map((question) => (
					<li key={question._id}>{question.body}</li>
				))}
			</ul>
		</div>
	);
};

export default QuestionList;

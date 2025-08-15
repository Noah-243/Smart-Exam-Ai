/**
 * @fileoverview Service for interacting with Google's Gemini AI models.
 * Provides AI-powered test grading and question generation capabilities.
 *
 * Features:
 * - Multiple model support with fallback
 * - Test grading with detailed feedback
 * - Question generation
 * - Error handling and safety filters
 * - Response parsing and validation
 * - Progress tracking
 *
 * @module GeminiService
 * @requires @google/generative-ai
 * @requires ../config/api-keys
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/api-keys";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Service class for interacting with Google's Gemini AI.
 * Handles test grading, question generation, and model management.
 *
 * @class
 */
class GeminiService {
	/**
	 * Creates a new GeminiService instance.
	 * Initializes available models and status callback.
	 */
	constructor() {
		this.models = [
			{
				name: "gemini-2.5-flash",
				instance: genAI.getGenerativeModel({ model: "gemini-2.5-flash" }),
			},
			{
				name: "gemini-1.5-pro",
				instance: genAI.getGenerativeModel({ model: "gemini-1.5-pro" }),
			},
		];
		this.statusCallback = null;
	}

	/**
	 * Sets a callback function for status updates during AI operations.
	 *
	 * @param {Function} callback - Function to call with status updates
	 */
	setStatusCallback(callback) {
		this.statusCallback = callback;
	}

	/**
	 * Grades a test using Gemini AI with fallback models.
	 * Attempts grading with primary model, falls back to alternatives if needed.
	 *
	 * @async
	 * @param {Array<Object>} studentAnswers - Student's answers to grade
	 * @param {Array<Object>} questions - Test questions with correct answers
	 * @returns {Promise<{
	 *   gradedQuestions: Array<Object>,
	 *   model: string,
	 *   timestamp: Date
	 * }>} Grading results with feedback
	 * @throws {Error} If all models fail or input is invalid
	 */
	async gradeTest(studentAnswers, questions) {
		if (!studentAnswers || !questions) {
			throw new Error("Student answers and questions are required");
		}

		const formattedQuestions = this.formatQuestionsForAI(questions);
		const formattedAnswers = this.formatAnswersForAI(studentAnswers);

		const prompt = this.buildGradingPrompt(
			formattedQuestions,
			formattedAnswers
		);

		// Try with primary model first
		let attemptCount = 0;
		try {
			attemptCount++;
			if (this.statusCallback) {
				this.statusCallback("gemini-1.5-flash", attemptCount);
			}

			const result = await this.callGeminiAPI(this.models[0].instance, prompt);
			const successfulModel = this.models[0].name;

			return this.parseGradingResponse(
				result.response,
				successfulModel,
				questions
			);
		} catch {
			// Try fallback models
			for (const model of this.models.slice(1)) {
				try {
					attemptCount++;
					if (this.statusCallback) {
						this.statusCallback(model.name, attemptCount);
					}

					const result = await this.callGeminiAPI(model.instance, prompt);
					const successfulModel = model.name;

					return this.parseGradingResponse(
						result.response,
						successfulModel,
						questions
					);
				} catch {
					// Continue to next model
				}
			}

			// If all models failed
			throw new Error("All Gemini models failed to grade the test");
		}
	}

	/**
	 * Calls the Gemini API with error handling and safety checks.
	 *
	 * @async
	 * @param {Object} model - Gemini model instance
	 * @param {string} prompt - Input prompt for the model
	 * @returns {Promise<Object>} Model response
	 * @throws {Error} If API call fails or content is blocked
	 * @private
	 */
	async callGeminiAPI(model, prompt) {
		try {
			const result = await model.generateContent({
				contents: [{ role: "user", parts: [{ text: prompt }] }],
				generationConfig: {
					temperature: 0.2,
					topK: 40,
					topP: 0.95,
					maxOutputTokens: 8192,
				},
			});

			if (!result.response) {
				throw new Error("No response from Gemini API");
			}

			return result;
		} catch (error) {
			if (error.message?.includes("SAFETY")) {
				throw new Error("Content was blocked by safety filters");
			}
			throw error;
		}
	}

	/**
	 * Parses and validates the Gemini response for test grading.
	 *
	 * @param {Object} response - Raw response from Gemini
	 * @param {string} successfulModel - Name of the model that generated the response
	 * @param {Array<Object>} originalQuestions - Original test questions
	 * @returns {Object} Parsed and validated grading results
	 * @throws {Error} If response format is invalid
	 * @private
	 */
	parseGradingResponse(response, successfulModel, originalQuestions) {
		try {
			const text = response.text();
			const jsonMatch = text.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				throw new Error("No JSON found in response");
			}

			const parsed = JSON.parse(jsonMatch[0]);

			if (!parsed.questions || !Array.isArray(parsed.questions)) {
				throw new Error("Invalid response format");
			}

			// Create a mapping for question validation
			const questionsWithIds = parsed.questions.map((gradedQuestion, index) => {
				const originalQuestion = originalQuestions[index];
				if (!originalQuestion) {
					throw new Error(`No original question found for index ${index}`);
				}

				return {
					questionId: originalQuestion._id,
					points: Math.max(
						0,
						Math.min(gradedQuestion.points || 0, originalQuestion.points || 1)
					),
					maxPoints: originalQuestion.points || 1,
					feedback: gradedQuestion.feedback || "",
					isCorrect: gradedQuestion.isCorrect || false,
					explanation: gradedQuestion.explanation || "",
				};
			});

			return {
				gradedQuestions: questionsWithIds,
				model: successfulModel,
				timestamp: new Date(),
			};
		} catch (error) {
			throw new Error(`Failed to parse AI response: ${error.message}`);
		}
	}

	/**
	 * Formats questions for AI processing.
	 * Standardizes question format and includes necessary metadata.
	 *
	 * @param {Array<Object>} questions - Questions to format
	 * @returns {Array<Object>} Formatted questions
	 * @private
	 */
	formatQuestionsForAI(questions) {
		return questions.map((q, index) => ({
			id: q._id ?? q.id,
			questionNumber: index + 1,
			body: q.body,
			type: q.type,
			points: q.points || 1,
			answers: q.answers || [],
		}));
	}

	/**
	 * Formats student answers for AI processing.
	 * Standardizes answer format and includes question numbers.
	 *
	 * @param {Array<Object>} answers - Answers to format
	 * @returns {Array<Object>} Formatted answers
	 * @private
	 */
	formatAnswersForAI(answers) {
		return answers.map((answer, index) => ({
			questionNumber: index + 1,
			studentAnswer: answer.answer || "",
		}));
	}

	/**
	 * Builds the grading prompt for AI.
	 * Creates a structured prompt with questions, answers, and grading guidelines.
	 *
	 * @param {Array<Object>} questions - Formatted questions
	 * @param {Array<Object>} answers - Formatted answers
	 * @returns {string} Complete grading prompt
	 * @private
	 */
	buildGradingPrompt(questions, answers) {
		return `You are an expert teacher grading a test. Please grade each student answer based on the questions provided.

QUESTIONS:
${questions
	.map(
		(q) => `
Question ${q.questionNumber}: ${q.body}
Question ${q.questionNumber} (id: ${q.id}): ${q.body}
Type: ${q.type}
Max Points: ${q.points}
${
	q.answers && q.answers.length > 0
		? `Answer Choices: ${q.answers
				.map((a) => `${a.text} (${a.isCorrect ? "Correct" : "Incorrect"})`)
				.join(", ")}`
		: ""
}
`
	)
	.join("\n")}

STUDENT ANSWERS:
${answers
	.map((a) => `Question ${a.questionNumber}: ${a.studentAnswer}`)
	.join("\n")}

Please return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "<the same id you saw in the question line>",
      "points": <number between 0 and max points>,
      "feedback": "<specific feedback for this answer>",
      "isCorrect": <boolean>,
      "explanation": "<explanation of why this answer is correct/incorrect>"
    }
  ]
}

Grading Guidelines:
- For multiple choice: Award full points if correct, 0 if incorrect
- For text answers: Grade based on accuracy, completeness, and understanding
- Provide constructive feedback for each answer
- Be fair but thorough in your assessment`;
	}

	/**
	 * Generates questions using Gemini AI.
	 * Creates questions based on subject, grade level, and difficulty.
	 *
	 * @async
	 * @param {string} subject - Subject area for questions
	 * @param {string} grade - Target grade level
	 * @param {string} difficulty - Difficulty level
	 * @param {number} [count=5] - Number of questions to generate
	 * @returns {Promise<Array<Object>>} Generated questions
	 * @throws {Error} If question generation fails
	 */
	async generateQuestions(subject, grade, difficulty, count = 5) {
		const multipleChoiceCount = Math.floor(count / 2);
	    const openEndedCount = count - multipleChoiceCount;

		const prompt = this.buildQuestionGenerationPrompt(
			subject,
			grade,
			difficulty,
			count,
			multipleChoiceCount,
			openEndedCount
		);

		// Try with primary model first
		try {
			const result = await this.callGeminiAPI(this.models[0].instance, prompt);
			return this.parseQuestionResponse(result.response, this.models[0].name);
		} catch {
			// Try fallback models
			for (const model of this.models.slice(1)) {
				try {
					const result = await this.callGeminiAPI(model.instance, prompt);
					return this.parseQuestionResponse(result.response, model.name);
				} catch {
					// Continue to next model
				}
			}

			throw new Error("Failed to generate questions with all available models");
		}
	}

	/**
	 * Creates a single question based on specific criteria.
	 *
	 * @async
	 * @param {Object} promptData - Question generation parameters
	 * @param {string} promptData.prompt - Base prompt for the question
	 * @param {boolean} promptData.isTextAnswer - Whether it's a text answer question
	 * @param {boolean} promptData.isMultiAnswer - Whether multiple answers are allowed
	 * @param {string} promptData.difficulty - Question difficulty
	 * @param {Array<string>} promptData.gradeOptions - Available grade levels
	 * @param {Array<string>} promptData.subjectOptions - Available subjects
	 * @param {Array<string>} promptData.difficultyOptions - Available difficulty levels
	 * @returns {Promise<Object>} Generated question
	 * @throws {Error} If question creation fails
	 */
	async createQuestion(promptData) {
		const {
			prompt,
			isTextAnswer,
			isMultiAnswer,
			difficulty,
			gradeOptions,
			subjectOptions,
			difficultyOptions,
		} = promptData;

		const enhancedPrompt = this.buildSingleQuestionPrompt(
			prompt,
			isTextAnswer,
			isMultiAnswer,
			difficulty,
			gradeOptions,
			subjectOptions,
			difficultyOptions
		);

		// Try with primary model first
		try {
			const result = await this.callGeminiAPI(
				this.models[0].instance,
				enhancedPrompt
			);
			return this.parseSingleQuestionResponse(
				result.response,
				this.models[0].name
			);
		} catch {
			// Try fallback models
			for (const model of this.models.slice(1)) {
				try {
					const result = await this.callGeminiAPI(
						model.instance,
						enhancedPrompt
					);
					return this.parseSingleQuestionResponse(result.response, model.name);
				} catch {
					// Continue to next model
				}
			}

			throw new Error("Failed to create question with all available models");
		}
	}

	/**
	 * Builds the question generation prompt.
	 * Creates a structured prompt for generating multiple questions.
	 *
	 * @param {string} subject - Subject area
	 * @param {string} grade - Grade level
	 * @param {string} difficulty - Difficulty level
	 * @param {number} count - Number of questions
	 * @returns {string} Complete generation prompt
	 * @private
	 */
	buildQuestionGenerationPrompt(subject, grade, difficulty, count, multipleChoiceCount, openEndedCount) {
		return `Generate ${count} educational questions for ${subject} at ${grade} level with ${difficulty} difficulty
		Include exactly ${multipleChoiceCount} multiple-choice questions and ${openEndedCount} open-ended text questions.';

The question types must follow this exact distribution:
- {multipleChoiceCount} multiple-choice questions
- {openEndedCount} open-ended (text) questions  

Return ONLY a valid JSON object with this structure:
{
  "questions": [
    {
      "body": "Question text",
      "type": "multiple-choice" or "text",
      "points": 1,
      "answers": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ]
    }
  ]
}
RULES:
- All questions must match the requested subject, grade level, and difficulty.
- The "type" field must be exactly "multiple-choice" or "text".
- Questions must be diverse, relevant, and suitable for the given grade and difficulty.

For text questions, omit the "answers" field.
Ensure questions are appropriate for the specified grade level and difficulty.`;
	}

	/**
	 * Parses the question generation response.
	 *
	 * @param {Object} response - Raw response from Gemini
	 * @param {string} modelName - Name of the model used
	 * @returns {Array<Object>} Parsed questions
	 * @throws {Error} If response format is invalid
	 * @private
	 */
	parseQuestionResponse(response, modelName) {
		try {
			const text = response.text();
			const jsonMatch = text.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				throw new Error("No JSON found in response");
			}

			const parsed = JSON.parse(jsonMatch[0]);

			if (!parsed.questions || !Array.isArray(parsed.questions)) {
				throw new Error("Invalid question format");
			}

					const multipleChoiceCount = parsed.questions.filter(q => q.type === "multiple-choice").length;
		const openEndedCount = parsed.questions.filter(q => q.type === "text").length;

		console.log(" AI Returned Question Breakdown:");
		console.log("• Multiple Choice:", multipleChoiceCount);
		console.log("• Open Ended:", openEndedCount);
		console.log("• Total Questions:", parsed.questions.length);

			return {
				questions: parsed.questions,
				model: modelName,
				timestamp: new Date(),
			};
		} catch (error) {
			throw new Error(`Failed to parse question response: ${error.message}`);
		}
	}

	/**
	 * Builds a prompt for generating a single question.
	 *
	 * @param {Object} params - Question parameters
	 * @returns {string} Complete question prompt
	 * @private
	 */
	buildSingleQuestionPrompt(
		userPrompt,
		isTextAnswer,
		isMultiAnswer,
		difficulty,
		gradeOptions,
		subjectOptions,
		difficultyOptions
	) {
		return `You are an expert educator creating a single question based on the user's requirements.

USER REQUEST: ${userPrompt}

MANDATORY QUESTION SETTINGS (DO NOT CHANGE THESE):
- Question Type: ${isTextAnswer ? "Text/Open-ended" : "Multiple Choice"}
- Multiple Answers Allowed: ${isMultiAnswer ? "Yes" : "No"}
- REQUIRED DIFFICULTY LEVEL: ${difficulty} (YOU MUST USE EXACTLY THIS DIFFICULTY - DO NOT CHANGE IT)

AVAILABLE GRADES: [${gradeOptions || ""}]
AVAILABLE SUBJECTS: [${subjectOptions || ""}]
AVAILABLE DIFFICULTIES: [${difficultyOptions || ""}]

CRITICAL INSTRUCTIONS:
1. Create ONE question that matches the user's request
2. ALWAYS select an appropriate grade level and subject from the available options based on the user's request
3. MANDATORY: You MUST include a subject, grade level, and difficulty in your response
4. For subject selection: Use the EXACT NAME from AVAILABLE SUBJECTS (e.g., "Mathematics", "Physics", "English")
5. For grade selection: Use the EXACT NAME from AVAILABLE GRADES (e.g., "Third Grade", "Seventh Grade", "Twelfth Grade")
6. DIFFICULTY REQUIREMENT: You MUST use "${difficulty}" as the difficulty level - DO NOT use any other difficulty level regardless of the question content
7. For multiple choice questions: 
   - Create 4 distinct answer options
   - Put answer options in the "answers" array, NOT in the question body
   - Mark exactly one as correct (unless isMultiAnswer is true)
   - Do NOT include answer choices in the question body text
8. For text questions, provide detailed grading guidelines
9. Generate a brief, descriptive title for the question
10. Ensure the question complexity and content are appropriate for the "${difficulty}" difficulty level

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Brief descriptive title for the question",
  "body": "The question text here - do NOT include answer options in this text",
  "type": "${isTextAnswer ? "text" : "multiple-choice"}",
  "isTextAnswer": ${isTextAnswer},
  "isMultiAnswer": ${isMultiAnswer},
  "difficulty": "${difficulty}",
  "gradingGuidelines": "${
		isTextAnswer ? "Detailed grading guidelines for text questions" : ""
	}",
  "answers": [${
		isTextAnswer
			? ""
			: `
    {"body": "First answer option", "isCorrect": false},
    {"body": "Second answer option", "isCorrect": true},
    {"body": "Third answer option", "isCorrect": false},
    {"body": "Fourth answer option", "isCorrect": false}`
	}
  ],
  "gradeLevel": {
    "name": "Grade name"
  },
  "subject": {
    "name": "Subject name"
  }
}

IMPORTANT: 
- For multiple choice: Question body should ONLY contain the question, NOT the answer choices
- Always populate gradeLevel, subject, and difficulty fields with appropriate values from available options
- Use EXACT NAMES from AVAILABLE SUBJECTS, AVAILABLE GRADES, and AVAILABLE DIFFICULTIES - these will be matched to database IDs automatically
- For text questions, set answers to empty array []
- Example: If AVAILABLE SUBJECTS contains "Mathematics", use "Mathematics" as the subject name
- Example: If AVAILABLE GRADES contains "Fifth Grade", use "Fifth Grade" as the grade name
- CRITICAL: The difficulty field MUST ALWAYS be "${difficulty}" - no exceptions, no matter what the question content suggests
- Generate a concise, descriptive title that summarizes the question topic
- NEVER leave subject, gradeLevel, difficulty, or title empty - always analyze the question content to determine the appropriate values

FINAL REMINDER: The "difficulty" field in your JSON response MUST be "${difficulty}" exactly. Do not use any other difficulty level.`;
	}

	/**
	 * Parses the response for a single question.
	 *
	 * @param {Object} response - Raw response from Gemini
	 * @param {string} modelName - Name of the model used
	 * @returns {Object} Parsed question
	 * @throws {Error} If response format is invalid
	 * @private
	 */
	parseSingleQuestionResponse(response, modelName) {
		try {
			const text = response.text();
			const jsonMatch = text.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				throw new Error("No JSON found in response");
			}

			const parsed = JSON.parse(jsonMatch[0]);

			// Validate required fields
			if (!parsed.body) {
				throw new Error("Question body is required");
			}

			// Ensure answers array exists for multiple choice questions
			if (
				!parsed.isTextAnswer &&
				(!parsed.answers || !Array.isArray(parsed.answers))
			) {
				throw new Error("Multiple choice questions must have answers array");
			}

			// Handle subject mapping: AI might return subject name instead of ID
			if (parsed.subject?.name && !parsed.subject?.id) {
				// Try to extract subject options to find matching ID
				const subjectMatches = text.match(/AVAILABLE SUBJECTS: \{([^}]+)\}/);
				if (subjectMatches) {
					const subjectOptions = subjectMatches[1];
					// Look for pattern like "id": "name"
					const subjectRegex = new RegExp(
						`"([^"]+)":\\s*"${parsed.subject.name}"`,
						"i"
					);
					const idMatch = subjectOptions.match(subjectRegex);
					if (idMatch) {
						parsed.subject.id = idMatch[1];
					}
				}
			}

			// Return the parsed question with metadata
			return {
				...parsed,
				model: modelName,
				timestamp: new Date(),
			};
		} catch (error) {
			throw new Error(`Failed to parse question response: ${error.message}`);
		}
	}
}

export default new GeminiService();

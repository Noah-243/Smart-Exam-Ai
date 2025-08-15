/**
 * Gemini AI Service
 * Integrates Google's Gemini AI for intelligent test grading and question generation
 *
 * Features:
 * - Automated test grading with AI analysis
 * - Individual answer evaluation with detailed feedback
 * - Intelligent test generation based on requirements
 * - Multiple model fallback for reliability
 * - Context-aware grading guidelines
 *
 * @module services/gemini.service
 * @author Exemind-AI Team
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use environment variable for API key (will need to be set in .env)
const GEMINI_API_KEY =
	process.env.GEMINI_API_KEY || "AIzaSyC8P5uS4UySF7Xt-EbhRPL1arWsoL2qEDE";

console.log(`🤖 Initializing Gemini AI Service...`);
console.log(
	`   🔑 API Key configured: ${
		GEMINI_API_KEY ? "Yes (***" + GEMINI_API_KEY.slice(-4) + ")" : "No"
	}`
);

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Gemini AI Service Class
 * Provides AI-powered grading and test generation capabilities
 */
class GeminiService {
	/**
	 * Initialize Gemini service with primary and fallback models
	 * Sets up multiple AI models for redundancy and reliability
	 */
	constructor() {
		console.log(`🔧 Setting up Gemini AI models...`);

		// Primary model is gemini-1.5-flash (latest and most capable)
		this.primaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
		console.log(`   ✅ Primary model: gemini-1.5-flash`);

		// Fallback models in case the primary fails
		this.fallbackModels = ["gemini-1.0-pro", "gemini-pro"].map((model) => {
			console.log(`   🔄 Fallback model: ${model}`);
			return genAI.getGenerativeModel({ model });
		});

		console.log(
			`✅ Gemini AI Service initialized with ${
				this.fallbackModels.length + 1
			} models`
		);
	}

	/**
	 * Grade a complete test using Gemini AI
	 * Analyzes all test questions and student answers to provide comprehensive grading
	 *
	 * @async
	 * @method gradeTest
	 * @param {Object} testData - The test data including questions and answers
	 * @param {string} testData._id - Test identifier
	 * @param {Array} testData.questions - Array of question objects
	 * @param {Array} testData.answers - Array of student answer objects
	 * @returns {Promise<Object>} The grading result with scores and feedback
	 * @throws {Error} When AI grading fails or API errors occur
	 */
	async gradeTest(testData) {
		console.log(`\n🎯 =============== AI TEST GRADING ===============`);
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`📝 Test ID: ${testData._id}`);
		console.log(`📊 Questions count: ${testData.questions?.length || 0}`);
		console.log(`📋 Answers count: ${testData.answers?.length || 0}`);

		try {
			console.log(`🔄 Starting test grading process...`);

			// Format questions for grading
			console.log(`📊 Formatting questions for AI analysis...`);
			const formattedQuestions = this.formatQuestionsForGrading(testData);

			// Log the formatted questions for debugging
			console.log(
				`✅ Formatted ${formattedQuestions.length} questions for grading:`
			);
			formattedQuestions.forEach((q, idx) => {
				const answerPreview = q.studentAnswer.substring(0, 50);
				const answerSuffix = q.studentAnswer.length > 50 ? "..." : "";
				console.log(
					`   ${idx + 1}. ${q.questionType} (${
						q.points
					}pts): "${answerPreview}${answerSuffix}"`
				);
			});

			// Create the prompt
			console.log(`🤖 Creating AI grading prompt...`);
			const prompt = this.createGradingPrompt(formattedQuestions);

			// Log the first and last part of the prompt
			const promptPreview =
				prompt.substring(0, 300) +
				"..." +
				prompt.substring(prompt.length - 300);
			console.log(`   📝 Prompt created (${prompt.length} characters)`);
			console.log(`   🔍 Preview: ${promptPreview}`);

			// Call Gemini API
			console.log(`🚀 Sending test data to Gemini AI for evaluation...`);
			const startTime = Date.now();
			const result = await this.callGeminiWithFallback(prompt);
			const processingTime = Date.now() - startTime;

			// Log a preview of the response
			const responsePreview =
				result.substring(0, 300) + (result.length > 300 ? "..." : "");
			console.log(`✅ Received AI response in ${processingTime}ms`);
			console.log(`   📏 Response length: ${result.length} characters`);
			console.log(`   📖 Preview: ${responsePreview}`);

			// Parse the response
			console.log(`🔍 Parsing AI response...`);
			const parsedResponse = this.parseGeminiResponse(
				result,
				formattedQuestions
			);

			// Log the parsed results
			console.log(`✅ Test grading completed successfully!`);
			console.log(
				`   📊 Questions graded: ${parsedResponse.questions?.length || 0}`
			);
			console.log(`   🎯 Total score: ${parsedResponse.score || 0}%`);
			console.log(`   ⏱️ Processing time: ${processingTime}ms`);
			console.log(`🎯 =============================================\n`);

			return parsedResponse;
		} catch (error) {
			console.error(
				`❌ Test grading failed for test ${testData._id}:`,
				error.message
			);
			console.error(`   💥 Error type: ${error.name}`);
			console.error(`   📝 Error details: ${error.message}`);
			console.log(`🎯 =============================================\n`);
			throw error;
		}
	}

	/**
	 * Grade an individual answer using Gemini AI
	 * Provides detailed analysis and scoring for a single question-answer pair
	 *
	 * @async
	 * @method gradeAnswer
	 * @param {Object} answer - The student's answer object
	 * @param {string} answer.answer - The actual answer text
	 * @param {Object} question - The corresponding question object
	 * @param {string} question._id - Question identifier
	 * @param {string} question.body - Question text
	 * @param {boolean} question.isTextAnswer - Whether it's a text question
	 * @param {string} [question.gradingGuidelines] - Specific grading guidelines
	 * @param {Number} [points=10] - Maximum points for this question
	 * @returns {Promise<Object>} The grading result for the answer with score and feedback
	 * @throws {Error} When AI grading fails or API errors occur
	 */
	async gradeAnswer(answer, question, points = 10) {
		console.log(`\n🎯 =============== AI ANSWER GRADING ===============`);
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`❓ Question ID: ${question._id}`);
		console.log(`📊 Max points: ${points}`);
		console.log(
			`📝 Answer type: ${question.isTextAnswer ? "Text" : "Multiple Choice"}`
		);

		try {
			console.log(`🔄 Starting individual answer grading...`);

			// Log answer details (first 100 chars for privacy)
			const answerPreview = (answer.answer || "No answer provided").substring(
				0,
				100
			);
			const answerSuffix = (answer.answer || "").length > 100 ? "..." : "";
			console.log(`   📝 Student answer: "${answerPreview}${answerSuffix}"`);
			console.log(
				`   📏 Answer length: ${(answer.answer || "").length} characters`
			);

			// Format single question for grading
			console.log(`📊 Formatting question for AI analysis...`);
			const formattedQuestion = {
				questionNumber: 1,
				questionText: question.body || question.text,
				questionType:
					question.answers?.length > 0 && !question.isTextAnswer
						? "multiple_choice"
						: "open_ended",
				correctAnswer: this.getCorrectAnswer(question),
				studentAnswer: answer.answer || "No answer provided",
				gradingGuidelines: question.gradingGuidelines || "",
				points: points, // Explicitly set the points for this question
			};

			console.log(
				`   ✅ Question formatted as: ${formattedQuestion.questionType}`
			);
			console.log(`   🎯 Correct answer: ${formattedQuestion.correctAnswer}`);
			console.log(
				`   📋 Has guidelines: ${
					formattedQuestion.gradingGuidelines ? "Yes" : "No"
				}`
			);

			// Create the prompt for a single question
			console.log(`🤖 Creating AI grading prompt for single answer...`);
			const prompt = this.createGradingPrompt([formattedQuestion]);

			// Call Gemini API
			console.log(`🚀 Sending answer to Gemini AI for evaluation...`);
			const startTime = Date.now();
			const result = await this.callGeminiWithFallback(prompt);
			const processingTime = Date.now() - startTime;

			console.log(`✅ Received AI response in ${processingTime}ms`);

			// Parse the response for a single answer
			console.log(`🔍 Parsing AI response...`);
			const parsedResponse = this.parseGeminiResponse(result, [
				formattedQuestion,
			]);

			// Debug logging to see what points are coming back from the AI
			if (parsedResponse.questions && parsedResponse.questions.length > 0) {
				const aiPoints = parsedResponse.questions[0].points || 0;
				const aiPercentage = Math.round((aiPoints / points) * 100);
				console.log(`✅ Answer grading completed successfully!`);
				console.log(
					`   🎯 AI assigned score: ${aiPoints}/${points} points (${aiPercentage}%)`
				);
				console.log(
					`   📝 Feedback provided: ${
						parsedResponse.questions[0].feedback ? "Yes" : "No"
					}`
				);
				console.log(`   ⏱️ Processing time: ${processingTime}ms`);
			}

			console.log(`🎯 ===============================================\n`);

			// Return just the first question's grading
			return {
				...parsedResponse.questions[0],
				summary: parsedResponse.summary,
			};
		} catch (error) {
			console.error(
				`❌ Answer grading failed for question ${question._id}:`,
				error.message
			);
			console.error(`   💥 Error type: ${error.name}`);
			console.error(`   📝 Error details: ${error.message}`);
			console.log(`🎯 ===============================================\n`);
			throw error;
		}
	}

	/**
	 * Call Gemini API with fallback mechanism
	 * Attempts primary model first, then falls back to alternative models if needed
	 *
	 * @async
	 * @method callGeminiWithFallback
	 * @param {string} prompt - The prompt to send to Gemini
	 * @returns {Promise<string>} The AI response text
	 * @throws {Error} When all models fail to respond
	 */
	async callGeminiWithFallback(prompt) {
		console.log(`🔄 Initiating Gemini API call with fallback strategy...`);

		try {
			// Try primary model first
			console.log(`   🚀 Attempting primary model: gemini-1.5-flash`);
			const startTime = Date.now();
			const result = await this.callGeminiModel(this.primaryModel, prompt);
			const responseTime = Date.now() - startTime;

			console.log(`   ✅ Primary model succeeded in ${responseTime}ms`);
			return result;
		} catch (error) {
			console.warn(`   ⚠️ Primary model failed: ${error.message}`);
			console.log(`   🔄 Trying fallback models...`);

			// Try fallback models in sequence
			for (let i = 0; i < this.fallbackModels.length; i++) {
				const model = this.fallbackModels[i];
				try {
					console.log(
						`   🚀 Attempting fallback model ${i + 1}: ${model._model}`
					);
					const startTime = Date.now();
					const result = await this.callGeminiModel(model, prompt);
					const responseTime = Date.now() - startTime;

					console.log(
						`   ✅ Fallback model ${model._model} succeeded in ${responseTime}ms`
					);
					return result;
				} catch (fallbackError) {
					console.warn(
						`   ❌ Fallback model ${model._model} failed: ${fallbackError.message}`
					);
				}
			}

			// If all models fail, throw error
			console.error(`   💥 ALL MODELS FAILED - no AI response available`);
			throw new Error(
				"All Gemini models failed. Please check API key or try again later."
			);
		}
	}

	/**
	 * Call a specific Gemini model with configuration
	 * Makes the actual API call to Google's Gemini service
	 *
	 * @async
	 * @method callGeminiModel
	 * @param {Object} model - The Gemini model instance to call
	 * @param {string} prompt - The prompt to send to the model
	 * @returns {Promise<string>} The generated content from the AI
	 * @throws {Error} When the model call fails or returns invalid response
	 */
	async callGeminiModel(model, prompt) {
		console.log(`     🤖 Configuring AI generation parameters...`);

		// Configure generation parameters for optimal results
		const generationConfig = {
			temperature: 0.1, // Low temperature for consistent, focused responses
			topK: 40, // Consider top 40 tokens for diversity
			topP: 0.95, // Use nucleus sampling with 95% probability mass
			maxOutputTokens: 8192, // Maximum response length
		};

		console.log(
			`     📊 Generation config: temp=${generationConfig.temperature}, topK=${generationConfig.topK}, topP=${generationConfig.topP}`
		);
		console.log(`     📏 Max tokens: ${generationConfig.maxOutputTokens}`);
		console.log(`     📤 Sending request to AI model...`);

		const result = await model.generateContent({
			contents: [{ parts: [{ text: prompt }] }],
			generationConfig,
		});

		const response = result.response;
		return response.text();
	}

	/**
	 * Format test data for grading by Gemini
	 * @param {Object} testData - Test data from database
	 * @returns {Array} Formatted questions for grading
	 */
	formatQuestionsForGrading(testData) {
		// Extract questions and student answers
		const { scheduledTest, answers } = testData;

		if (
			!scheduledTest?.test?.questions ||
			!Array.isArray(scheduledTest.test.questions)
		) {
			console.error("No questions found in test data");
			return [];
		}

		if (!answers || !Array.isArray(answers)) {
			console.error("No answers found in test data");
			return [];
		}

		console.log(
			`Formatting ${scheduledTest.test.questions.length} questions with ${answers.length} student answers`
		);

		const questions = scheduledTest.test.questions;

		// Create a map of answers by question ID for efficient lookup
		const answerMap = {};
		answers.forEach((answer) => {
			if (answer.question) {
				const questionId =
					typeof answer.question === "object"
						? answer.question._id.toString()
						: answer.question.toString();
				answerMap[questionId] = answer;
				console.log(
					`Mapped answer for question ${questionId}: "${
						answer.answer?.substring(0, 30) || "No answer"
					}"...`
				);
			}
		});

		return questions
			.map((q, index) => {
				// Handle both structures: { question: {...} } and direct question object
				const questionData = q.question || q;
				if (!questionData || !questionData._id) {
					console.error(`Invalid question at index ${index}, missing _id`);
					return null;
				}

				const questionId = questionData._id.toString();

				// Get the points for this question (default to 10 if not specified)
				// First check on the question item in the test (this is most authoritative)
				// Then fallback to the question data itself, and finally default to 10
				const pointValue = q.points || questionData.points || 10;

				// Log the points being used for each question
				console.log(
					`Question ${index + 1} (${questionId}) points: ${pointValue}`
				);

				// Find matching student answer using the map
				const studentAnswer = answerMap[questionId];

				if (!studentAnswer) {
					console.warn(
						`No student answer found for question ${questionId} (${index + 1})`
					);
				} else {
					console.log(
						`Found student answer for question ${questionId}: ${
							studentAnswer.answer?.substring(0, 50) || "No answer"
						}`
					);
				}

				const formattedQuestion = {
					questionNumber: index + 1,
					questionIndex: index,
					questionId: questionId,
					questionText:
						questionData.body ||
						questionData.text ||
						"No question text available",
					questionType:
						Array.isArray(questionData.answers) &&
						questionData.answers.length > 0 &&
						!questionData.isTextAnswer
							? "multiple_choice"
							: "open_ended",
					correctAnswer: this.getCorrectAnswer(questionData),
					studentAnswer: studentAnswer?.answer || "No answer provided",
					gradingGuidelines: questionData.gradingGuidelines || "",
					points: pointValue, // Include the points for this question
				};

				// Log the formatted question
				console.log(
					`Formatted Q${index + 1}: type=${
						formattedQuestion.questionType
					}, points=${formattedQuestion.points}, answer: "${
						formattedQuestion.studentAnswer?.substring(0, 30) || "None"
					}"...`
				);

				return formattedQuestion;
			})
			.filter((q) => q !== null); // Remove any null entries
	}

	/**
	 * Get correct answer from question data
	 * @param {Object} question - Question data
	 * @returns {string} Correct answer
	 */
	getCorrectAnswer(question) {
		if (!question) return "";

		if (question.isTextAnswer) {
			return question.gradingGuidelines || "";
		}

		if (Array.isArray(question.answers)) {
			const correctAnswers = question.answers
				.filter((ans) => ans.isCorrect)
				.map((ans) => ans.body);
			return correctAnswers.join(", ");
		}

		return "";
	}

	/**
	 * Create a prompt for Gemini to grade the test
	 * @param {Array} questions - Array of question and answer pairs
	 * @returns {string} - The formatted prompt
	 */
	createGradingPrompt(questions) {
		let prompt = `You are an experienced and encouraging teacher tasked with grading a test. 
Grade each answer based on its correctness compared to the expected answer, providing personalized feedback directly to the student.

IMPORTANT INSTRUCTIONS:
1. NO YAPPING - don't include any explanations or commentary outside the required JSON format.
2. Output ONLY valid JSON that can be parsed.
3. For each question, evaluate if the student's answer is correct and provide personalized feedback.
4. GRADING SCALE: CRITICAL - You MUST use the exact point value specified for each question.`;

		// Determine if all questions use the same scale or different scales
		const allQuestionsSameScale = questions.every(
			(q) => (q.points || 10) === (questions[0].points || 10)
		);

		if (allQuestionsSameScale) {
			const pointValue = questions[0].points || 10;
			prompt += `
   For all questions (maximum ${pointValue} points each):
   - CORRECT: ${pointValue} points - If the answer matches the correct answer exactly or is semantically equivalent.
   - PARTIALLY CORRECT: Use your judgment to assign a value between 1 and ${
			pointValue - 1
		} points depending on how close the answer is to correct.
   - INCORRECT: 0 points - If the answer is wrong.`;
		} else {
			prompt += `
   CRITICAL: Each question has its own maximum point value specified with "Maximum Points: X".
   You MUST grade each question based on its individual maximum point value.
   - CORRECT: 100% of available points - If the answer matches the correct answer exactly or is semantically equivalent.
   - PARTIALLY CORRECT: Between 1% and 99% of available points - Use your judgment based on how close the answer is to correct.
   - INCORRECT: 0 points - If the answer is wrong.`;
		}

		prompt += `
5. Write feedback in a direct, personalized tone addressing the student, such as "You understood this concept well" or "You need to review this topic because..."
6. For incorrect answers, always explain WHY the answer is wrong and provide the correct approach.
7. For multiple-choice questions, be direct about whether the answer was correct or not.
8. For open-ended questions, be more detailed in your feedback, commenting on the student's understanding and expression.
9. CRITICAL: Include a summary assessment of overall performance, identifying strengths and areas for improvement.

Here are the questions and answers to grade:

`;

		questions.forEach((q) => {
			prompt += `
Question ${q.questionNumber}: ${q.questionText}
Question Type: ${q.questionType}
Maximum Points: ${q.points || 10} (YOU MUST USE THIS EXACT POINT VALUE)
Correct Answer: ${q.correctAnswer}
Student Answer: ${q.studentAnswer}`;

			// Include grading guidelines if they exist
			if (q.gradingGuidelines && q.gradingGuidelines.trim()) {
				prompt += `
Grading Guidelines: ${q.gradingGuidelines}`;
			}

			prompt += `\n`;
		});

		prompt += `
Now grade each answer and provide your evaluation in the following JSON format:

{
  "summary": "An encouraging overall assessment of the test performance, highlighting strengths and suggesting areas to improve. Address the student directly.",
  "totalCorrect": number,
  "totalQuestions": ${questions.length},
  "score": number,
  "questions": [
    {
      "questionNumber": 1,
      "questionType": "multiple_choice OR open_ended",
      "isCorrect": boolean,
      "points": number, /* THIS MUST BE BETWEEN 0 AND THE MAXIMUM POINTS SPECIFIED FOR THIS QUESTION */
      "feedback": "Personalized feedback for this answer, addressing the student directly and explaining why the answer is correct/incorrect"
    },
    ...more questions...
  ]
}

For multiple-choice questions:
- When CORRECT: Briefly acknowledge the student's correct answer and explain why it's right.
- When INCORRECT: Explain why their choice was wrong and what the right answer means.

For open-ended questions:
- Evaluate both content and understanding.
- Comment specifically on what elements were good or missing.
- Provide more detailed and constructive suggestions for improvement.
- IMPORTANT: Follow any provided grading guidelines for each question.

Make sure to include a "score" field (0-100) calculated as the percentage of total points earned.
The score should be calculated as: (total points earned / maximum possible points) * 100.
Include this score as a number (without the % symbol) in the JSON output.

Your feedback should be encouraging even when pointing out errors. Use phrases like "You've shown good understanding of..." or "You might want to review..." rather than just stating something is wrong.

Remember, NO explanations outside the JSON, just the valid and parseable JSON output.`;

		return prompt;
	}

	/**
	 * Parse Gemini response into structured format
	 * @param {string} response - Raw text response from Gemini
	 * @param {Array} originalQuestions - Original questions array
	 * @returns {Object} Parsed evaluation results
	 */
	parseGeminiResponse(response, originalQuestions) {
		try {
			// Extract JSON from the response (in case there's any surrounding text)
			const jsonMatch = response.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				console.error("No valid JSON found in Gemini response");
				console.log("Raw response:", response);
				throw new Error("No valid JSON found in AI response");
			}

			const jsonStr = jsonMatch[0];
			console.log(`Extracted JSON string of length ${jsonStr.length}`);

			// Parse the JSON
			const parsed = JSON.parse(jsonStr);
			console.log("Successfully parsed Gemini response into JSON");

			// Ensure questions array exists
			if (!parsed.questions || !Array.isArray(parsed.questions)) {
				console.error("No questions array in Gemini response");
				console.log("Parsed response:", JSON.stringify(parsed, null, 2));
				throw new Error(
					"Invalid response format from Gemini: missing questions array"
				);
			}

			console.log(
				`Gemini graded ${parsed.questions.length} questions with overall score ${parsed.score}`
			);

			// Create a map for original questions by question number for easy lookup
			const originalQuestionMap = {};
			originalQuestions.forEach((question) => {
				if (question && question.questionNumber) {
					originalQuestionMap[question.questionNumber] = question;
				}
			});

			// Log the mapping
			console.log("Original question mapping:");
			Object.entries(originalQuestionMap).forEach(([number, question]) => {
				console.log(
					`Question number ${number} maps to ID ${question.questionId}`
				);
			});

			// Map back to original question IDs for better integration
			if (parsed.questions && Array.isArray(parsed.questions)) {
				console.log("Mapping AI feedback to original question IDs...");
				console.log(
					`Original questions: ${originalQuestions.length}, AI graded questions: ${parsed.questions.length}`
				);

				parsed.questionsWithIds = parsed.questions.map((q, index) => {
					// First try to find by question number
					const qNum = q.questionNumber || index + 1;
					console.log(`Mapping AI question ${qNum} (index ${index})`);

					// Get the original question from our map
					const originalQuestion =
						originalQuestionMap[qNum] || originalQuestions[index];

					if (!originalQuestion) {
						console.warn(
							`Could not find original question for AI question ${qNum}`
						);
						// If we couldn't find a matching question, we'll need to provide defaults
						return {
							...q,
							points: q.points || 0,
							feedback: q.feedback || "No feedback provided",
							questionId: null,
							questionType: q.questionType || "unknown",
							maxPoints: 10,
						};
					}

					// Log the mapping we're creating
					console.log(
						`Matched AI question ${qNum} to original question ID ${originalQuestion.questionId}`
					);

					// Format feedback
					let feedback = q.feedback || "";

					// Scale points if necessary based on max points of the question
					let aiPoints = q.points || 0;
					const questionPoints = originalQuestion?.points || 10;

					// If AI graded on a 10-point scale but the question is worth more, scale it up
					if (questionPoints > 10 && aiPoints <= 10) {
						const scaledPoints = Math.round((aiPoints / 10) * questionPoints);
						console.log(
							`Scaling points from ${aiPoints}/10 to ${scaledPoints}/${questionPoints} for question ${qNum}`
						);
						aiPoints = scaledPoints;
					}

					// Add question ID for mapping
					return {
						...q,
						points: aiPoints,
						feedback,
						questionId: originalQuestion?.questionId || null,
						questionType:
							originalQuestion?.questionType || q.questionType || "unknown",
						maxPoints: questionPoints, // Keep track of the max points for reference
					};
				});

				// Log the mapped results
				console.log(
					`Mapped ${parsed.questionsWithIds.length} questions with IDs`
				);
				parsed.questionsWithIds.forEach((q, idx) => {
					console.log(
						`Mapped Q${idx + 1}: ID=${q.questionId}, Points=${q.points}/${
							q.maxPoints
						}`
					);
				});
			}

			return parsed;
		} catch (error) {
			console.error("Failed to parse Gemini response:", error);
			console.log("Raw response:", response.substring(0, 500) + "...");
			throw new Error(`Failed to parse AI response: ${error.message}`);
		}
	}

	/**
	 * Generate a complete test using AI
	 * @param {Object} params - Parameters for test generation
	 * @param {Array} params.existingQuestions - Array of existing questions with _id and text
	 * @param {Object} params.requirements - Test requirements
	 * @returns {Promise<Object>} Generated test with selected questions and new questions
	 */
	async generateTest({ existingQuestions, requirements }) {
		try {
			console.log(
				`Generating AI test with ${existingQuestions.length} existing questions`
			);

			// Create the prompt for test generation
			const prompt = this.createTestGenerationPrompt(
				existingQuestions,
				requirements
			);

			// Call Gemini API
			const result = await this.callGeminiWithFallback(prompt);

			// Parse the response
			const parsedResult = this.parseTestGenerationResponse(
				result,
				requirements
			);

			return parsedResult;
		} catch (error) {
			console.error("Error in generateTest:", error);
			throw error;
		}
	}

	/**
	 * Create prompt for AI test generation
	 * @param {Array} existingQuestions - Available questions
	 * @param {Object} requirements - Test requirements
	 * @returns {string} Formatted prompt
	 */
	createTestGenerationPrompt(existingQuestions, requirements) {
		const {
			totalQuestions,
			multipleChoiceCount,
			openEndedCount,
			difficulty,
			additionalInstructions,
		} = requirements;

		let prompt = `You are an expert educator creating a test. Your task is to:

1. ANALYZE the provided existing questions and SELECT the most appropriate ones for the test
2. CREATE new questions if there aren't enough suitable existing questions
3. ENSURE the final test meets all specified requirements

REQUIREMENTS:
- Total Questions: ${totalQuestions}
- Multiple Choice Questions: ${multipleChoiceCount}
- Open-ended Questions: ${openEndedCount}
- Difficulty Level: ${difficulty}
${
	additionalInstructions
		? `- Additional Instructions: ${additionalInstructions}`
		: ""
}

EXISTING QUESTIONS AVAILABLE (${existingQuestions.length} questions):
`;

		// Add existing questions or note if none available
		if (existingQuestions.length === 0) {
			prompt += `
NO EXISTING QUESTIONS FOUND - You MUST create ALL ${totalQuestions} questions from scratch.
`;
		} else {
			existingQuestions.forEach((q, index) => {
				prompt += `
${index + 1}. ID: ${q._id}
   Text: ${q.text}`;
			});
		}

		prompt += `

INSTRUCTIONS:
1. First, review all existing questions and select the best ones that match the requirements
2. If there aren't enough suitable existing questions, create new ones to fill the gaps
3. If NO existing questions are available, you MUST create ALL ${totalQuestions} new questions
4. Ensure a good mix of difficulty and question types as specified
5. For new questions, create complete question objects with all required fields
6. NEVER return an empty result - always generate the required number of questions

RESPONSE FORMAT (JSON only, no explanations):
{
  "selectedQuestionIds": ["id1", "id2", ...],
  "newQuestions": [
    {
      "body": "Question text here",
      "type": "multiple-choice" or "text",
      "difficulty": "${difficulty}",
      "isMultiAnswer": false,
      "isTextAnswer": true/false,
      "gradingGuidelines": "Guidelines for text questions",
      "answers": [
        {
          "body": "Answer text",
          "isCorrect": true/false,
          "isOpenEnded": false
        }
      ]
    }
  ],
  "testSummary": {
    "totalSelected": number,
    "totalNew": number,
    "multipleChoiceCount": number,
    "openEndedCount": number,
    "reasoning": "Brief explanation of selections and creations"
  }
}

IMPORTANT:
- Selected question IDs must be from the provided existing questions
- New questions must follow the exact structure shown
- For multiple-choice questions: include 3-4 answer options with one correct
- For text questions: set isTextAnswer=true and provide gradingGuidelines
- Total questions must equal ${totalQuestions}
- Question type distribution must match requirements
- Only return valid JSON, no additional text`;

		return prompt;
	}

	/**
	 * Parse the AI response for test generation
	 * @param {string} response - Raw AI response
	 * @param {Object} requirements - Original requirements
	 * @returns {Object} Parsed test generation result
	 */
	parseTestGenerationResponse(response, requirements) {
		try {
			// Extract JSON from response
			const jsonMatch = response.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error("No valid JSON found in AI response");
			}

			const parsed = JSON.parse(jsonMatch[0]);

			// Validate the response structure
			if (
				!parsed.selectedQuestionIds ||
				!Array.isArray(parsed.selectedQuestionIds)
			) {
				parsed.selectedQuestionIds = [];
			}

			if (!parsed.newQuestions || !Array.isArray(parsed.newQuestions)) {
				parsed.newQuestions = [];
			}

			// Validate total count
			const totalGenerated =
				parsed.selectedQuestionIds.length + parsed.newQuestions.length;
			if (totalGenerated !== requirements.totalQuestions) {
				console.warn(
					`AI generated ${totalGenerated} questions but ${requirements.totalQuestions} were requested`
				);

				// If we have fewer questions than required, this is a critical error
				if (totalGenerated === 0) {
					throw new Error(
						"AI failed to generate any questions. This is likely a prompt or parsing error."
					);
				}

				// If we have some but not enough, we can still proceed with a warning
				if (totalGenerated < requirements.totalQuestions) {
					console.warn("Proceeding with fewer questions than requested.");
				}
			}

			console.log(`AI Test Generation Result:
- Selected existing questions: ${parsed.selectedQuestionIds.length}
- Created new questions: ${parsed.newQuestions.length}
- Total: ${totalGenerated}
- Target: ${requirements.totalQuestions}`);

			return parsed;
		} catch (error) {
			console.error("Failed to parse test generation response:", error);
			throw new Error(
				`Failed to parse AI test generation response: ${error.message}`
			);
		}
	}
}

module.exports = new GeminiService();

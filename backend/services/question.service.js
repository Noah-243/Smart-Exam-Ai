/**
 * Question Service
 * Business logic layer for question management in Exemind-AI
 *
 * Features:
 * - CRUD operations for questions
 * - Advanced filtering and pagination
 * - Grade and subject association management
 * - Text answer validation with grading guidelines
 * - Analytics and statistics generation
 *
 * @module services/question.service
 * @author Exemind-AI Team
 */

const Question = require("../models/Question");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Question Service Class
 * Handles all question-related business operations
 */
class QuestionService {
	/**
	 * Create a new question
	 * Validates requirements and creates question with proper associations
	 *
	 * @async
	 * @method createQuestion
	 * @param {Object} questionData - Question data object
	 * @param {string} questionData.body - Question text content
	 * @param {boolean} questionData.isTextAnswer - Whether question requires text answer
	 * @param {string} [questionData.gradingGuidelines] - Guidelines for grading (required for text answers)
	 * @param {Array} [questionData.grades] - Array of grade IDs
	 * @param {Array} [questionData.subjects] - Array of subject IDs
	 * @returns {Promise<Object>} Created question object
	 * @throws {ErrorResponse} When validation fails or creation error occurs
	 */
	async createQuestion(questionData) {
		console.log(`📝 Creating new question...`);
		console.log(
			`   📋 Question type: ${
				questionData.isTextAnswer ? "Text Answer" : "Multiple Choice"
			}`
		);
		console.log(`   👤 Creator: ${questionData.user || "Unknown"}`);
		console.log(
			`   🎯 Difficulty: ${questionData.difficulty || "Not specified"}`
		);

		try {
			// Validate grading guidelines only for text questions
			if (
				questionData.isTextAnswer &&
				!questionData.gradingGuidelines?.trim()
			) {
				console.log(
					`❌ Validation failed: Text questions require grading guidelines`
				);
				throw new ErrorResponse(
					"Grading guidelines are required for text questions",
					400
				);
			}

			// Convert grades and subjects arrays to gradeSubjects array
			if (questionData.grades && questionData.subjects) {
				console.log(
					`🔗 Processing associations: ${questionData.grades.length} grades × ${questionData.subjects.length} subjects`
				);
				questionData.gradeSubjects = questionData.grades.flatMap((grade) =>
					questionData.subjects.map((subject) => ({
						grade,
						subject,
					}))
				);
				console.log(
					`   ✅ Created ${questionData.gradeSubjects.length} grade-subject associations`
				);
				delete questionData.grades;
				delete questionData.subjects;
			}

			const question = await Question.create(questionData);
			console.log(`✅ Question created successfully with ID: ${question._id}`);
			console.log(
				`   📊 Question stats: ${
					question.gradeSubjects?.length || 0
				} associations`
			);

			return question;
		} catch (error) {
			console.error(`❌ Question creation failed:`, error.message);
			throw error;
		}
	}

	/**
	 * Get question by ID with populated references
	 *
	 * @async
	 * @method getQuestionById
	 * @param {string} id - Question ID
	 * @returns {Promise<Object>} Question object with populated references
	 * @throws {ErrorResponse} When question not found
	 */
	async getQuestionById(id) {
		console.log(`🔍 Fetching question by ID: ${id}`);

		try {
			const question = await Question.findById(id)
				.populate("gradeSubjects.grade", "name level")
				.populate("gradeSubjects.subject", "name")
				.populate("user", "name");

			if (!question) {
				console.log(`❌ Question not found with ID: ${id}`);
				throw new ErrorResponse(`Question not found with id of ${id}`, 404);
			}

			console.log(
				`✅ Question retrieved: "${question.body.substring(0, 50)}..."`
			);
			console.log(
				`   📊 Associations: ${
					question.gradeSubjects?.length || 0
				} grade-subject pairs`
			);
			console.log(`   👤 Creator: ${question.user?.name || "Unknown"}`);

			return question;
		} catch (error) {
			console.error(`❌ Failed to fetch question ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * Update existing question
	 * Validates changes and updates question with new data
	 *
	 * @async
	 * @method updateQuestion
	 * @param {string} id - Question ID to update
	 * @param {Object} updateData - Updated question data
	 * @returns {Promise<Object>} Updated question object
	 * @throws {ErrorResponse} When question not found or validation fails
	 */
	async updateQuestion(id, updateData) {
		console.log(`📝 Updating question ID: ${id}`);
		console.log(`   🔄 Update fields: ${Object.keys(updateData).join(", ")}`);

		try {
			// Validate grading guidelines only for text questions
			if (updateData.isTextAnswer && !updateData.gradingGuidelines?.trim()) {
				console.log(
					`❌ Validation failed: Text questions require grading guidelines`
				);
				throw new ErrorResponse(
					"Grading guidelines are required for text questions",
					400
				);
			}

			// Convert grades and subjects arrays to gradeSubjects array if provided
			if (updateData.grades && updateData.subjects) {
				console.log(
					`🔗 Updating associations: ${updateData.grades.length} grades × ${updateData.subjects.length} subjects`
				);
				updateData.gradeSubjects = updateData.grades.flatMap((grade) =>
					updateData.subjects.map((subject) => ({
						grade,
						subject,
					}))
				);
				console.log(
					`   ✅ Updated to ${updateData.gradeSubjects.length} grade-subject associations`
				);
				delete updateData.grades;
				delete updateData.subjects;
			}

			const question = await Question.findByIdAndUpdate(id, updateData, {
				new: true,
				runValidators: true,
			})
				.populate("gradeSubjects.grade", "name level")
				.populate("gradeSubjects.subject", "name")
				.populate("user", "name");

			if (!question) {
				console.log(`❌ Question not found for update: ${id}`);
				throw new ErrorResponse(`Question not found with id of ${id}`, 404);
			}

			console.log(`✅ Question updated successfully`);
			console.log(
				`   📊 Current associations: ${question.gradeSubjects?.length || 0}`
			);

			return question;
		} catch (error) {
			console.error(`❌ Failed to update question ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * Delete question by ID
	 *
	 * @async
	 * @method deleteQuestion
	 * @param {string} id - Question ID to delete
	 * @returns {Promise<Object>} Deleted question object
	 * @throws {ErrorResponse} When question not found
	 */
	async deleteQuestion(id) {
		console.log(`🗑️ Deleting question ID: ${id}`);

		try {
			const question = await Question.findByIdAndDelete(id);
			if (!question) {
				console.log(`❌ Question not found for deletion: ${id}`);
				throw new ErrorResponse(`Question not found with id of ${id}`, 404);
			}

			console.log(`✅ Question deleted successfully`);
			console.log(`   📋 Deleted: "${question.body.substring(0, 50)}..."`);

			return question;
		} catch (error) {
			console.error(`❌ Failed to delete question ${id}:`, error.message);
			throw error;
		}
	}

	/**
	 * Get paginated questions with optional filtering
	 *
	 * @async
	 * @method getQuestions
	 * @param {Object} [query={}] - MongoDB query object for filtering
	 * @param {number} [page=1] - Page number for pagination
	 * @param {number} [limit=10] - Number of items per page
	 * @returns {Promise<Object>} Object containing questions array and pagination info
	 */
	async getQuestions(query = {}, page = 1, limit = 10) {
		console.log(`📋 Fetching questions with pagination`);
		console.log(`   📄 Page: ${page}, Limit: ${limit}`);
		console.log(`   🔍 Query filters: ${Object.keys(query).length} conditions`);

		try {
			// Calculate how many documents to skip
			const skip = (page - 1) * limit;

			// Get total count for pagination info
			const total = await Question.countDocuments(query);
			console.log(`   📊 Total questions matching criteria: ${total}`);

			// Get the paginated questions
			const questions = await Question.find(query)
				.populate("gradeSubjects.grade", "name level")
				.populate("gradeSubjects.subject", "name")
				.populate("user", "name")
				.skip(skip)
				.limit(limit);

			const pagination = {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			};

			console.log(`✅ Retrieved ${questions.length} questions`);
			console.log(
				`   📖 Pagination: Page ${page} of ${pagination.pages} (${total} total)`
			);

			// Return both the questions and pagination info
			return {
				questions,
				pagination,
			};
		} catch (error) {
			console.error(`❌ Failed to fetch questions:`, error.message);
			throw error;
		}
	}

	/**
	 * Get questions filtered by grades, subjects, and creator
	 *
	 * @async
	 * @method getQuestionsByFilters
	 * @param {Object} filters - Filter criteria
	 * @param {Array} [filters.grades] - Array of grade IDs to filter by
	 * @param {Array} [filters.subjects] - Array of subject IDs to filter by
	 * @param {string} [filters.creator] - Creator user ID to filter by
	 * @param {number} [page=1] - Page number for pagination
	 * @param {number} [limit=10] - Number of items per page
	 * @returns {Promise<Object>} Filtered questions with pagination
	 */
	async getQuestionsByFilters(
		{ grades, subjects, creator },
		page = 1,
		limit = 10
	) {
		console.log(`🔍 Applying advanced filters to questions`);
		console.log(`   🎓 Grades filter: ${grades?.length || 0} selected`);
		console.log(`   📚 Subjects filter: ${subjects?.length || 0} selected`);
		console.log(`   👤 Creator filter: ${creator ? "Applied" : "None"}`);

		try {
			// Build the query object
			const query = {};
			const conditions = [];

			if (grades?.length) {
				conditions.push({ "gradeSubjects.grade": { $in: grades } });
				console.log(`     ✓ Added grades filter: ${grades.join(", ")}`);
			}

			if (subjects?.length) {
				conditions.push({ "gradeSubjects.subject": { $in: subjects } });
				console.log(`     ✓ Added subjects filter: ${subjects.join(", ")}`);
			}

			if (creator) {
				conditions.push({ user: creator });
				console.log(`     ✓ Added creator filter: ${creator}`);
			}

			// Only add $and if there are multiple conditions
			if (conditions.length > 1) {
				query.$and = conditions;
				console.log(
					`   🔗 Using $and operator for ${conditions.length} conditions`
				);
			} else if (conditions.length === 1) {
				Object.assign(query, conditions[0]);
				console.log(`   🔗 Using single condition filter`);
			}

			return await this.getQuestions(query, page, limit);
		} catch (error) {
			console.error(`❌ Failed to apply filters:`, error.message);
			throw error;
		}
	}

	/**
	 * Get questions created by specific user
	 *
	 * @async
	 * @method getQuestionsByCreator
	 * @param {string} creatorId - User ID of the question creator
	 * @param {number} [page=1] - Page number for pagination
	 * @param {number} [limit=10] - Number of items per page
	 * @returns {Promise<Object>} Creator's questions with pagination
	 */
	async getQuestionsByCreator(creatorId, page = 1, limit = 10) {
		console.log(`👤 Fetching questions by creator: ${creatorId}`);
		return await this.getQuestions({ user: creatorId }, page, limit);
	}

	/**
	 * Get question count statistics by subject
	 * Uses MongoDB aggregation for analytics
	 *
	 * @async
	 * @method getQuestionCountBySubject
	 * @returns {Promise<Array>} Array of subjects with question counts
	 */
	async getQuestionCountBySubject() {
		console.log(`📊 Generating question count statistics by subject`);

		try {
			const questions = await Question.aggregate([
				{
					$unwind: "$gradeSubjects",
				},
				{
					$group: {
						_id: "$gradeSubjects.subject",
						count: { $sum: 1 },
					},
				},
				{
					$lookup: {
						from: "subjects",
						localField: "_id",
						foreignField: "_id",
						as: "subject",
					},
				},
				{
					$unwind: "$subject",
				},
				{
					$project: {
						_id: "$_id",
						name: "$subject.name",
						count: 1,
					},
				},
			]);

			console.log(
				`✅ Subject statistics generated for ${questions.length} subjects`
			);
			questions.forEach((stat) => {
				console.log(`   📚 ${stat.name}: ${stat.count} questions`);
			});

			return questions;
		} catch (error) {
			console.error(`❌ Failed to generate subject statistics:`, error.message);
			throw error;
		}
	}

	/**
	 * Get question count statistics by grade
	 * Uses MongoDB aggregation for analytics
	 *
	 * @async
	 * @method getQuestionCountByGrade
	 * @returns {Promise<Array>} Array of grades with question counts
	 */
	async getQuestionCountByGrade() {
		console.log(`📊 Generating question count statistics by grade`);

		try {
			const questions = await Question.aggregate([
				{
					$unwind: "$gradeSubjects",
				},
				{
					$group: {
						_id: "$gradeSubjects.grade",
						count: { $sum: 1 },
					},
				},
				{
					$lookup: {
						from: "grades",
						localField: "_id",
						foreignField: "_id",
						as: "grade",
					},
				},
				{
					$unwind: "$grade",
				},
				{
					$project: {
						_id: "$_id",
						name: "$grade.name",
						count: 1,
					},
				},
			]);

			console.log(
				`✅ Grade statistics generated for ${questions.length} grades`
			);
			questions.forEach((stat) => {
				console.log(`   🎓 ${stat.name}: ${stat.count} questions`);
			});

			return questions;
		} catch (error) {
			console.error(`❌ Failed to generate grade statistics:`, error.message);
			throw error;
		}
	}

	/**
	 * Get questions by specific subject
	 *
	 * @async
	 * @method getQuestionsBySubject
	 * @param {string} subjectId - Subject ID to filter by
	 * @param {number} [page=1] - Page number for pagination
	 * @param {number} [limit=10] - Number of items per page
	 * @returns {Promise<Object>} Subject's questions with pagination
	 */
	async getQuestionsBySubject(subjectId, page = 1, limit = 10) {
		console.log(`📚 Fetching questions for subject: ${subjectId}`);
		return await this.getQuestions(
			{ "gradeSubjects.subject": subjectId },
			page,
			limit
		);
	}

	/**
	 * Get total question count in the database
	 *
	 * @async
	 * @method getTotalQuestionCount
	 * @returns {Promise<number>} Total number of questions in the database
	 */
	async getTotalQuestionCount() {
		console.log(`📊 Getting total question count from database`);

		try {
			const count = await Question.countDocuments();
			console.log(`✅ Total questions in database: ${count}`);
			return count;
		} catch (error) {
			console.error(`❌ Failed to get total question count:`, error.message);
			throw error;
		}
	}
}

module.exports = new QuestionService();

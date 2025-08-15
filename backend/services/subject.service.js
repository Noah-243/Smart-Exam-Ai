/**
 * Subject Service
 * Handles subject management and CRUD operations for Exemind-AI
 *
 * Features:
 * - Subject creation and management
 * - Subject lookup and retrieval
 * - Subject update and deletion
 * - Subject name validation
 * - Academic subject organization
 *
 * @module services/subject.service
 * @author Exemind-AI Team
 */

const Subject = require("../models/Subject");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Subject Service Class
 * Provides business logic for subject management operations
 */
class SubjectService {
	/**
	 * Create a new subject
	 * Validates and creates a new academic subject
	 *
	 * @async
	 * @method createSubject
	 * @param {Object} subjectData - Subject data object
	 * @param {string} subjectData.name - Subject name
	 * @param {string} [subjectData.description] - Subject description
	 * @returns {Promise<Object>} Created subject document
	 * @throws {ErrorResponse} When validation fails or duplicate subject
	 */
	async createSubject(subjectData) {
		console.log("\n📚 ======= CREATE SUBJECT =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`📝 Subject data: ${JSON.stringify(subjectData)}`);

		try {
			console.log(`🔄 Creating new subject...`);

			const subject = await Subject.create(subjectData);

			console.log(`✅ Subject created successfully`);
			console.log(`   📚 Name: ${subject.name}`);
			console.log(`   🆔 ID: ${subject._id}`);
			console.log("📚 =============================\n");

			return subject;
		} catch (error) {
			console.error(`❌ Failed to create subject:`, error.message);
			console.log("📚 =============================\n");
			throw error;
		}
	}

	/**
	 * Get subject by ID
	 * Retrieves a specific subject by its unique identifier
	 *
	 * @async
	 * @method getSubjectById
	 * @param {string} id - Subject ID
	 * @returns {Promise<Object>} Subject document
	 * @throws {ErrorResponse} When subject not found
	 */
	async getSubjectById(id) {
		console.log("\n🔍 ======= GET SUBJECT BY ID =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Subject ID: ${id}`);

		try {
			console.log(`🔍 Searching for subject...`);

			const subject = await Subject.findById(id);

			if (!subject) {
				console.log(`❌ Subject not found: ${id}`);
				throw new ErrorResponse(`Subject not found with id of ${id}`, 404);
			}

			console.log(`✅ Subject found successfully`);
			console.log(`   📚 Name: ${subject.name}`);
			console.log(`   📅 Created: ${subject.createdAt || "N/A"}`);
			console.log("🔍 =================================\n");

			return subject;
		} catch (error) {
			console.error(`❌ Failed to get subject ${id}:`, error.message);
			console.log("🔍 =================================\n");
			throw error;
		}
	}

	/**
	 * Update subject information
	 * Updates existing subject with new data
	 *
	 * @async
	 * @method updateSubject
	 * @param {string} id - Subject ID
	 * @param {Object} updateData - Update data object
	 * @returns {Promise<Object>} Updated subject document
	 * @throws {ErrorResponse} When subject not found or validation fails
	 */
	async updateSubject(id, updateData) {
		console.log("\n📝 ======= UPDATE SUBJECT =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Subject ID: ${id}`);
		console.log(`📝 Update data: ${JSON.stringify(updateData)}`);

		try {
			console.log(`🔄 Updating subject...`);

			const subject = await Subject.findByIdAndUpdate(id, updateData, {
				new: true,
				runValidators: true,
			});

			if (!subject) {
				console.log(`❌ Subject not found for update: ${id}`);
				throw new ErrorResponse(`Subject not found with id of ${id}`, 404);
			}

			console.log(`✅ Subject updated successfully`);
			console.log(`   📚 Name: ${subject.name}`);
			console.log(
				`   🔄 Updated fields: ${Object.keys(updateData).join(", ")}`
			);
			console.log("📝 =============================\n");

			return subject;
		} catch (error) {
			console.error(`❌ Failed to update subject ${id}:`, error.message);
			console.log("📝 =============================\n");
			throw error;
		}
	}

	/**
	 * Delete a subject
	 * Removes subject from the system
	 *
	 * @async
	 * @method deleteSubject
	 * @param {string} id - Subject ID
	 * @returns {Promise<Object>} Deleted subject document
	 * @throws {ErrorResponse} When subject not found
	 */
	async deleteSubject(id) {
		console.log("\n🗑️ ======= DELETE SUBJECT =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Subject ID: ${id}`);

		try {
			console.log(`🔄 Deleting subject...`);

			const subject = await Subject.findByIdAndDelete(id);

			if (!subject) {
				console.log(`❌ Subject not found for deletion: ${id}`);
				throw new ErrorResponse(`Subject not found with id of ${id}`, 404);
			}

			console.log(`✅ Subject deleted successfully`);
			console.log(`   📚 Deleted: ${subject.name}`);
			console.log(`   ⚠️ This action cannot be undone`);
			console.log("🗑️ =============================\n");

			return subject;
		} catch (error) {
			console.error(`❌ Failed to delete subject ${id}:`, error.message);
			console.log("🗑️ =============================\n");
			throw error;
		}
	}

	/**
	 * Get all subjects
	 * Retrieves all subjects sorted by name
	 *
	 * @async
	 * @method getAllSubjects
	 * @returns {Promise<Array>} Array of all subjects
	 */
	async getAllSubjects() {
		console.log("\n📋 ======= GET ALL SUBJECTS =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

		try {
			console.log(`🔄 Fetching all subjects...`);

			const subjects = await Subject.find().sort({ name: 1 });

			console.log(`✅ Subjects retrieved successfully`);
			console.log(`   📊 Total subjects: ${subjects.length}`);
			console.log(`   📚 Subjects: ${subjects.map((s) => s.name).join(", ")}`);
			console.log("📋 ===============================\n");

			return subjects;
		} catch (error) {
			console.error(`❌ Failed to get all subjects:`, error.message);
			console.log("📋 ===============================\n");
			throw error;
		}
	}

	/**
	 * Get subject by name
	 * Finds subject by exact name match
	 *
	 * @async
	 * @method getSubjectByName
	 * @param {string} name - Subject name
	 * @returns {Promise<Object|null>} Subject document or null if not found
	 */
	async getSubjectByName(name) {
		console.log("\n🔍 ======= GET SUBJECT BY NAME =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`📚 Subject name: ${name}`);

		try {
			console.log(`🔍 Searching for subject by name...`);

			const subject = await Subject.findOne({ name });

			if (subject) {
				console.log(`✅ Subject found by name`);
				console.log(`   🆔 ID: ${subject._id}`);
				console.log(`   📚 Name: ${subject.name}`);
			} else {
				console.log(`ℹ️ No subject found with name: ${name}`);
			}
			console.log("🔍 ==================================\n");

			return subject;
		} catch (error) {
			console.error(`❌ Failed to get subject by name ${name}:`, error.message);
			console.log("🔍 ==================================\n");
			throw error;
		}
	}
}

module.exports = new SubjectService();

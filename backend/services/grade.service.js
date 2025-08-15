/**
 * Grade Service
 * Handles grade management and academic level operations for Exemind-AI
 *
 * Features:
 * - Grade creation and management
 * - Academic level organization
 * - Student enrollment tracking
 * - Grade-specific operations
 *
 * @module services/grade.service
 * @author Exemind-AI Team
 */

const Grade = require("../models/Grade");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Grade Service Class
 * Provides business logic for grade management operations
 */
class GradeService {
	/**
	 * Create a new grade
	 * Validates and creates a new academic grade level
	 *
	 * @async
	 * @method createGrade
	 * @param {Object} gradeData - Grade data object
	 * @param {string} gradeData.name - Grade name
	 * @param {number} gradeData.level - Grade level number
	 * @returns {Promise<Object>} Created grade document
	 * @throws {ErrorResponse} When validation fails or duplicate grade
	 */
	async createGrade(gradeData) {
		console.log("\n🎓 ======= CREATE GRADE =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`📝 Grade data: ${JSON.stringify(gradeData)}`);

		try {
			console.log(`🔄 Creating new grade...`);

			const grade = await Grade.create(gradeData);

			console.log(`✅ Grade created successfully`);
			console.log(`   🎓 Name: ${grade.name}`);
			console.log(`   📊 Level: ${grade.level}`);
			console.log(`   🆔 ID: ${grade._id}`);
			console.log("🎓 ===========================\n");

			return grade;
		} catch (error) {
			console.error(`❌ Failed to create grade:`, error.message);
			console.log("🎓 ===========================\n");
			throw error;
		}
	}

	/**
	 * Get grade by ID with populated data
	 * Retrieves a specific grade by its unique identifier
	 *
	 * @async
	 * @method getGradeById
	 * @param {string} id - Grade ID
	 * @returns {Promise<Object>} Grade document with populated students
	 * @throws {ErrorResponse} When grade not found
	 */
	async getGradeById(id) {
		console.log("\n🔍 ======= GET GRADE BY ID =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Grade ID: ${id}`);

		try {
			console.log(`🔍 Searching for grade with populated data...`);

			const grade = await Grade.findById(id).populate("students");

			if (!grade) {
				console.log(`❌ Grade not found: ${id}`);
				throw new ErrorResponse(`Grade not found with id of ${id}`, 404);
			}

			console.log(`✅ Grade found successfully`);
			console.log(`   🎓 Name: ${grade.name}`);
			console.log(`   📊 Level: ${grade.level}`);
			console.log(`   👨‍🎓 Students: ${grade.students?.length || 0}`);
			console.log("🔍 ===============================\n");

			return grade;
		} catch (error) {
			console.error(`❌ Failed to get grade ${id}:`, error.message);
			console.log("🔍 ===============================\n");
			throw error;
		}
	}

	/**
	 * Get all grades
	 * Retrieves all grades sorted by level
	 *
	 * @async
	 * @method getAllGrades
	 * @returns {Promise<Array>} Array of all grades sorted by level
	 */
	async getAllGrades() {
		console.log("\n📋 ======= GET ALL GRADES =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

		try {
			console.log(`🔄 Fetching all grades...`);

			const grades = await Grade.find().sort({ level: 1 });

			console.log(`✅ Grades retrieved successfully`);
			console.log(`   📊 Total grades: ${grades.length}`);
			console.log(
				`   🎓 Grade levels: ${grades
					.map((g) => `${g.name} (L${g.level})`)
					.join(", ")}`
			);
			console.log(
				`   📈 Level range: ${Math.min(
					...grades.map((g) => g.level)
				)} - ${Math.max(...grades.map((g) => g.level))}`
			);
			console.log("📋 =============================\n");

			return grades;
		} catch (error) {
			console.error(`❌ Failed to get all grades:`, error.message);
			console.log("📋 =============================\n");
			throw error;
		}
	}

	/**
	 * Update grade information
	 * Updates existing grade with new data
	 *
	 * @async
	 * @method updateGrade
	 * @param {string} id - Grade ID
	 * @param {Object} updateData - Update data object
	 * @returns {Promise<Object>} Updated grade document
	 * @throws {ErrorResponse} When grade not found or validation fails
	 */
	async updateGrade(id, updateData) {
		console.log("\n📝 ======= UPDATE GRADE =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Grade ID: ${id}`);
		console.log(`📝 Update data: ${JSON.stringify(updateData)}`);

		try {
			console.log(`🔄 Updating grade...`);

			const grade = await Grade.findByIdAndUpdate(id, updateData, {
				new: true,
				runValidators: true,
			});

			if (!grade) {
				console.log(`❌ Grade not found for update: ${id}`);
				throw new ErrorResponse(`Grade not found with id of ${id}`, 404);
			}

			console.log(`✅ Grade updated successfully`);
			console.log(`   🎓 Name: ${grade.name}`);
			console.log(`   📊 Level: ${grade.level}`);
			console.log(
				`   🔄 Updated fields: ${Object.keys(updateData).join(", ")}`
			);
			console.log("📝 ===========================\n");

			return grade;
		} catch (error) {
			console.error(`❌ Failed to update grade ${id}:`, error.message);
			console.log("📝 ===========================\n");
			throw error;
		}
	}

	/**
	 * Delete a grade
	 * Removes grade from the system (with validation)
	 *
	 * @async
	 * @method deleteGrade
	 * @param {string} id - Grade ID
	 * @returns {Promise<Object>} Deleted grade document
	 * @throws {ErrorResponse} When grade not found or has enrolled students
	 */
	async deleteGrade(id) {
		console.log("\n🗑️ ======= DELETE GRADE =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Grade ID: ${id}`);

		try {
			console.log(`🔍 Checking grade before deletion...`);

			const grade = await Grade.findById(id).populate("students");

			if (!grade) {
				console.log(`❌ Grade not found for deletion: ${id}`);
				throw new ErrorResponse(`Grade not found with id of ${id}`, 404);
			}

			// Check if grade has enrolled students
			if (grade.students && grade.students.length > 0) {
				console.log(
					`❌ Cannot delete grade with enrolled students: ${grade.students.length} students`
				);
				throw new ErrorResponse(
					`Cannot delete grade with enrolled students. Transfer students first.`,
					400
				);
			}

			console.log(`🔄 Deleting grade...`);
			await Grade.findByIdAndDelete(id);

			console.log(`✅ Grade deleted successfully`);
			console.log(`   🎓 Deleted: ${grade.name} (Level ${grade.level})`);
			console.log(`   ⚠️ This action cannot be undone`);
			console.log("🗑️ ===========================\n");

			return grade;
		} catch (error) {
			console.error(`❌ Failed to delete grade ${id}:`, error.message);
			console.log("🗑️ ===========================\n");
			throw error;
		}
	}

	async getGradeByLevel(level) {
		return await Grade.findOne({ level }).populate({
			path: "students",
			populate: {
				path: "user",
				select: "name email",
			},
		});
	}
}

module.exports = new GradeService();

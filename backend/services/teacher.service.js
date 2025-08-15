/**
 * Teacher Service
 * Handles teacher management and academic staff operations for Exemind-AI
 *
 * Features:
 * - Teacher profile management
 * - Teaching assignment tracking
 * - Academic staff operations
 * - Subject and grade associations
 *
 * @module services/teacher.service
 * @author Exemind-AI Team
 */

const Teacher = require("../models/Teacher");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Teacher Service Class
 * Provides business logic for teacher management operations
 */
class TeacherService {
	/**
	 * Get teacher by ID with populated data
	 * Retrieves complete teacher profile with associated data
	 *
	 * @async
	 * @method getTeacherById
	 * @param {string} id - Teacher ID
	 * @returns {Promise<Object>} Teacher document with populated user, subjects, and grades
	 * @throws {ErrorResponse} When teacher not found
	 */
	async getTeacherById(id) {
		console.log("\n🔍 ======= GET TEACHER BY ID =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Teacher ID: ${id}`);

		try {
			console.log(`🔍 Searching for teacher with populated data...`);

			const teacher = await Teacher.findById(id)
				.populate("user", "-password")
				.populate("teachingAssignments.subject", "name")
				.populate("teachingAssignments.grades", "name");

			if (!teacher) {
				console.log(`❌ Teacher not found: ${id}`);
				throw new ErrorResponse("Teacher not found", 404);
			}

			console.log(`✅ Teacher found successfully`);
			console.log(`   👤 Name: ${teacher.user?.name || "N/A"}`);
			console.log(`   📧 Email: ${teacher.user?.email || "N/A"}`);
			console.log(
				`   📚 Assignments: ${teacher.teachingAssignments?.length || 0}`
			);
			console.log("🔍 =================================\n");

			return teacher;
		} catch (error) {
			console.error(`❌ Failed to get teacher ${id}:`, error.message);
			console.log("🔍 =================================\n");
			throw error;
		}
	}

	/**
	 * Update teacher's teaching assignments
	 * Updates the subjects and grades a teacher is assigned to
	 *
	 * @async
	 * @method updateTeachingAssignments
	 * @param {string} teacherId - Teacher ID
	 * @param {Object} assignmentsData - Assignment data object
	 * @returns {Promise<Object>} Updated teacher with populated assignments
	 * @throws {ErrorResponse} When teacher not found
	 */
	async updateTeachingAssignments(teacherId, assignmentsData) {
		console.log("\n📝 ======= UPDATE TEACHING ASSIGNMENTS =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Teacher ID: ${teacherId}`);
		console.log(`📝 Assignments: ${JSON.stringify(assignmentsData)}`);

		try {
			const teacher = await Teacher.findById(teacherId);
			if (!teacher) {
				console.log(`❌ Teacher not found: ${teacherId}`);
				throw new ErrorResponse("Teacher not found", 404);
			}

			if (assignmentsData && assignmentsData.teachingAssignments) {
				teacher.teachingAssignments = assignmentsData.teachingAssignments;
			}

			await teacher.save();

			const updatedTeacher = await Teacher.findById(teacherId)
				.populate("teachingAssignments.subject", "name")
				.populate("teachingAssignments.grades", "name");

			console.log(`✅ Teaching assignments updated successfully`);
			console.log(`   👨‍🏫 Teacher: ${teacherId}`);
			console.log(
				`   📚 Assignments: ${updatedTeacher.teachingAssignments?.length || 0}`
			);
			console.log("📝 ==========================================\n");

			return updatedTeacher;
		} catch (error) {
			console.error(`❌ Failed to update teaching assignments:`, error.message);
			console.log("📝 ==========================================\n");
			throw error;
		}
	}

	/**
	 * Update teacher specializations
	 * Updates the areas of expertise for a teacher
	 *
	 * @async
	 * @method updateSpecializations
	 * @param {string} teacherId - Teacher ID
	 * @param {Array} specializations - Array of specialization areas
	 * @returns {Promise<Object>} Updated teacher document
	 * @throws {ErrorResponse} When teacher not found
	 */
	async updateSpecializations(teacherId, specializations) {
		console.log("\n🎯 ======= UPDATE SPECIALIZATIONS =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎯 Teacher ID: ${teacherId}`);
		console.log(`📚 Specializations: ${JSON.stringify(specializations)}`);

		try {
			const teacher = await Teacher.findById(teacherId);
			if (!teacher) {
				console.log(`❌ Teacher not found: ${teacherId}`);
				throw new ErrorResponse("Teacher not found", 404);
			}

			teacher.specializations = specializations;
			await teacher.save();

			console.log(`✅ Specializations updated successfully`);
			console.log(`   👨‍🏫 Teacher: ${teacherId}`);
			console.log(
				`   🎯 Specializations count: ${specializations?.length || 0}`
			);
			console.log("🎯 =====================================\n");

			return teacher;
		} catch (error) {
			console.error(`❌ Failed to update specializations:`, error.message);
			console.log("🎯 =====================================\n");
			throw error;
		}
	}

	/**
	 * Get teachers by subject
	 * Retrieves all teachers assigned to a specific subject
	 *
	 * @async
	 * @method getTeachersBySubject
	 * @param {string} subjectId - Subject ID
	 * @returns {Promise<Array>} Array of teachers teaching the subject
	 */
	async getTeachersBySubject(subjectId) {
		console.log("\n📚 ======= GET TEACHERS BY SUBJECT =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`📚 Subject ID: ${subjectId}`);

		try {
			const teachers = await Teacher.find({
				"teachingAssignments.subject": subjectId,
			})
				.populate("user", "name email")
				.populate("teachingAssignments.subject", "name")
				.populate("teachingAssignments.grades", "name");

			console.log(`✅ Teachers by subject retrieved`);
			console.log(`   📚 Subject: ${subjectId}`);
			console.log(`   👨‍🏫 Teachers found: ${teachers.length}`);
			console.log("📚 ======================================\n");

			return teachers;
		} catch (error) {
			console.error(`❌ Failed to get teachers by subject:`, error.message);
			console.log("📚 ======================================\n");
			throw error;
		}
	}

	/**
	 * Get teachers by grade
	 * Retrieves all teachers assigned to a specific grade
	 *
	 * @async
	 * @method getTeachersByGrade
	 * @param {string} gradeId - Grade ID
	 * @returns {Promise<Array>} Array of teachers teaching the grade
	 */
	async getTeachersByGrade(gradeId) {
		console.log("\n🎓 ======= GET TEACHERS BY GRADE =======");
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
		console.log(`🎓 Grade ID: ${gradeId}`);

		try {
			const teachers = await Teacher.find({
				"teachingAssignments.grades": gradeId,
			})
				.populate("user", "name email")
				.populate("teachingAssignments.subject", "name")
				.populate("teachingAssignments.grades", "name");

			console.log(`✅ Teachers by grade retrieved`);
			console.log(`   🎓 Grade: ${gradeId}`);
			console.log(`   👨‍🏫 Teachers found: ${teachers.length}`);
			console.log("🎓 ====================================\n");

			return teachers;
		} catch (error) {
			console.error(`❌ Failed to get teachers by grade:`, error.message);
			console.log("🎓 ====================================\n");
			throw error;
		}
	}
}

module.exports = new TeacherService();

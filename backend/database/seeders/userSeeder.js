/**
 * User Seeder Script (Admins, Teachers, Students)
 *
 * This script generates seeded users for the system:
 * - One admin user
 * - A teacher for every specialization group
 * - Additional teachers to ensure every subject-grade combination is covered
 * - Students (5 per grade)
 *
 * Features:
 * - Uses predefined `specializationGroups` to guide subject-teacher assignment
 * - Generates realistic names/emails using `faker`
 * - Hashes passwords using bcrypt (currently uses "123456" without hashing)
 * - Creates and links `User` and corresponding `Teacher`/`Student` profiles
 * - Ensures **full coverage**: every subject is taught in every grade at least once
 *
 * Exports:
 * - seedUsers(grades, subjects): Promise resolving to { users, teacherUsers, studentUsers }
 */

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Teacher = require("../../models/Teacher");
const Student = require("../../models/Student");

// Mapping specialization types to relevant subjects and descriptions
const specializationGroups = {
	Mathematics: {
		specialization: "Mathematics",
		subjects: ["Mathematics", "Statistics"],
		description: "Mathematics and Statistical Analysis",
	},
	Science: {
		specialization: "Science",
		subjects: ["Physics", "Chemistry", "Biology"],
		description: "Physical and Life Sciences",
	},
	"Computer Science": {
		specialization: "Computer Science",
		subjects: ["Computer Science", "Mathematics"],
		description: "Computing and Technology",
	},
	"English Literature": {
		specialization: "English Literature",
		subjects: ["English", "Literature"],
		description: "English Language and Literature",
	},
	"Foreign Languages": {
		specialization: "Foreign Languages",
		subjects: ["Spanish", "French"],
		description: "World Languages",
	},
	"Social Studies": {
		specialization: "Social Studies",
		subjects: ["History", "Geography", "Economics", "Political Science"],
		description: "Social Sciences and Humanities",
	},
	Arts: {
		specialization: "Arts",
		subjects: ["Art", "Music"],
		description: "Creative Arts and Music",
	},
	"Physical Education": {
		specialization: "Physical Education",
		subjects: ["Physical Education"],
		description: "Health and Physical Education",
	},
	Philosophy: {
		specialization: "Philosophy",
		subjects: ["Philosophy", "History"],
		description: "Philosophy and Critical Thinking",
	},
};

/**
 * Generates subject and grade assignments for a teacher based on specialization
 *
 * @param {Array} subjects - Subject documents
 * @param {Array} grades - Grade documents
 * @param {String} teacherSpecialization - e.g., "Mathematics"
 * @returns {Array} Array of teaching assignments { subject, grades[] }
 */
const generateTeacherAssignments = (subjects, grades, teacherSpecialization) => {
	const specializationData = Object.values(specializationGroups).find(
		(group) => group.specialization === teacherSpecialization
	);

	if (!specializationData) {
		// fallback random assignment
		const numSubjects = Math.floor(Math.random() * 2) + 1;
		const selectedSubjects = subjects.sort(() => Math.random() - 0.5).slice(0, numSubjects);
		return selectedSubjects.map((subject) => ({
			subject: subject._id,
			grades: grades.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2).map((g) => g._id),
		}));
	}

	const eligibleSubjects = subjects.filter((s) => specializationData.subjects.includes(s.name));
	if (eligibleSubjects.length === 0) {
		return generateTeacherAssignments(subjects, grades, null); // fallback
	}

	const numSubjects = Math.min(eligibleSubjects.length, Math.floor(Math.random() * 2) + 1);
	const selectedSubjects = eligibleSubjects.slice(0, numSubjects);

	return selectedSubjects.map((subject) => {
		const startGradeIndex = Math.floor(Math.random() * Math.max(1, grades.length - 4));
		const numGrades = Math.min(grades.length - startGradeIndex, Math.floor(Math.random() * 3) + 3);
		const assignedGrades = grades.slice(startGradeIndex, startGradeIndex + numGrades).map((g) => g._id);
		return { subject: subject._id, grades: assignedGrades };
	});
};

/**
 * Checks which subject-grade combinations are still not covered by any teacher
 *
 * @param {Array} teachers - Array of users with teacher.profile.teachingAssignments
 * @param {Array} subjects
 * @param {Array} grades
 * @returns {Array} List of uncovered { subjectId, gradeId } pairs
 */
const ensureFullCoverage = (teachers, subjects, grades) => {
	const coverage = new Map();
	subjects.forEach((subject) =>
		grades.forEach((grade) => {
			const key = `${subject._id}-${grade._id}`;
			coverage.set(key, false);
		})
	);

	teachers.forEach((teacher) =>
		teacher.profile.teachingAssignments.forEach((assignment) =>
			assignment.grades.forEach((gradeId) => {
				const key = `${assignment.subject}-${gradeId}`;
				coverage.set(key, true);
			})
		)
	);

	const uncovered = [];
	coverage.forEach((isCovered, key) => {
		if (!isCovered) {
			const [subjectId, gradeId] = key.split("-");
			uncovered.push({ subjectId, gradeId });
		}
	});
	return uncovered;
};

/**
 * Main seeding function for creating users:
 * - Admin user
 * - Teachers with full coverage
 * - Students (5 per grade)
 *
 * @param {Array} grades - Grade documents
 * @param {Array} subjects - Subject documents
 * @returns {Promise<{ users: Array, teacherUsers: Array, studentUsers: Array }>}
 */
const seedUsers = async (grades, subjects) => {
	try {
		await User.deleteMany();
		await Teacher.deleteMany();
		await Student.deleteMany();

		const users = [];
		const teacherUsers = [];
		const studentUsers = [];

		// Admin user
		const adminUser = await User.create({
			name: "Admin User",
			email: "admin@example.com",
			password: "123456",
			role: "admin",
		});
		users.push(adminUser);

		// Teachers per specialization
		let teacherIndex = 1;
		const allSpecializations = Object.values(specializationGroups);
		for (const specGroup of allSpecializations) {
			const tempProfileId = new mongoose.Types.ObjectId();
			const teacher = await User.create({
				name: faker.person.fullName(),
				email: `teacher${teacherIndex}@example.com`,
				password: "123456",
				role: "teacher",
				profileType: "Teacher",
				profileId: tempProfileId,
			});

			const teacherProfile = await Teacher.create({
				_id: tempProfileId,
				user: teacher._id,
				specializations: [specGroup.specialization],
				teachingAssignments: generateTeacherAssignments(subjects, grades, specGroup.specialization),
			});

			teacher.profile = teacherProfile;
			users.push(teacher);
			teacherUsers.push(teacher);
			teacherIndex++;
		}

		// Add more teachers to ensure full subject-grade coverage
		let uncovered = ensureFullCoverage(teacherUsers, subjects, grades);
		while (uncovered.length > 0 && teacherIndex <= 30) {
			for (const { subjectId, gradeId } of uncovered.slice(0, 5)) {
				const tempProfileId = new mongoose.Types.ObjectId();
				const subject = subjects.find((s) => s._id.toString() === subjectId);
				const matchingSpec = Object.values(specializationGroups).find((g) => g.subjects.includes(subject.name));
				const specialization = matchingSpec ? matchingSpec.specialization : subject.name;

				const teacher = await User.create({
					name: faker.person.fullName(),
					email: `teacher${teacherIndex}@example.com`,
					password: "123456",
					role: "teacher",
					profileType: "Teacher",
					profileId: tempProfileId,
				});

				const teacherProfile = await Teacher.create({
					_id: tempProfileId,
					user: teacher._id,
					specializations: [specialization],
					teachingAssignments: [{ subject: subjectId, grades: [gradeId] }],
				});

				teacher.profile = teacherProfile;
				users.push(teacher);
				teacherUsers.push(teacher);
				teacherIndex++;
			}
			uncovered = ensureFullCoverage(teacherUsers, subjects, grades);
		}

		// Students: 5 per grade
		let studentCounter = 1;
		const sortedGrades = [...grades].sort((a, b) => a.level - b.level);
		for (const grade of sortedGrades) {
			for (let i = 0; i < 5; i++) {
				const tempProfileId = new mongoose.Types.ObjectId();
				const student = await User.create({
					name: `Student ${studentCounter}`,
					email: `student${studentCounter}@example.com`,
					password: "123456",
					role: "student",
					profileType: "Student",
					profileId: tempProfileId,
				});

				const studentProfile = await Student.create({
					_id: tempProfileId,
					user: student._id,
					grade: grade._id,
				});

				student.profile = studentProfile;
				users.push(student);
				studentUsers.push(student);
				studentCounter++;
			}
		}

		return { users, teacherUsers, studentUsers };
	} catch (error) {
		console.error("Error seeding users:", error);
		throw error;
	}
};

// Export the main seeding function
module.exports = seedUsers;

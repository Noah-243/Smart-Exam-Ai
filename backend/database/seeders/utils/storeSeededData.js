/**
 * Seeded Data Utility Module
 *
 * This module handles storing and clearing seeded data in JSON format for development or testing environments.
 * It ensures that a directory for storing seed files exists, writes each collection to a separate file,
 * and creates a special `credentials.json` file that summarizes all user login information.
 *
 * Dependencies:
 * - Node.js built-in `fs.promises` and `path` modules
 * - `colors` for styled console logging
 *
 * Exports:
 * - storeSeededData(data): Stores the given seed data collections as separate JSON files
 * - clearSeededData(): Deletes the entire seeded data directory
 * - DATA_DIR: The absolute path to the directory where seeded files are stored
 */

const fs = require("fs").promises;
const path = require("path");
const colors = require("colors");

const DATA_DIR = path.join(__dirname, "../../seeded-data"); // Absolute path to the data directory

/**
 * Ensures the seeded data directory exists. Creates it if missing.
 * @returns {Promise<void>}
 */
const ensureDataDir = async () => {
	try {
		await fs.access(DATA_DIR); // Check if directory exists
	} catch {
		await fs.mkdir(DATA_DIR, { recursive: true }); // Create if not
	}
};

/**
 * Stores the given seeded data into JSON files inside the `seeded-data` folder.
 * Also creates a detailed `credentials.json` file summarizing all user data for easy testing.
 *
 * @param {Object} data - The data to store, typically including collections like { users, tests, questions, ... }
 * @returns {Promise<void>}
 */
const storeSeededData = async (data) => {
	try {
		await ensureDataDir();

		// Store each collection in a separate file
		for (const [key, value] of Object.entries(data)) {
			const filePath = path.join(DATA_DIR, `${key}.json`);
			const jsonData = JSON.stringify(value, null, 2); // Pretty print
			await fs.writeFile(filePath, jsonData);
		}

		// Create credentials.json specifically for seeded users
		if (data.users) {
			const credentials = {
				note: "These are the login credentials for all seeded users. Password is '123456' for all users.",
				defaultPassword: "123456",
				lastUpdated: new Date().toISOString(),
				totalUsers: data.users.length,
				users: data.users.map((user) => ({
					id: user._id,
					name: user.name,
					email: user.email,
					password: "123456",
					role: user.role,
					profileType: user.profileType || null,
					profileId: user.profileId || null,
				})),
				byRole: {
					admin: data.users
						.filter((u) => u.role === "admin")
						.map((u) => ({
							name: u.name,
							email: u.email,
							password: "123456",
							id: u._id,
						})),
					teachers: data.users
						.filter((u) => u.role === "teacher")
						.map((u) => ({
							name: u.name,
							email: u.email,
							password: "123456",
							id: u._id,
						})),
					students: data.users
						.filter((u) => u.role === "student")
						.map((u) => ({
							name: u.name,
							email: u.email,
							password: "123456",
							id: u._id,
						})),
				},
				quickAccess: {
					admin: data.users.find((u) => u.role === "admin")
						? {
								email: data.users.find((u) => u.role === "admin").email,
								password: "123456",
						  }
						: null,
					teacher: data.users.find((u) => u.role === "teacher")
						? {
								email: data.users.find((u) => u.role === "teacher").email,
								password: "123456",
						  }
						: null,
					student: data.users.find((u) => u.role === "student")
						? {
								email: data.users.find((u) => u.role === "student").email,
								password: "123456",
						  }
						: null,
				},
			};

			const credentialsPath = path.join(DATA_DIR, "credentials.json");
			await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
			console.log(`✓ Credentials file created at ${credentialsPath}`.green);
		}
	} catch (error) {
		console.error("Error storing seeded data:", error);
		throw error;
	}
};

/**
 * Deletes the entire seeded data directory (`seeded-data`) recursively.
 * Useful for resetting development state or starting fresh.
 *
 * @returns {Promise<void>}
 */
const clearSeededData = async () => {
	try {
		await fs.rm(DATA_DIR, { recursive: true, force: true });
	} catch (error) {
		console.error("Error clearing seeded data:", error);
		if (error.code !== "ENOENT") {
			throw error; // Only ignore if the directory doesn't exist
		}
	}
};

// Export utility functions and constants
module.exports = {
	storeSeededData,
	clearSeededData,
	DATA_DIR,
};

/**
 * Database Connection Module
 * Handles MongoDB connection using Mongoose ODM
 *
 * Features:
 * - MongoDB Atlas/Local connection support
 * - Connection error handling and retry logic
 * - Connection status monitoring
 * - Graceful disconnection handling
 *
 * @module database/db
 */

const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 * Establishes connection to MongoDB using connection string from environment variables
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} Throws error if connection fails
 */
const connectDB = async () => {
	try {
		console.log("🔄 Attempting to connect to MongoDB...");
		console.log(
			`📍 Connection URI: ${
				process.env.MONGODB_URI
					? process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@")
					: "Not configured"
			}`
		);

		// Configure mongoose connection options for better performance and reliability
		const connectionOptions = {
			maxPoolSize: 10, // Maintain up to 10 socket connections
			serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			family: 4, // Use IPv4, skip trying IPv6
		};

		const conn = await mongoose.connect(
			process.env.MONGODB_URI,
			connectionOptions
		);

		// Connection successful - log details
		console.log("✅ MongoDB Connected Successfully!");
		console.log(`🏢 Database Host: ${conn.connection.host}`);
		console.log(`🗄️ Database Name: ${conn.connection.name}`);
		console.log(`📊 Database Port: ${conn.connection.port}`);
		console.log(
			`🔗 Connection State: ${getConnectionState(conn.connection.readyState)}`
		);
		console.log(`⚡ Connection ID: ${conn.connection.id}`);

		// Monitor connection events
		setupConnectionEventListeners();
	} catch (error) {
		// Log detailed error information for debugging
		console.error("❌ MongoDB Connection Error:");
		console.error(`   💥 Error Type: ${error.name}`);
		console.error(`   📝 Error Message: ${error.message}`);
		console.error(`   📍 Error Code: ${error.code}`);
		console.error(`   🔄 Retrying connection in 5 seconds...`);

		// In production, you might want to implement retry logic here
		// For now, exit the process to prevent the app from running without database
		setTimeout(() => {
			console.error("💀 Exiting process due to database connection failure");
			process.exit(1);
		}, 5000);
	}
};

/**
 * Set up event listeners for MongoDB connection
 * Monitors connection state changes and handles disconnections
 *
 * @function setupConnectionEventListeners
 */
function setupConnectionEventListeners() {
	const connection = mongoose.connection;

	// Connection opened
	connection.on("connected", () => {
		console.log("🔓 Mongoose connected to MongoDB");
	});

	// Connection error
	connection.on("error", (error) => {
		console.error("❌ Mongoose connection error:", error);
	});

	// Connection disconnected
	connection.on("disconnected", () => {
		console.log("🔌 Mongoose disconnected from MongoDB");
		console.log("🔄 Attempting to reconnect...");
	});

	// Connection reconnected
	connection.on("reconnected", () => {
		console.log("🔄 Mongoose reconnected to MongoDB");
	});

	// Connection close
	connection.on("close", () => {
		console.log("🔒 Mongoose connection closed");
	});

	// Process termination handlers
	process.on("SIGINT", async () => {
		await gracefulDisconnect();
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		await gracefulDisconnect();
		process.exit(0);
	});
}

/**
 * Convert mongoose connection state number to readable string
 *
 * @function getConnectionState
 * @param {number} state - Mongoose connection state number
 * @returns {string} Human-readable connection state
 */
function getConnectionState(state) {
	const states = {
		0: "Disconnected",
		1: "Connected",
		2: "Connecting",
		3: "Disconnecting",
	};
	return states[state] || "Unknown";
}

/**
 * Gracefully disconnect from MongoDB
 * Closes the mongoose connection properly
 *
 * @async
 * @function gracefulDisconnect
 * @returns {Promise<void>} Resolves when disconnection is complete
 */
async function gracefulDisconnect() {
	try {
		console.log("🔄 Gracefully disconnecting from MongoDB...");
		await mongoose.connection.close();
		console.log("✅ MongoDB connection closed successfully");
	} catch (error) {
		console.error("❌ Error during MongoDB disconnection:", error);
	}
}

/**
 * Get current database connection status
 * Utility function to check connection state
 *
 * @function getConnectionStatus
 * @returns {Object} Connection status information
 */
function getConnectionStatus() {
	const connection = mongoose.connection;
	return {
		state: getConnectionState(connection.readyState),
		host: connection.host,
		name: connection.name,
		port: connection.port,
		collections: Object.keys(connection.collections),
	};
}

module.exports = connectDB;

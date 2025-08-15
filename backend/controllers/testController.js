/**
 * Test Controller (Legacy)
 * ------------------------------------------------------------------------------
 * This is a legacy controller for fetching all tests.
 * Most functionality has been migrated to the new controller file: `test.controller.js`.
 * This file remains only for backward compatibility or transitional API usage.
 *
 * @module controllers/testController
 * @author Exemind-AI Team
 * @deprecated Use `test.controller.js` for all test-related operations.
 */

const asyncHandler = require("../middleware/async");
const Test = require("../models/Test");

/**
 * @desc    Get all tests (with populated references)
 * @route   GET /api/test-controller/tests (Deprecated)
 * @access  Private
 * @deprecated
 * 
 * This endpoint is deprecated and should be replaced by `/api/tests` using the
 * newer `test.controller.js`. It fetches all test documents, including their
 * related grades, subjects, and questions via `.populate()`.
 *
 * Example response includes test data and a meta field informing the client
 * that this endpoint is deprecated.
 */
const getTests = asyncHandler(async (req, res) => {
	console.log("\n📝 =============== GET TESTS (LEGACY) ===============");
	console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
	console.log(`⚠️ WARNING: Using deprecated test controller`);
	console.log(
		`👤 User: ${req.user?.name || "Anonymous"} (${req.user?.role || "Unknown"})`
	);
	console.log(`🔗 Request from: ${req.ip || req.connection.remoteAddress}`);

	try {
		console.log(`🔄 Fetching tests with populated references...`);

		const tests = await Test.find()
			.populate("grades")    // Populate related grades
			.populate("subjects")  // Populate related subjects
			.populate("questions"); // Populate associated questions

		console.log(`✅ Tests retrieved successfully`);
		console.log(`   📊 Tests found: ${tests.length}`);
		console.log(`   ⚠️ RECOMMENDATION: Migrate to test.controller.js`);
		console.log("📝 ===============================================\n");

		res.json({
			data: tests,
			meta: {
				deprecated: true,
				message: "This endpoint is deprecated. Use /api/tests instead.",
				migrateToController: "test.controller.js",
			},
		});
	} catch (error) {
		console.error(`❌ Legacy test controller failed:`, error.message);
		console.log("📝 ===============================================\n");
		throw error;
	}
});

module.exports = {
	getTests,
};

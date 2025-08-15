/**
 * Development Configuration
 * This file contains configuration settings used only in development environments.
 * DO NOT enable these settings in production!
 */

module.exports = {
	// Feature flag to always create a test for students when they log in
	// This is useful for development and testing purposes
	alwaysCreateTestOnLogin: false,

	// The duration (in minutes) of the automatically created test
	autoTestDuration: 30,

	// The title prefix for automatically created tests
	autoTestTitlePrefix: "DEV TEST",
};

/**
 * Dashboard Routing Module
 * 
 * Defines routes for accessing administrative dashboard functionality.
 * 
 * Features:
 * - Applies global authentication middleware to all routes in this router
 * - Restricts access to statistics route for admin users only
 * 
 * Middleware:
 * - protect: Verifies that the request is authenticated
 * - authorize("admin"): Ensures the user has the "admin" role
 * 
 * Routes:
 * - GET /api/dashboard/stats: Fetches system-wide dashboard statistics for admins
 * 
 * @module routes/dashboard.routes
 */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/dashboard.controller");

// Protect all routes
router.use(protect);

// Dashboard routes
router.get("/stats", authorize("admin"), getDashboardStats);

module.exports = router;

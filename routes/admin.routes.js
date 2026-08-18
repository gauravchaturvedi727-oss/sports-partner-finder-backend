const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
    getDashboardStats,
    getAllUsers,
    toggleUserStatus,
    getGames,
    addGame,
    toggleGameStatus
} = require("../controllers/admin.controller");


const router = express.Router();


// =========================================
// DASHBOARD
// =========================================

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getDashboardStats
);


// =========================================
// USER MANAGEMENT
// =========================================

// Get all users
router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);


// Activate / Deactivate user
router.patch(
    "/users/:userId/status",
    authMiddleware,
    adminMiddleware,
    toggleUserStatus
);


// =========================================
// GAME MANAGEMENT
// =========================================

// Get all games
router.get(
    "/games",
    authMiddleware,
    adminMiddleware,
    getGames
);


// Add new game
router.post(
    "/games",
    authMiddleware,
    adminMiddleware,
    addGame
);


// Activate / Deactivate game
router.patch(
    "/games/:gameId/status",
    authMiddleware,
    adminMiddleware,
    toggleGameStatus
);


module.exports = router;
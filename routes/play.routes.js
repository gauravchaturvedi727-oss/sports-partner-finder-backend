const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
    createPlaySession,
    getPlaySessions,
    getMyPlaySessions,
    getPlaySessionById,
    joinPlaySession,
    leavePlaySession,
    cancelPlaySession,
    completePlaySession
} = require("../controllers/play.controller");


const router = express.Router();


// =========================================
// CREATE PLAY SESSION
// =========================================

router.post(
    "/",
    authMiddleware,
    createPlaySession
);


// =========================================
// GET ALL PLAY SESSIONS
// =========================================

router.get(
    "/",
    authMiddleware,
    getPlaySessions
);


// =========================================
// GET MY PLAY SESSIONS
// IMPORTANT: keep /my before /:sessionId
// =========================================

router.get(
    "/my",
    authMiddleware,
    getMyPlaySessions
);


// =========================================
// GET SINGLE PLAY SESSION
// =========================================

router.get(
    "/:sessionId",
    authMiddleware,
    getPlaySessionById
);


// =========================================
// JOIN PLAY SESSION
// =========================================

router.post(
    "/:sessionId/join",
    authMiddleware,
    joinPlaySession
);


// =========================================
// LEAVE PLAY SESSION
// =========================================

router.delete(
    "/:sessionId/leave",
    authMiddleware,
    leavePlaySession
);


// =========================================
// CANCEL PLAY SESSION
// ORGANIZER ONLY
// =========================================

router.patch(
    "/:sessionId/cancel",
    authMiddleware,
    cancelPlaySession
);


// =========================================
// COMPLETE PLAY SESSION
// ORGANIZER ONLY
// =========================================

router.patch(
    "/:sessionId/complete",
    authMiddleware,
    completePlaySession
);


module.exports = router;
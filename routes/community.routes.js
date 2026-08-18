const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
    createCommunity,
    getCommunities,
    getMyCommunities,
    getCommunityById,
    joinCommunity,
    leaveCommunity,
    deactivateCommunity
} = require("../controllers/community.controller");


const router = express.Router();


// =========================================
// CREATE COMMUNITY
// =========================================

router.post(
    "/",
    authMiddleware,
    createCommunity
);


// =========================================
// GET ALL COMMUNITIES
// =========================================

router.get(
    "/",
    authMiddleware,
    getCommunities
);


// =========================================
// GET MY COMMUNITIES
// =========================================

router.get(
    "/my",
    authMiddleware,
    getMyCommunities
);


// =========================================
// GET COMMUNITY DETAILS
// =========================================

router.get(
    "/:communityId",
    authMiddleware,
    getCommunityById
);


// =========================================
// JOIN COMMUNITY
// =========================================

router.post(
    "/:communityId/join",
    authMiddleware,
    joinCommunity
);


// =========================================
// LEAVE COMMUNITY
// =========================================

router.delete(
    "/:communityId/leave",
    authMiddleware,
    leaveCommunity
);


// =========================================
// DEACTIVATE COMMUNITY
// ORGANIZER ONLY
// =========================================

router.patch(
    "/:communityId/deactivate",
    authMiddleware,
    deactivateCommunity
);


module.exports = router;
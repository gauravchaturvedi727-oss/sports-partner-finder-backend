const express = require("express");

const authMiddleware =
    require("../middleware/auth.middleware");


const {
    getProfile,
    updateProfile,
    searchPartners,
    getPlayerById
} = require("../controllers/profile.controller");


const router = express.Router();


// =========================================
// SEARCH PARTNERS
// =========================================

router.get(
    "/search-partners",
    authMiddleware,
    searchPartners
);


// =========================================
// GET MY PROFILE
// =========================================

router.get(
    "/me",
    authMiddleware,
    getProfile
);


// =========================================
// UPDATE MY PROFILE
// =========================================

router.patch(
    "/me",
    authMiddleware,
    updateProfile
);


// =========================================
// GET PLAYER BY ID
// =========================================

router.get(
    "/:playerId",
    authMiddleware,
    getPlayerById
);


module.exports = router;
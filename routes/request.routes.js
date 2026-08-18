const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
    sendRequest,
    getIncomingRequest,
    acceptRequest,
    rejectRequest,
    getMyPartners,
    RemoveMyPartner,
    cancelSentRequest,
    getMySentRequests,
    getRequestHistory
} = require("../controllers/request.controller");


const router = express.Router();


// Send request
router.post(
    "/send/:receiverId",
    authMiddleware,
    sendRequest
);


// Incoming requests
router.get(
    "/incoming",
    authMiddleware,
    getIncomingRequest
);


// Accept request
router.patch(
    "/:requestId/accept",
    authMiddleware,
    acceptRequest
);


// Reject request
router.patch(
    "/:requestId/reject",
    authMiddleware,
    rejectRequest
);


// My partners
router.get(
    "/my-partners",
    authMiddleware,
    getMyPartners
);


// Remove partner
router.delete(
    "/partners/:partnerId",
    authMiddleware,
    RemoveMyPartner
);


// Cancel sent request
router.delete(
    "/:requestId/cancel",
    authMiddleware,
    cancelSentRequest
);


// Sent requests
router.get(
    "/sent",
    authMiddleware,
    getMySentRequests
);


// Request / Match history
router.get(
    "/history",
    authMiddleware,
    getRequestHistory
);


module.exports = router;
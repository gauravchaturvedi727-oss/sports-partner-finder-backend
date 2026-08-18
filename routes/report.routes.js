const express = require("express");

const authMiddleware =
    require("../middleware/auth.middleware");

const {
    createReport,
    getReports,
    updateReportStatus
} = require("../controllers/report.controller");

const router = express.Router();


// USER
router.post(
    "/:reportedUserId",
    authMiddleware,
    createReport
);


// ADMIN
router.get(
    "/",
    authMiddleware,
    getReports
);


router.patch(
    "/:reportId/status",
    authMiddleware,
    updateReportStatus
);


module.exports = router;
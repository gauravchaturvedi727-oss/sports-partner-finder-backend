const Report = require("../models/Report");
const UserModel = require("../models/User");


// =========================================
// CREATE REPORT
// =========================================

async function createReport(req, res) {

    try {

        const reporterId = req.userId;

        const { reportedUserId } =
            req.params;

        const {
            reason,
            description
        } = req.body;


        // ================================
        // VALIDATION
        // ================================

        if (!reason) {

            return res.status(400).json({
                success: false,
                message: "Report reason is required"
            });

        }


        // ================================
        // CANNOT REPORT YOURSELF
        // ================================

        if (
            reporterId.toString() ===
            reportedUserId.toString()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You cannot report yourself"
            });

        }


        // ================================
        // CHECK USER
        // ================================

        const reportedUser =
            await UserModel.findById(
                reportedUserId
            );


        if (!reportedUser) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // ================================
        // CREATE REPORT
        // ================================

        const report =
            await Report.create({

                reporter: reporterId,

                reportedUser: reportedUserId,

                reason,

                description

            });


        return res.status(201).json({

            success: true,

            message:
                "Report submitted successfully",

            report

        });


    } catch (error) {

        console.log(
            "Create Report Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong"

        });

    }

}


// =========================================
// GET REPORTS - ADMIN
// =========================================

async function getReports(req, res) {

    try {

        const reports =
            await Report.find()
                .populate(
                    "reporter",
                    "name email"
                )
                .populate(
                    "reportedUser",
                    "name email city sport"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            reports

        });


    } catch (error) {

        console.log(
            "Get Reports Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong"

        });

    }

}


// =========================================
// UPDATE REPORT STATUS - ADMIN
// =========================================

async function updateReportStatus(
    req,
    res
) {

    try {

        const { reportId } =
            req.params;

        const { status } =
            req.body;


        if (
            ![
                "pending",
                "resolved",
                "dismissed"
            ].includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid report status"

            });

        }


        const report =
            await Report.findByIdAndUpdate(

                reportId,

                {
                    status
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!report) {

            return res.status(404).json({

                success: false,

                message:
                    "Report not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Report status updated",

            report

        });


    } catch (error) {

        console.log(
            "Update Report Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong"

        });

    }

}


module.exports = {

    createReport,

    getReports,

    updateReportStatus

};
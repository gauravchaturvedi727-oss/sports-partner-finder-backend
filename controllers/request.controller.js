const UserModel = require("../models/User");
const mongoose = require("mongoose");
const PartnerRequest = require("../models/PartnerRequest");


// =========================================
// SEND PARTNER REQUEST
// =========================================

async function sendRequest(req, res) {

    try {

        const senderId = req.userId;
        const { receiverId } = req.params;


        // =========================================
        // VALIDATE RECEIVER ID
        // =========================================

        if (
            !receiverId ||
            !mongoose.Types.ObjectId.isValid(receiverId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid receiver ID"

            });

        }


        // =========================================
        // CANNOT SEND TO YOURSELF
        // =========================================

        if (
            senderId.toString() ===
            receiverId.toString()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You cannot send request to yourself"

            });

        }


        // =========================================
        // FIND RECEIVER
        // =========================================

        const receiver =
            await UserModel.findById(receiverId);


        if (!receiver) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // =========================================
        // CHECK ACTIVE ACCOUNT
        // =========================================

        if (
            receiver.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "This user account is inactive"

            });

        }


        // =========================================
        // CHECK EXISTING REQUEST
        // =========================================

        const existingRequest =
            await PartnerRequest.findOne({

                sender: senderId,

                receiver: receiverId,

                status: "pending"

            });


        if (existingRequest) {

            return res.status(409).json({

                success: false,

                message:
                    "Request already sent"

            });

        }


        // =========================================
        // CHECK REVERSE REQUEST
        // =========================================

        const reverseRequest =
            await PartnerRequest.findOne({

                sender: receiverId,

                receiver: senderId,

                status: "pending"

            });


        if (reverseRequest) {

            return res.status(409).json({

                success: false,

                message:
                    "This player has already sent you a request"

            });

        }


        // =========================================
        // CHECK EXISTING PARTNERSHIP
        // =========================================

        const existingConnection =
            await PartnerRequest.findOne({

                status: "accepted",

                $or: [

                    {
                        sender: senderId,

                        receiver: receiverId
                    },

                    {
                        sender: receiverId,

                        receiver: senderId
                    }

                ]

            });


        if (existingConnection) {

            return res.status(409).json({

                success: false,

                message:
                    "You are already partners"

            });

        }


        // =========================================
        // CREATE REQUEST
        // =========================================

        const request =
            await PartnerRequest.create({

                sender: senderId,

                receiver: receiverId,

                status: "pending"

            });


        // =========================================
        // RESPONSE
        // =========================================

        return res.status(201).json({

            success: true,

            message:
                "Partner request sent successfully",

            request

        });


    } catch (error) {

        console.log(
            "Send Request Error:",
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
// GET INCOMING REQUESTS
// =========================================

async function getIncomingRequest(req, res) {

    try {

        const myRequests =
            await PartnerRequest.find({

                receiver: req.userId,

                status: "pending"

            })
                .populate(
                    "sender",
                    "name city state sports skillLevel availability playingLocation"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            message:
                myRequests.length === 0
                    ? "No Incoming Requests"
                    : "Requests found",

            requests: myRequests

        });


    } catch (error) {

        console.log(
            "Incoming Request Error:",
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
// ACCEPT REQUEST
// =========================================

async function acceptRequest(req, res) {

    try {

        const { requestId } = req.params;


        const request =
            await PartnerRequest.findOne({

                _id: requestId,

                receiver: req.userId,

                status: "pending"

            });


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Pending request not found"

            });

        }


        // Accept request
        request.status = "accepted";

        request.acceptedAt = new Date();


        await request.save();


        return res.status(200).json({

            success: true,

            message:
                "Request accepted successfully",

            request

        });


    } catch (error) {

        console.log(
            "Accept Request Error:",
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
// REJECT REQUEST
// =========================================

async function rejectRequest(req, res) {

    try {

        const { requestId } = req.params;


        const request =
            await PartnerRequest.findOne({

                _id: requestId,

                receiver: req.userId,

                status: "pending"

            });


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Pending request not found"

            });

        }


        request.status = "rejected";

        request.rejectedAt = new Date();


        await request.save();


        return res.status(200).json({

            success: true,

            message:
                "Request rejected successfully"

        });


    } catch (error) {

        console.log(
            "Reject Request Error:",
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
// GET MY PARTNERS
// =========================================

async function getMyPartners(req, res) {

    try {

        const connections =
            await PartnerRequest.find({

                status: "accepted",

                $or: [

                    {
                        sender: req.userId
                    },

                    {
                        receiver: req.userId
                    }

                ]

            })
                .populate(
                    "sender",
                    "name email city state sports skillLevel availability playingLocation"
                )
                .populate(
                    "receiver",
                    "name email city state sports skillLevel availability playingLocation"
                )
                .sort({
                    acceptedAt: -1
                });


        const partners =
            connections

                .map((connection) => {

                    if (
                        connection.sender._id.toString() ===
                        req.userId.toString()
                    ) {

                        return {

                            ...connection.receiver.toObject(),

                            partnerSince:
                                connection.acceptedAt

                        };

                    }


                    return {

                        ...connection.sender.toObject(),

                        partnerSince:
                            connection.acceptedAt

                    };

                });


        return res.status(200).json({

            success: true,

            message:
                "Partners fetched successfully",

            totalPartners:
                partners.length,

            partners

        });


    } catch (error) {

        console.log(
            "Get Partners Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

}



// =========================================
// REMOVE PARTNER
// =========================================

async function RemoveMyPartner(req, res) {

    try {

        const { partnerId } = req.params;


        const connection =
            await PartnerRequest.findOne({

                status: "accepted",

                $or: [

                    {
                        sender: req.userId,

                        receiver: partnerId
                    },

                    {
                        sender: partnerId,

                        receiver: req.userId
                    }

                ]

            });


        if (!connection) {

            return res.status(404).json({

                success: false,

                message:
                    "Partner connection not found"

            });

        }


        await connection.deleteOne();


        return res.status(200).json({

            success: true,

            message:
                "Partner removed successfully"

        });


    } catch (error) {

        console.log(
            "Remove Partner Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

}



// =========================================
// CANCEL SENT REQUEST
// =========================================

async function cancelSentRequest(req, res) {

    try {

        const userId = req.userId;

        const { requestId } = req.params;


        const request =
            await PartnerRequest.findOne({

                _id: requestId,

                sender: userId,

                status: "pending"

            });


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Pending sent request not found"

            });

        }


        // Keep history instead of deleting
        request.status = "cancelled";

        request.cancelledAt = new Date();


        await request.save();


        return res.status(200).json({

            success: true,

            message:
                "Partner request cancelled successfully"

        });


    } catch (error) {

        console.log(
            "Cancel Request Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

}



// =========================================
// GET MY SENT REQUESTS
// =========================================

async function getMySentRequests(req, res) {

    try {

        const userId = req.userId;


        const requests =
            await PartnerRequest.find({

                sender: userId,

                status: "pending"

            })
                .populate(
                    "receiver",
                    "name city state sports skillLevel availability playingLocation"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            message:
                "Sent requests fetched successfully",

            requests

        });


    } catch (error) {

        console.log(
            "Get Sent Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

}



// =========================================
// GET REQUEST HISTORY
// =========================================

async function getRequestHistory(req, res) {

    try {

        const requests =
            await PartnerRequest.find({

                $or: [

                    {
                        sender: req.userId
                    },

                    {
                        receiver: req.userId
                    }

                ],

                status: {
                    $in: [
                        "accepted",
                        "rejected",
                        "cancelled"
                    ]
                }

            })
                .populate(
                    "sender",
                    "name city state sports skillLevel"
                )
                .populate(
                    "receiver",
                    "name city state sports skillLevel"
                )
                .sort({
                    updatedAt: -1
                });


        return res.status(200).json({

            success: true,

            message:
                "Request history fetched successfully",

            total:
                requests.length,

            requests

        });


    } catch (error) {

        console.log(
            "Request History Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

}



module.exports = {

    sendRequest,

    getIncomingRequest,

    acceptRequest,

    rejectRequest,

    getMyPartners,

    RemoveMyPartner,

    cancelSentRequest,

    getMySentRequests,

    getRequestHistory

};
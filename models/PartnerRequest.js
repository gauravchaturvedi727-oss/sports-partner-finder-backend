const mongoose = require("mongoose");


const partnerRequestSchema = new mongoose.Schema(
    {
        // ==============================
        // REQUEST SENDER
        // ==============================

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ==============================
        // REQUEST RECEIVER
        // ==============================

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ==============================
        // REQUEST STATUS
        // ==============================

        status: {
            type: String,

            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled"
            ],

            default: "pending"
        },


        // ==============================
        // WHEN REQUEST WAS ACCEPTED
        // ==============================

        acceptedAt: {
            type: Date,
            default: null
        },


        // ==============================
        // WHEN REQUEST WAS REJECTED
        // ==============================

        rejectedAt: {
            type: Date,
            default: null
        },


        // ==============================
        // WHEN REQUEST WAS CANCELLED
        // ==============================

        cancelledAt: {
            type: Date,
            default: null
        }

    },

    {
        timestamps: true
    }
);


// ==============================
// INDEXES
// ==============================

partnerRequestSchema.index({
    sender: 1,
    receiver: 1
});


partnerRequestSchema.index({
    receiver: 1,
    status: 1
});


partnerRequestSchema.index({
    sender: 1,
    status: 1
});


const PartnerRequest = mongoose.model(
    "PartnerRequest",
    partnerRequestSchema
);


module.exports = PartnerRequest;
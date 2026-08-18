const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reason: {
            type: String,
            enum: [
                "spam",
                "harassment",
                "inappropriate_behavior",
                "fake_profile",
                "other"
            ],
            required: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500
        },

        status: {
            type: String,
            enum: [
                "pending",
                "resolved",
                "dismissed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Report = mongoose.model(
    "Report",
    reportSchema
);

module.exports = Report;
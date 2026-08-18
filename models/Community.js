const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            default: "",
            trim: true
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },

    {
        timestamps: true
    }
);


communitySchema.index({
    city: 1
});

communitySchema.index({
    organizer: 1
});


const Community = mongoose.model(
    "Community",
    communitySchema
);

module.exports = Community;
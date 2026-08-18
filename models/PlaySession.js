const mongoose = require("mongoose");

const playSessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        game: {
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
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        maxPlayers: {
            type: Number,
            required: true,
            min: 2
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            default: null
        },

        status: {
            type: String,
            enum: [
                "scheduled",
                "completed",
                "cancelled"
            ],
            default: "scheduled"
        }
    },

    {
        timestamps: true
    }
);


// Useful indexes
playSessionSchema.index({
    city: 1,
    game: 1
});

playSessionSchema.index({
    date: 1
});

playSessionSchema.index({
    organizer: 1
});

playSessionSchema.index({
    community: 1
});


const PlaySession = mongoose.model(
    "PlaySession",
    playSessionSchema
);

module.exports = PlaySession;
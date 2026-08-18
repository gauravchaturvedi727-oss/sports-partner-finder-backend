const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "Indoor",
                "Outdoor"
            ],
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Game = mongoose.model(
    "Game",
    gameSchema
);

module.exports = Game;
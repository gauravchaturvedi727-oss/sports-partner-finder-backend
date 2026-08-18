const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ==============================
        // BASIC INFORMATION
        // ==============================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },


        // ==============================
        // LOCATION
        // ==============================

        state: {
            type: String,
            default: "",
            trim: true
        },

        city: {
            type: String,
            default: "",
            trim: true
        },


        // ==============================
        // GEO LOCATION
        // ==============================

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },

            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },


        // ==============================
        // SPORTS
        // ==============================

        sports: {
            type: [String],
            default: []
        },


        // ==============================
        // SKILL LEVEL
        // ==============================

        skillLevel: {
            type: String,

            enum: [
                "Beginner",
                "Intermediate",
                "Advanced"
            ],

            default: "Beginner"
        },


        // ==============================
        // AVAILABILITY
        // ==============================

        availability: {
            type: [String],
            default: []
        },


        // ==============================
        // PLAYING LOCATION
        // ==============================

        playingLocation: {
            type: String,

            enum: [
                "Home",
                "Society Clubhouse",
                "Local Ground",
                "Other"
            ],

            default: "Other"
        },


        // ==============================
        // USER ROLE
        // ==============================

        role: {
            type: String,

            enum: [
                "user",
                "admin"
            ],

            default: "user"
        },


        // ==============================
        // ACCOUNT STATUS
        // ==============================

        isActive: {
            type: Boolean,

            default: true
        }

    },

    {
        timestamps: true
    }
);


// ==============================
// INDEXES
// ==============================

userSchema.index({
    city: 1
});

userSchema.index({
    state: 1
});

userSchema.index({
    sports: 1
});

userSchema.index({
    skillLevel: 1
});

userSchema.index({
    isActive: 1
});


// ==============================
// GEO-SPATIAL INDEX
// ==============================

userSchema.index({
    location: "2dsphere"
});


const User = mongoose.model(
    "User",
    userSchema
);


module.exports = User;
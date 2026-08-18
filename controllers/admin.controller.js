const UserModel = require("../models/User");
const PartnerRequest = require("../models/PartnerRequest");
const PlaySession = require("../models/PlaySession");
const Game = require("../models/Game");


// =========================================
// ADMIN DASHBOARD STATS
// =========================================

async function getDashboardStats(req, res) {

    try {

        const totalUsers =
            await UserModel.countDocuments();

        const activeUsers =
            await UserModel.countDocuments({
                isActive: true
            });

        const inactiveUsers =
            await UserModel.countDocuments({
                isActive: false
            });


        // =========================
        // REQUEST STATS
        // =========================

        const totalRequests =
            await PartnerRequest.countDocuments();

        const pendingRequests =
            await PartnerRequest.countDocuments({
                status: "pending"
            });

        const acceptedRequests =
            await PartnerRequest.countDocuments({
                status: "accepted"
            });

        const rejectedRequests =
            await PartnerRequest.countDocuments({
                status: "rejected"
            });


        // =========================
        // PLAY SESSION STATS
        // =========================

        const totalPlaySessions =
            await PlaySession.countDocuments();

        const scheduledGames =
            await PlaySession.countDocuments({
                status: "scheduled"
            });

        const completedGames =
            await PlaySession.countDocuments({
                status: "completed"
            });

        const cancelledGames =
            await PlaySession.countDocuments({
                status: "cancelled"
            });


        return res.status(200).json({

            success: true,

            stats: {

                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers
                },

                requests: {
                    total: totalRequests,
                    pending: pendingRequests,
                    accepted: acceptedRequests,
                    rejected: rejectedRequests
                },

                games: {
                    total: totalPlaySessions,
                    scheduled: scheduledGames,
                    completed: completedGames,
                    cancelled: cancelledGames
                }

            }

        });

    } catch (error) {

        console.log(
            "Dashboard Stats Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch dashboard statistics"

        });

    }

}



// =========================================
// GET ALL USERS
// =========================================

async function getAllUsers(req, res) {

    try {

        const users =
            await UserModel
                .find()
                .select("-password")
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            totalUsers:
                users.length,

            users

        });

    } catch (error) {

        console.log(
            "Get All Users Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch users"

        });

    }

}



// =========================================
// ACTIVATE / DEACTIVATE USER
// =========================================

async function toggleUserStatus(req, res) {

    try {

        const { userId } =
            req.params;


        const user =
            await UserModel.findById(
                userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // Prevent admin from
        // deactivating himself

        if (
            user._id.toString() ===
            req.userId.toString()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You cannot deactivate yourself"

            });

        }


        user.isActive =
            !user.isActive;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                user.isActive
                    ? "User activated successfully"
                    : "User deactivated successfully",

            isActive:
                user.isActive

        });

    } catch (error) {

        console.log(
            "Toggle User Status Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update user status"

        });

    }

}



// =========================================
// GET ALL GAMES
// =========================================

async function getGames(req, res) {

    try {

        const games =
            await Game
                .find()
                .sort({
                    name: 1
                });


        return res.status(200).json({

            success: true,

            totalGames:
                games.length,

            games

        });

    } catch (error) {

        console.log(
            "Get Games Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch games"

        });

    }

}



// =========================================
// ADD GAME
// =========================================

async function addGame(req, res) {

    try {

        const {
            name,
            category
        } = req.body;


        // =========================
        // VALIDATION
        // =========================

        if (!name || !category) {

            return res.status(400).json({

                success: false,

                message:
                    "Game name and category are required"

            });

        }


        const cleanName =
            name.trim();


        if (!cleanName) {

            return res.status(400).json({

                success: false,

                message:
                    "Game name cannot be empty"

            });

        }


        // =========================
        // VALID CATEGORY
        // =========================

        const validCategories = [
            "Indoor",
            "Outdoor"
        ];


        if (
            !validCategories.includes(
                category
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid game category"

            });

        }


        // =========================
        // CHECK DUPLICATE
        // =========================

        const existingGame =
            await Game.findOne({

                name: {
                    $regex:
                        `^${cleanName}$`,
                    $options: "i"
                }

            });


        if (existingGame) {

            return res.status(409).json({

                success: false,

                message:
                    "Game already exists"

            });

        }


        // =========================
        // CREATE GAME
        // =========================

        const game =
            await Game.create({

                name: cleanName,

                category,

                isActive: true

            });


        return res.status(201).json({

            success: true,

            message:
                "Game added successfully",

            game

        });

    } catch (error) {

        console.log(
            "Add Game Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to add game"

        });

    }

}



// =========================================
// ACTIVATE / DEACTIVATE GAME
// =========================================

async function toggleGameStatus(
    req,
    res
) {

    try {

        const { gameId } =
            req.params;


        const game =
            await Game.findById(
                gameId
            );


        if (!game) {

            return res.status(404).json({

                success: false,

                message:
                    "Game not found"

            });

        }


        game.isActive =
            !game.isActive;


        await game.save();


        return res.status(200).json({

            success: true,

            message:
                game.isActive
                    ? "Game activated successfully"
                    : "Game deactivated successfully",

            game

        });

    } catch (error) {

        console.log(
            "Toggle Game Status Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update game status"

        });

    }

}



// =========================================
// EXPORT
// =========================================

module.exports = {

    getDashboardStats,

    getAllUsers,

    toggleUserStatus,

    getGames,

    addGame,

    toggleGameStatus

};
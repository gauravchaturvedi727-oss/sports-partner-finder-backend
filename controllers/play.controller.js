const PlaySession = require("../models/PlaySession");
const UserModel = require("../models/User");
const Community = require("../models/Community");


// =========================================
// CREATE PLAY SESSION
// =========================================

async function createPlaySession(req, res) {

    try {

        const {
            title,
            game,
            description,
            city,
            location,
            date,
            maxPlayers,
            communityId
        } = req.body;


        // Required fields

        if (
            !title ||
            !game ||
            !city ||
            !location ||
            !date ||
            !maxPlayers
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title, game, city, location, date and max players are required"

            });

        }


        // Validate player count

        if (
            Number(maxPlayers) < 2
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Maximum players must be at least 2"

            });

        }


        // Validate date

        const sessionDate =
            new Date(date);


        if (
            Number.isNaN(
                sessionDate.getTime()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid date"

            });

        }


        if (
            sessionDate <= new Date()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Play session must be scheduled for a future date"

            });

        }


        // =====================================
        // COMMUNITY VALIDATION
        // =====================================

        let community = null;


        if (communityId) {

            community =
                await Community.findOne({

                    _id: communityId,

                    isActive: true

                });


            if (!community) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Community not found"

                });

            }


            // User must be member

            const isMember =
                community.members.some(
                    (memberId) =>
                        memberId.toString() ===
                        req.userId.toString()
                );


            if (!isMember) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You must be a community member to create a community play session"

                });

            }

        }


        // =====================================
        // CREATE SESSION
        // =====================================

        const session =
            await PlaySession.create({

                title: title.trim(),

                game: game.trim(),

                description:
                    description?.trim() || "",

                city: city.trim(),

                location: location.trim(),

                date: sessionDate,

                maxPlayers:
                    Number(maxPlayers),

                organizer: req.userId,

                players: [
                    req.userId
                ],

                community:
                    community
                        ? community._id
                        : null

            });


        const populatedSession =
            await PlaySession.findById(
                session._id
            )
                .populate(
                    "organizer",
                    "name city sport"
                )
                .populate(
                    "players",
                    "name city sport"
                )
                .populate(
                    "community",
                    "name city location"
                );


        return res.status(201).json({

            success: true,

            message:
                "Play session created successfully",

            session:
                populatedSession

        });


    } catch (error) {

        console.log(
            "Create Play Session Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create play session"

        });

    }

}


// =========================================
// GET ALL PLAY SESSIONS
// =========================================

async function getPlaySessions(req, res) {

    try {

        const {
            city,
            game,
            status
        } = req.query;


        const filter = {};


        // Only future scheduled
        // sessions by default

        if (status) {

            filter.status = status;

        } else {

            filter.status = "scheduled";

        }


        if (city) {

            filter.city = {

                $regex: city,

                $options: "i"

            };

        }


        if (game) {

            filter.game = {

                $regex: game,

                $options: "i"

            };

        }


        const sessions =
            await PlaySession.find(filter)

                .populate(
                    "organizer",
                    "name city sport"
                )

                .populate(
                    "players",
                    "name city sport"
                )

                .populate(
                    "community",
                    "name city location"
                )

                .sort({
                    date: 1
                });


        return res.status(200).json({

            success: true,

            totalSessions:
                sessions.length,

            sessions

        });


    } catch (error) {

        console.log(
            "Get Play Sessions Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch play sessions"

        });

    }

}


// =========================================
// GET MY PLAY SESSIONS
// =========================================

async function getMyPlaySessions(req, res) {

    try {

        const sessions =
            await PlaySession.find({

                $or: [

                    {
                        organizer:
                            req.userId
                    },

                    {
                        players:
                            req.userId
                    }

                ]

            })

                .populate(
                    "organizer",
                    "name city sport"
                )

                .populate(
                    "players",
                    "name city sport"
                )

                .populate(
                    "community",
                    "name city location"
                )

                .sort({
                    date: 1
                });


        return res.status(200).json({

            success: true,

            totalSessions:
                sessions.length,

            sessions

        });


    } catch (error) {

        console.log(
            "Get My Play Sessions Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch your play sessions"

        });

    }

}


// =========================================
// GET SINGLE PLAY SESSION
// =========================================

async function getPlaySessionById(req, res) {

    try {

        const {
            sessionId
        } = req.params;


        const session =
            await PlaySession.findById(
                sessionId
            )

                .populate(
                    "organizer",
                    "name email city sport availability"
                )

                .populate(
                    "players",
                    "name city sport skillLevel availability"
                )

                .populate(
                    "community",
                    "name city location"
                );


        if (!session) {

            return res.status(404).json({

                success: false,

                message:
                    "Play session not found"

            });

        }


        return res.status(200).json({

            success: true,

            session

        });


    } catch (error) {

        console.log(
            "Get Play Session Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch play session"

        });

    }

}


// =========================================
// JOIN PLAY SESSION
// =========================================

async function joinPlaySession(req, res) {

    try {

        const {
            sessionId
        } = req.params;


        const session =
            await PlaySession.findOne({

                _id: sessionId,

                status: "scheduled"

            });


        if (!session) {

            return res.status(404).json({

                success: false,

                message:
                    "Play session not found"

            });

        }


        // Already joined

        const alreadyJoined =
            session.players.some(
                (playerId) =>
                    playerId.toString() ===
                    req.userId.toString()
            );


        if (alreadyJoined) {

            return res.status(409).json({

                success: false,

                message:
                    "You have already joined this session"

            });

        }


        // Full

        if (
            session.players.length >=
            session.maxPlayers
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This play session is full"

            });

        }


        session.players.push(
            req.userId
        );


        await session.save();


        return res.status(200).json({

            success: true,

            message:
                "Joined play session successfully"

        });


    } catch (error) {

        console.log(
            "Join Play Session Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to join play session"

        });

    }

}


// =========================================
// LEAVE PLAY SESSION
// =========================================

async function leavePlaySession(req, res) {

    try {

        const {
            sessionId
        } = req.params;


        const session =
            await PlaySession.findOne({

                _id: sessionId,

                status: "scheduled"

            });


        if (!session) {

            return res.status(404).json({

                success: false,

                message:
                    "Play session not found"

            });

        }


        // Organizer cannot leave

        if (
            session.organizer.toString() ===
            req.userId.toString()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer cannot leave the session. Cancel it instead."

            });

        }


        const isPlayer =
            session.players.some(
                (playerId) =>
                    playerId.toString() ===
                    req.userId.toString()
            );


        if (!isPlayer) {

            return res.status(400).json({

                success: false,

                message:
                    "You are not part of this session"

            });

        }


        session.players =
            session.players.filter(
                (playerId) =>
                    playerId.toString() !==
                    req.userId.toString()
            );


        await session.save();


        return res.status(200).json({

            success: true,

            message:
                "Left play session successfully"

        });


    } catch (error) {

        console.log(
            "Leave Play Session Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to leave play session"

        });

    }

}


// =========================================
// CANCEL PLAY SESSION
// ORGANIZER ONLY
// =========================================

async function cancelPlaySession(req, res) {

    try {

        const {
            sessionId
        } = req.params;


        const session =
            await PlaySession.findOne({

                _id: sessionId,

                organizer: req.userId,

                status: "scheduled"

            });


        if (!session) {

            return res.status(404).json({

                success: false,

                message:
                    "Session not found or you are not the organizer"

            });

        }


        session.status = "cancelled";


        await session.save();


        return res.status(200).json({

            success: true,

            message:
                "Play session cancelled successfully"

        });


    } catch (error) {

        console.log(
            "Cancel Play Session Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to cancel play session"

        });

    }

}


// =========================================
// COMPLETE PLAY SESSION
// ORGANIZER ONLY
// =========================================

async function completePlaySession(req, res) {

    try {

        const {
            sessionId
        } = req.params;


        const session =
            await PlaySession.findOne({

                _id: sessionId,

                organizer: req.userId,

                status: "scheduled"

            });


        if (!session) {

            return res.status(404).json({

                success: false,

                message:
                    "Session not found or you are not the organizer"

            });

        }


        session.status = "completed";


        await session.save();


        return res.status(200).json({

            success: true,

            message:
                "Play session marked as completed"

        });


    } catch (error) {

        console.log(
            "Complete Play Session Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to complete play session"

        });

    }

}


module.exports = {

    createPlaySession,

    getPlaySessions,

    getMyPlaySessions,

    getPlaySessionById,

    joinPlaySession,

    leavePlaySession,

    cancelPlaySession,

    completePlaySession

};
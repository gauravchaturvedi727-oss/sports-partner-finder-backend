const Community = require("../models/Community");
const UserModel = require("../models/User");


// =========================================
// CREATE COMMUNITY
// =========================================

async function createCommunity(req, res) {

    try {

        const {
            name,
            description,
            city,
            location
        } = req.body;


        if (!name || !city) {

            return res.status(400).json({
                success: false,
                message: "Community name and city are required"
            });

        }


        const community =
            await Community.create({

                name: name.trim(),

                description:
                    description?.trim() || "",

                city: city.trim(),

                location:
                    location?.trim() || "",

                organizer: req.userId,

                members: [req.userId]

            });


        const populatedCommunity =
            await Community.findById(
                community._id
            )
                .populate(
                    "organizer",
                    "name email city"
                )
                .populate(
                    "members",
                    "name city sport sports"
                );


        return res.status(201).json({

            success: true,

            message:
                "Community created successfully",

            community: populatedCommunity

        });

    } catch (error) {

        console.log(
            "Create Community Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create community"

        });

    }

}


// =========================================
// GET ALL ACTIVE COMMUNITIES
// =========================================

async function getCommunities(req, res) {

    try {

        const { city } = req.query;


        const filter = {
            isActive: true
        };


        if (city) {

            filter.city = {
                $regex: city,
                $options: "i"
            };

        }


        const communities =
            await Community.find(filter)
                .populate(
                    "organizer",
                    "name city"
                )
                .populate(
                    "members",
                    "name city sport sports"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            totalCommunities:
                communities.length,

            communities

        });

    } catch (error) {

        console.log(
            "Get Communities Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch communities"

        });

    }

}


// =========================================
// GET MY COMMUNITIES
// =========================================

async function getMyCommunities(req, res) {

    try {

        const communities =
            await Community.find({

                $or: [

                    {
                        organizer: req.userId
                    },

                    {
                        members: req.userId
                    }

                ],

                isActive: true

            })
                .populate(
                    "organizer",
                    "name city"
                )
                .populate(
                    "members",
                    "name city sport sports"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            totalCommunities:
                communities.length,

            communities

        });

    } catch (error) {

        console.log(
            "Get My Communities Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch your communities"

        });

    }

}


// =========================================
// JOIN COMMUNITY
// =========================================

async function joinCommunity(req, res) {

    try {

        const { communityId } =
            req.params;


        const community =
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


        // Already a member
        if (
            community.members.some(
                (memberId) =>
                    memberId.toString() ===
                    req.userId.toString()
            )
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "You are already a member"

            });

        }


        community.members.push(
            req.userId
        );


        await community.save();


        return res.status(200).json({

            success: true,

            message:
                "Joined community successfully"

        });

    } catch (error) {

        console.log(
            "Join Community Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to join community"

        });

    }

}


// =========================================
// LEAVE COMMUNITY
// =========================================

async function leaveCommunity(req, res) {

    try {

        const { communityId } =
            req.params;


        const community =
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


        // Organizer cannot leave
        if (
            community.organizer.toString() ===
            req.userId.toString()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer cannot leave the community"

            });

        }


        const isMember =
            community.members.some(
                (memberId) =>
                    memberId.toString() ===
                    req.userId.toString()
            );


        if (!isMember) {

            return res.status(400).json({

                success: false,

                message:
                    "You are not a member of this community"

            });

        }


        community.members =
            community.members.filter(
                (memberId) =>
                    memberId.toString() !==
                    req.userId.toString()
            );


        await community.save();


        return res.status(200).json({

            success: true,

            message:
                "Left community successfully"

        });

    } catch (error) {

        console.log(
            "Leave Community Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to leave community"

        });

    }

}


// =========================================
// GET COMMUNITY DETAILS
// =========================================

async function getCommunityById(req, res) {

    try {

        const { communityId } =
            req.params;


        const community =
            await Community.findOne({

                _id: communityId,

                isActive: true

            })
                .populate(
                    "organizer",
                    "name email city"
                )
                .populate(
                    "members",
                    "name city sport sports skillLevel availability"
                );


        if (!community) {

            return res.status(404).json({

                success: false,

                message:
                    "Community not found"

            });

        }


        return res.status(200).json({

            success: true,

            community

        });

    } catch (error) {

        console.log(
            "Get Community Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch community"

        });

    }

}


// =========================================
// DELETE / DEACTIVATE COMMUNITY
// ORGANIZER ONLY
// =========================================

async function deactivateCommunity(req, res) {

    try {

        const { communityId } =
            req.params;


        const community =
            await Community.findOne({

                _id: communityId,

                organizer: req.userId

            });


        if (!community) {

            return res.status(404).json({

                success: false,

                message:
                    "Community not found or you are not the organizer"

            });

        }


        community.isActive = false;

        await community.save();


        return res.status(200).json({

            success: true,

            message:
                "Community deactivated successfully"

        });

    } catch (error) {

        console.log(
            "Deactivate Community Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to deactivate community"

        });

    }

}


module.exports = {

    createCommunity,

    getCommunities,

    getMyCommunities,

    getCommunityById,

    joinCommunity,

    leaveCommunity,

    deactivateCommunity

};
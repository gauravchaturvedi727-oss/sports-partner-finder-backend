const userModel = require("../models/User");


// =========================================
// GET MY PROFILE
// =========================================

async function getProfile(req, res) {

    try {

        const user = await userModel
            .findById(req.userId)
            .select("-password");


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        return res.status(200).json({

            success: true,
            user

        });


    } catch (error) {

        console.log(
            "Get Profile Error:",
            error
        );


        return res.status(500).json({

            success: false,
            message: "Something went wrong"

        });

    }

}


// =========================================
// UPDATE MY PROFILE
// =========================================

async function updateProfile(req, res) {

    try {

        const {
            state,
            city,
            sports,
            skillLevel,
            availability,
            playingLocation,
            latitude,
            longitude
        } = req.body;


        const updateData = {};


        // ==============================
        // STATE
        // ==============================

        if (state !== undefined) {

            updateData.state = state;

        }


        // ==============================
        // CITY
        // ==============================

        if (city !== undefined) {

            updateData.city = city;

        }


        // ==============================
        // SPORTS
        // ==============================

        if (sports !== undefined) {

            updateData.sports =
                Array.isArray(sports)
                    ? sports
                    : [sports];

        }


        // ==============================
        // SKILL LEVEL
        // ==============================

        if (skillLevel !== undefined) {

            updateData.skillLevel =
                skillLevel;

        }


        // ==============================
        // AVAILABILITY
        // ==============================

        if (availability !== undefined) {

            updateData.availability =
                Array.isArray(availability)
                    ? availability
                    : [availability];

        }


        // ==============================
        // PLAYING LOCATION
        // ==============================

        if (
            playingLocation !== undefined
        ) {

            updateData.playingLocation =
                playingLocation;

        }


        // ==============================
        // GEO LOCATION
        // ==============================

        if (
            latitude !== undefined ||
            longitude !== undefined
        ) {

            // Both must be provided together
            if (
                latitude === undefined ||
                longitude === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Both latitude and longitude are required"

                });

            }


            const lat = Number(latitude);
            const lng = Number(longitude);


            // Validate numbers

            if (
                Number.isNaN(lat) ||
                Number.isNaN(lng)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid latitude or longitude"

                });

            }


            // Validate latitude

            if (
                lat < -90 ||
                lat > 90
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid latitude"

                });

            }


            // Validate longitude

            if (
                lng < -180 ||
                lng > 180
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid longitude"

                });

            }


            // MongoDB GeoJSON
            // IMPORTANT:
            // longitude comes first

            updateData.location = {

                type: "Point",

                coordinates: [
                    lng,
                    lat
                ]

            };

        }


        // ==============================
        // UPDATE USER
        // ==============================

        const user =
            await userModel.findByIdAndUpdate(

                req.userId,

                {
                    $set: updateData
                },

                {
                    new: true,
                    runValidators: true
                }

            ).select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Profile updated successfully",

            user

        });


    } catch (error) {

        console.log(
            "Update Profile Error:",
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
// SEARCH PARTNERS
// =========================================

async function searchPartners(req, res) {

    try {

        const {
            city,
            sport,
            skillLevel,
            availability,
            latitude,
            longitude,
            radius
        } = req.query;


        // ==============================
        // PAGINATION
        // ==============================

        const page = Math.max(

            Number(req.query.page) || 1,

            1

        );


        const limit = Math.min(

            Math.max(
                Number(req.query.limit) || 10,
                1
            ),

            50

        );


        const skip =
            (page - 1) * limit;


        // ==============================
        // BASE FILTER
        // ==============================

        const filter = {
            _id: {
                $ne: req.userId
            },

            isActive: {
                $ne: false
            }
        };


        // ==============================
        // CITY FILTER
        // ==============================

        if (city && city.trim()) {

            filter.city = {

                $regex: city.trim(),

                $options: "i"

            };

        }


        // ==============================
        // SPORTS FILTER
        // ==============================

        if (sport && sport.trim()) {

            filter.sports = {

                $regex: sport.trim(),

                $options: "i"

            };

        }


        // ==============================
        // SKILL LEVEL FILTER
        // ==============================

        if (skillLevel && skillLevel.trim()) {

            filter.skillLevel =
                skillLevel.trim();

        }


        // ==============================
        // AVAILABILITY FILTER
        // ==============================

        if (
            availability &&
            availability.trim()
        ) {

            filter.availability = {

                $regex:
                    availability.trim(),

                $options: "i"

            };

        }


        // ==============================
        // CHECK LOCATION SEARCH
        // ==============================

        const hasLocation =
            latitude !== undefined &&
            longitude !== undefined;


        // =====================================================
        // NEARBY SEARCH
        // =====================================================

        if (hasLocation) {

            const lat =
                Number(latitude);

            const lng =
                Number(longitude);

            const radiusKm =
                Number(radius) || 10;


            // ==============================
            // VALIDATE COORDINATES
            // ==============================

            if (
                Number.isNaN(lat) ||
                Number.isNaN(lng)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid location coordinates"

                });

            }


            if (
                lat < -90 ||
                lat > 90
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid latitude"

                });

            }


            if (
                lng < -180 ||
                lng > 180
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid longitude"

                });

            }


            // ==============================
            // VALIDATE RADIUS
            // ==============================

            if (
                radiusKm <= 0 ||
                radiusKm > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Radius must be between 1 and 100 km"

                });

            }


            // ==============================
            // GEO QUERY
            // ==============================

            const geoQuery = {

                $geoNear: {

                    near: {

                        type: "Point",

                        coordinates: [
                            lng,
                            lat
                        ]

                    },

                    key: "location",

                    distanceField:
                        "distanceFromUser",

                    maxDistance:
                        radiusKm * 1000,

                    spherical: true,

                    query: filter

                }

            };


            // ==============================
            // CONVERT DISTANCE TO KM
            // ==============================

            const addDistance = {

                $addFields: {

                    distanceKm: {

                        $divide: [
                            "$distanceFromUser",
                            1000
                        ]

                    }

                }

            };


            // ==============================
            // HIDE PASSWORD
            // ==============================

            const project = {

                $project: {

                    password: 0,

                    distanceFromUser: 0

                }

            };


            // ==============================
            // PAGINATION + TOTAL
            // ==============================

            const facet = {

                $facet: {

                    users: [

                        {
                            $skip: skip
                        },

                        {
                            $limit: limit
                        }

                    ],

                    total: [

                        {
                            $count: "count"
                        }

                    ]

                }

            };


            const result =
                await userModel.aggregate([

                    geoQuery,

                    addDistance,

                    project,

                    facet

                ]);


            const users =
                result[0]?.users || [];


            const totalUsers =
                result[0]?.total?.[0]?.count || 0;


            return res.status(200).json({

                success: true,

                page,

                limit,

                totalUsers,

                totalPages:
                    Math.ceil(
                        totalUsers / limit
                    ),

                users

            });

        }


        // =====================================================
        // NORMAL SEARCH
        // =====================================================

        const users =
            await userModel

                .find(filter)

                .select("-password")

                .skip(skip)

                .limit(limit);


        // ==============================
        // TOTAL USERS
        // ==============================

        const totalUsers =
            await userModel.countDocuments(
                filter
            );


        return res.status(200).json({

            success: true,

            page,

            limit,

            totalUsers,

            totalPages:
                Math.ceil(
                    totalUsers / limit
                ),

            users

        });


    } catch (error) {

        console.log(
            "Search Partners Error:",
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
// GET PLAYER BY ID
// =========================================

async function getPlayerById(req, res) {

    try {

        const { playerId } = req.params;


        const user =
            await userModel
                .findById(playerId)
                .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "Player not found"

            });

        }


        return res.status(200).json({

            success: true,

            user

        });


    } catch (error) {

        console.log(
            "Get Player Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Something went wrong"

        });

    }

}

// =========================================
// EXPORT
// =========================================

module.exports = {

    getProfile,

    updateProfile,

    searchPartners,

    getPlayerById

};
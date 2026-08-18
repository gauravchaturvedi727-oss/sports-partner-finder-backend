const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// =========================================
// SIGNUP
// =========================================

async function signupUser(req, res) {

    try {

        const {
            name,
            email,
            password,
            city,
            state,
            sports,
            skillLevel,
            availability,
            playingLocation
        } = req.body;


        // =========================================
        // REQUIRED FIELD VALIDATION
        // =========================================

        if (
            !name ||
            !email ||
            !password ||
            !city ||
            !state ||
            !sports ||
            sports.length === 0 ||
            !skillLevel ||
            !availability ||
            availability.length === 0 ||
            !playingLocation
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // =========================================
        // PASSWORD VALIDATION
        // =========================================

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long"
            });

        }


        // =========================================
        // NORMALIZE EMAIL
        // =========================================

        const normalizedEmail =
            email.trim().toLowerCase();


        // =========================================
        // CHECK EXISTING USER
        // =========================================

        const existingUser =
            await UserModel.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });

        }


        // =========================================
        // HASH PASSWORD
        // =========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // =========================================
        // CREATE USER
        // =========================================

        const user =
            await UserModel.create({

                name: name.trim(),

                email: normalizedEmail,

                password: hashedPassword,

                city: city.trim(),

                state: state.trim(),

                sports: sports,

                skillLevel: skillLevel,

                availability: availability,

                playingLocation: playingLocation

            });


        // =========================================
        // RESPONSE
        // =========================================

        return res.status(201).json({

            success: true,

            message:
                "User created successfully"

        });


    } catch (error) {

        console.log(
            "Signup Error:",
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
// LOGIN
// =========================================

async function loginUser(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        // =========================================
        // VALIDATION
        // =========================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // =========================================
        // NORMALIZE EMAIL
        // =========================================

        const normalizedEmail =
            email.trim().toLowerCase();


        // =========================================
        // FIND USER
        // =========================================

        const user =
            await UserModel.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // =========================================
        // CHECK ACTIVE USER
        // =========================================

        if (!user.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "Your account has been disabled"

            });

        }


        // =========================================
        // COMPARE PASSWORD
        // =========================================

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // =========================================
        // GENERATE JWT
        // =========================================

        const token =
            jwt.sign(

                {
                    userId: user._id,

                    role: user.role

                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        // =========================================
        // RESPONSE
        // =========================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.log(
            "Login Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Something went wrong"

        });

    }

}


module.exports = {

    signupUser,

    loginUser

};
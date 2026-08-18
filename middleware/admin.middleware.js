const UserModel = require("../models/User");

async function adminMiddleware(req, res, next) {

    try {

        const user = await UserModel
            .findById(req.userId)
            .select("role isActive");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        next();

    } catch (error) {

        console.log(
            "Admin Middleware Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

module.exports = adminMiddleware;
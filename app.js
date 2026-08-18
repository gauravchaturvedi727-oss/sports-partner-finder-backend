const express = require("express");
const cors = require("cors");

const authRoute = require("./routes/auth.routes");
const profileRoute = require("./routes/profile.routes");
const requestRoute = require("./routes/request.routes");
const playRoute = require("./routes/play.routes");
const adminRoute = require("./routes/admin.routes");
const communityRoute = require("./routes/community.routes");
const reportRoute = require("./routes/report.routes");

const app = express();



app.use(express.json());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://sports-partner-finder-frontend-hv719qf70.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);



app.use(
    "/api/auth",
    authRoute
);

app.use(
    "/api/profile",
    profileRoute
);

app.use(
    "/api/requests",
    requestRoute
);

app.use(
    "/api/play",
    playRoute
);

app.use(
    "/api/admin",
    adminRoute
);

app.use(
    "/api/communities",
    communityRoute
);

app.use(
    "/api/reports",
    reportRoute
);


app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "Sports Partner Finder API is Running 🚀"

    });

});


module.exports = app;

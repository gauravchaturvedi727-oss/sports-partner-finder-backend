const mongoose = require("mongoose");
const dns = require("dns");
const express = require("express");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

app.get("/", (req, res) => {
    res.send("Hello");
});

app.listen(3000, () => {
    console.log("Mini server running on 3000");
});
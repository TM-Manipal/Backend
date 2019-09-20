"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const chalk = require("chalk");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

// Middlewares
const handle404 = require("./middlewares/handle404");
const errorHandler = require("./middlewares/errorHandler");
const headers = require("./middlewares/headers");
//const auth = require("./middlewares/auth");

// Configure application

app.use(logger(function (tokens, req, res) {
  return chalk.redBright(tokens["remote-addr"](req, res))
    + " " + chalk.blue(tokens.date(req, res))
    + " " + chalk.green(tokens.method(req, res))
    + " " + chalk.white(tokens.url(req, res))
    + " " + chalk.green(tokens.status(req, res))
    + " " + chalk.redBright(tokens.referrer(req, res))
    + " " + chalk.yellow(tokens["user-agent"](req, res))
    + " " + chalk.cyan(tokens["response-time"](req, res));
}));

app.use(cors({
  origin: [
    "http://manipalutsav.github.io",
    "https://manipalutsav.github.io",
    "http://manipalutsav.com",
    "https://manipalutsav.com",
    /\.manipalutsav\.com$/,
    /^(https?:\/\/)(localhost|(192\.168\.\d{1,3}\.\d{1,3}))(:\d{1,5})*$/,
    // /^(?:https?:\/\/)?(?:localhost|(?:192\.168(?:\.(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){2})(?::(?:[0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))$/,
  ],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(headers);

//if (process.env.NODE_ENV !== "development") app.use(auth);

// Routes
const eventsRouter = require("./routes/events");
//const leaderboardRouter = require("./routes/leaderboard"); this has to complete change
const usersRouter = require("./routes/users");
const judgesRouter = require("./routes/judges");
const intruderRouter = require("./routes/intruder");
const participantsRouter = require("./routes/participants");
const statsRouter = require("./routes/stats");

app.use("/events", eventsRouter);
//app.use("/leaderboard", leaderboardRouter); this has to complete change
app.use("/users", usersRouter);
app.use("/judges", judgesRouter);
app.use("/intruder", intruderRouter);
app.use("/participants", participantsRouter);
app.use("/stats", statsRouter);

// Error handlers
app.use(handle404);
app.use(errorHandler);

module.exports = app;

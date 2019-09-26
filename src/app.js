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
const participantsRouter = require("./routes/participants");
const teamsRouter = require("./routes/teams");

app.use("/events", eventsRouter);
app.use('/teams', teamsRouter);
//app.use("/leaderboard", leaderboardRouter); this has to complete change
app.use("/participants", participantsRouter);

// Error handlers
app.use(handle404);
app.use(errorHandler);

module.exports = app;

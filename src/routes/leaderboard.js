"use strict";

const express = require("express");
const router = express.Router();

const Leaderboard = require("../controllers/leaderboard");

// Returns the leaderboard
router.get("/", Leaderboard.get);
// Returns the leaderboard visible to the public
router.get("/public", Leaderboard.getPublic);
// Returns the list of all the winning teams
router.get("/winners", Leaderboard.getWinners);

// Create the leaderboard with initial scores
router.post("/", Leaderboard.init);
// Publish the leaderboard to public
router.post("/publish", Leaderboard.publish);

// Modify the leaderboard with updated scores of the given college
router.patch("/:college", Leaderboard.update);

module.exports = router;

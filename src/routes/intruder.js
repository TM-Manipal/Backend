"use strict";

const express = require("express");
const router = express.Router();

const Intruder = require("../controllers/intruder");

router.get("/events", Intruder.getEvents);
router.get("/slots/:round", Intruder.getSlots);
router.get("/users", Intruder.getUsers);
router.get("/events/:event/leaderboard", Intruder.getEventLeaderboard);
router.get("/events/:event/rounds/:round/leaderboard", Intruder.getRoundLeaderboard);
// router.get("/result", Intruder.getResults);

module.exports = router;

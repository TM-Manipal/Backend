"use strict";

const express = require("express");
const router = express.Router();

// TODO: replace `noop` with actual controllers
const Events = require("../controllers/events");



// Register a team to the given event
router.post("/register", Events.createTeam);

// Returns the list of all events
router.get("/", Events.getAll);



// Returns the event for the given id
router.get("/:event", Events.get);

// Create a new event
router.post("/", Events.create);

module.exports = router;

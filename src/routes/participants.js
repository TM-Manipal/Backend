"use strict";

const express = require("express");
const router = express.Router();

const Participants = require("../controllers/participants");

// Returns the list of all participants
router.get("/", Participants.getAll);
// Returns the specified participant
router.get("/:participant", Participants.get);

// Updates the details of the specified participant
router.patch("/:participant", Participants.update);

module.exports = router;

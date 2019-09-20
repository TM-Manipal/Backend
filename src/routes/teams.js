"use strict";

const express = require("express");
const router = express.Router();

const Teams = require("../controllers/teams");

// Returns the list of all teams
router.get("/", Teams.getAll);

module.exports = router;

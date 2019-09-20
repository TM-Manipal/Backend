"use strict";

const express = require("express");
const router = express.Router();

const Stats = require("../controllers/stats");

// Returns some stats
router.get("/", Stats.get);

module.exports = router;

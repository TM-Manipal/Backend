"use strict";

const TeamModel = require("../models/Team");
const EventModel = require("../models/Event");


/**
 * Fetch team details.
 * @param {object} req The request object
 * @param {object} res The response object
 * @returns {void}
 */
const get = async (req, res) => {
  let team = await TeamModel.findById({ id: req.params.id });

  return res.json({
    status: 200,
    message: "Success",
    data: { team },
  });
};

const getAll = async (req, res) => {
  let teams = await TeamModel.find()
  .populate({
    path: "members",
    model: "Participant",
  });

  if (!teams) teams = [];

  teams = teams.map(team => ({
    id: team.id,
    college: team.college,
    members: team.members,
    disqualified: team.disqualified,
  }));

  return res.json({
    status: 200,
    message: "Success",
    data: teams,
  });
};

module.exports = {
  getAll
};

"use strict";

const EventModel = require("../models/Event");
const RoundModel = require("../models/Round");
const ScoreModel = require("../models/Score");
const TeamModel = require("../models/Team");
const UserModel = require("../models/User");

const { USER_TYPES } = require("../utils/constants");

const getEvents = async (req, res) => {
  let events = await EventModel.find().populate({
    path: "college",
    model: "College",
  });


  events = events.map(event => {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      college: event.college.name,
      venue: event.venue,
      duration: event.duration,
      startDate: event.startDate,
      endDate: event.endDate,
      round: event.rounds[0],
    };
  });

  return res.json({
    status: 200,
    message: "Success",
    data: events,
  });
};

const getUsers = async (req, res) => {
  try {
    let users = await UserModel.find().populate({
      path: "college",
      model: "College",
    });

    users = users.filter(u => u.type === USER_TYPES.FACULTY_COORDINATOR).map(u => ({
      id: u.id,
      name: u.name,
      type: u.type,
      college: u.college.name + " " + u.college.location,
    }));

    return res.json({
      status: 200,
      message: "Success",
      data: users,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const getSlots = async (req, res, next) => {
  let slots = await SlotModel.find({ round: req.params.round }).populate({
    path: "team",
    model: "Team",
  });
  if (!slots) return next();

  slots = slots.map(slot => ({
    id: slot.id,
    number: slot.number,
    round: slot.round,
    team: slot.team.name,
  }));

  return res.json({
    status: 200,
    message: "Success",
    data: slots,
  });
};

const getRoundLeaderboard = async (req, res, next) => {
  let round = await RoundModel.findOne({
    _id: req.params.round,
    event: req.params.event,
  });

  if (!round) next();

  if(!round.published) next();

  let scores = await ScoreModel.find({
    round: round.id,
  }).populate({
    path: "team",
    model: "Team",
  });

  scores = await Promise.all(scores.map(async score => {
    let team = await TeamModel.findById(score.team);
    let bias = score.overtime > 0 ? 5 * (Math.ceil(score.overtime / 15)) : 0;

    return({
      team: score.team,
      round: score.round,
      judgePoints: score.points,
      points: score.points - bias,
      overtime: team.overtime,
      disqualified: team.disqualified,
    });
  }));
  scores = scores.filter(slot => !slot.disqualified);
  return res.json({
    status: 200,
    message: "Success",
    data: scores,
  });
};

const getEventLeaderboard = async (req, res) => {
  let event = await EventModel.findById(req.params.event);

  if (!event) {
    return res.status(404).json({
      status: 404,
      message: "Not Found. Event doesn't exist.",
    });
  }

  let scores = await ScoreModel.find({
    round: { $in: event.rounds },
  }).populate({
    path: "team",
    model: "Team",
  });

  scores = scores.map(score => {
    let bias = score.overtime > 0 ? 5 * (Math.ceil(score.overtime / 15)) : 0;

    return {
      round: score.round,
      team: score.team,
      overtime: score.overtime,
      points: {
        judge: score.points,
        final: score.points - bias,
      },
    };
  });

  let leaderboard = {};
  for (let score of scores) {
    if (!leaderboard.hasOwnProperty(score.team.id)) {
      leaderboard[score.team.id] = {
        team: score.team,
        points: score.points,
      };
    } else {
      leaderboard[score.team.id] = {
        ...leaderboard[score.team.id],
        points: {
          judge: leaderboard[score.team.id].points.judge + score.points.judge,
          final: leaderboard[score.team.id].points.final + score.points.final,
        },
      };
    }
  }

  return res.json({
    status: 200,
    message: "Success",
    data: Object.values(leaderboard),
  });
};

module.exports = {
  getEvents,
  getUsers,
  getSlots,
  getRoundLeaderboard,
  getEventLeaderboard,
};

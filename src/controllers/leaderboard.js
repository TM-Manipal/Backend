"use strict";

const LeaderboardModel = require("../models/Leaderboard");
const EventModel = require("../models/Event");
const ScoreModel = require("../models/Score");
const TeamModel = require("../models/Team");

const get = async (req, res) => {
  let events = await EventModel.find({ faculty: false });

  let disqulifiedTeams = await TeamModel.find({ disqualified: true });
  disqulifiedTeams = disqulifiedTeams.map(team => team._id.toString());

  let overallLeaderboard = [];
  for (let event of events) {
    let scores = await ScoreModel.find({
      round: { $in: event.rounds },
    });

    scores = scores.filter(score => !disqulifiedTeams.includes(score.team.toString()));
    scores = scores.map(score => ({
      team: score.team,
      points: score.points - (score.overtime > 0 ? 5 * (Math.ceil(score.overtime / 15)) : 0),
    }));

    let mappedScores = scores.reduce((acc, curr) => {
      let points = acc.get(curr.team) || 0;
      acc.set(curr.team, curr.points + points);
      return acc;
    }, new Map());

    let leaderboard = [ ...mappedScores ].map(([ team, points ]) => ({ team, points }));
    leaderboard = leaderboard.sort((a, b) => parseFloat(b.points) - parseFloat(a.points));
    leaderboard = leaderboard.map(lb => ({
      ...lb,
      rank: Array.from(new Set(leaderboard.map(team => team.points))).indexOf(lb.points) + 1,
    }));
    leaderboard = leaderboard.filter(lb => [ 1, 2, 3 ].includes(lb.rank));

    overallLeaderboard = overallLeaderboard.concat(leaderboard);
  }

  let finalLeaderboard = {};
  for (let score of overallLeaderboard) {
    let team = await TeamModel.findById(score.team).populate({
      path: "event",
      model: "Event",
    });

    if (team.disqualified) continue;

    if (finalLeaderboard.hasOwnProperty(team.college)) {
      if (team.event.maxMembersPerTeam === 1) {
        // For individual events
        finalLeaderboard[team.college] += score.rank === 1 ? 10 : score.rank === 2 ? 8 : 6;
      } else {
        // For group events
        finalLeaderboard[team.college] += score.rank === 1 ? 14 : score.rank === 2 ? 10 : 8;
      }
    } else {
      if (team.event.maxMembersPerTeam === 1) {
        // For individual events
        finalLeaderboard[team.college] = score.rank === 1 ? 10 : score.rank === 2 ? 8 : 6;
      } else {
        // For group events
        finalLeaderboard[team.college] = score.rank === 1 ? 14 : score.rank === 2 ? 10 : 8;
      }
    }
  }

  let leaderboard = [];
  for (let college of Object.keys(finalLeaderboard)) {

    leaderboard.push({
      college: college,
      points: finalLeaderboard[college],
    });
  }

  return res.json({
    status: 200,
    message: "Success",
    data: leaderboard,
  });
};

/**
 * Returns the leaderboard
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns {object} the response object
 */
const getPublic = async (req, res) => {
  try {
    let leaderboard = await LeaderboardModel.find().populate({
      path: "college",
      model: "College",
    });

    leaderboard = leaderboard.map(lb => ({
      college: lb.college,
      points: lb.points,
    }));

    return res.json({
      status: 200,
      message: "Success",
      data: leaderboard,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const getWinners = async (req, res) => {
  let events = await EventModel.find({ faculty: false });

  let disqulifiedTeams = await TeamModel.find({ disqualified: true });
  disqulifiedTeams = disqulifiedTeams.map(team => team._id.toString());

  let overallLeaderboard = [];
  for (let event of events) {
    let scores = await ScoreModel.find({
      round: { $in: event.rounds },
    });

    scores = scores.filter(score => !disqulifiedTeams.includes(score.team.toString()));
    scores = scores.map(score => ({
      team: score.team,
      points: score.points - (score.overtime > 0 ? 5 * (Math.ceil(score.overtime / 15)) : 0),
    }));

    let mappedScores = scores.reduce((acc, curr) => {
      let points = acc.get(curr.team) || 0;
      acc.set(curr.team, curr.points + points);
      return acc;
    }, new Map());

    let leaderboard = [ ...mappedScores ].map(([ team, points ]) => ({ team, points }));
    leaderboard = leaderboard.sort((a, b) => parseFloat(b.points) - parseFloat(a.points));
    leaderboard = leaderboard.map(lb => ({
      ...lb,
      rank: Array.from(new Set(leaderboard.map(team => team.points))).indexOf(lb.points) + 1,
    }));
    leaderboard = leaderboard.filter(lb => [ 1, 2, 3 ].includes(lb.rank));

    overallLeaderboard = overallLeaderboard.concat(leaderboard);
  }

  for (let score of overallLeaderboard) {
    let team = await TeamModel.findById(score.team).populate({
      path: "members",
      model: "Participant",
    }).populate({
      path: "event",
      model: "Event",
    }).populate({
      path: "college",
      model: "College",
    });

    if (team.disqualified) continue;

    score.team = team;
  }

  return res.json({
    status: 200,
    message: "Success",
    data: overallLeaderboard,
  });
};

/**
 * Create the leaderboard with initial scores
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns {object} the response object
 */
const init = async (req, res) => {
  try {
    let colleges = await CollegeModel.find();

    colleges = colleges.map(college => college.id);

    let leaderboard = colleges.map(college => ({
      college: college,
      points: 0,
    }));

    await LeaderboardModel.create(leaderboard);

    return res.json({
      status: 200,
      message: "Success",
      data: leaderboard,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Modify the leaderboard with updated scores
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns {object} the response object
 */
const update = async (req, res) => {
  try {
    if (!req.body.points) {
      return res.status(400).json({
        status: 400,
        message: "Bad request. Invalid request body.",
      });
    }

    let collegeLeaderboard = await LeaderboardModel.findOne({ college: req.params.college });

    collegeLeaderboard.points = req.body.points;

    await collegeLeaderboard.save();

    return res.json({
      status: 200,
      message: "Success. Points updated.",
      data: {
        college: collegeLeaderboard.college,
        points: collegeLeaderboard.points,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const publish = async (req, res) => {
  try {
    if (!req.body.length) {
      return res.status(400).json({
        status: 400,
        message: "Bad request. Invalid request body.",
      });
    }

    await LeaderboardModel.remove();
    let leaderboard = await LeaderboardModel.create(req.body);

    return res.json({
      status: 200,
      message: "Success. Leaderboard published.",
      data: leaderboard,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  get,
  getPublic,
  getWinners,
  init,
  publish,
  update,
};

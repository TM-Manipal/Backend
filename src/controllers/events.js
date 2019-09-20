"use strict";

const EventModel = require("../models/Event");
const RoundModel = require("../models/Round");
const ScoreModel = require("../models/Score");
const TeamModel = require("../models/Team");
const ParticipantModel = require("../models/Participant");
const { ROUND_STATUS } = require("../utils/constants");

const createTeam = async (req, res) => {
  let {
    college,
    participants,
  } = req.body;

  let { event } = req.params;

  // Check if participation limit reached
  let participatedTeams = await TeamModel.find({ college: college, event: event });
  let eventInfo = await EventModel.findById(event);

  if (participatedTeams.length === eventInfo.maxTeamsPerCollege) {
    return res.json({
      status: 416,
      message: "Max participation limit reached for college",
    });
  }

  if(participants.length < eventInfo.minMembersPerTeam) {
    return res.json({
      status: 416,
      message: "Number of participants must be " + eventInfo.minMembersPerTeam,
    })
  }

  if (participants.length > eventInfo.maxMembersPerTeam ) {
    return res.json({
      status: 416,
      message: "Number of particpants exceeds max particpants for event",
    });
  }

  addBulkParticipants(participants, college).
    then(async members => {
      let team = new TeamModel({
        event,
        college,
        members
      });

      await team.save(async (err) => {
        if (err) {
          return res.json({
            status: 500,
            message: "Internal Server Error",
          });
        }

        // Add team to round 1
        // TODO: Check if round exists in event
        let round1 = await RoundModel.findById(eventInfo.rounds[0]);
        round1.teams.push(team.id);
        await round1.save();

        return res.json({
          status: 200,
          message: "Team Created",
          data: team,
        });
      });
    }).
    catch(e => {
      // eslint-disable-next-line no-console
      console.poo(e);

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    });
};

const deleteTeam = async (req, res) => {
  try {
    let team = await TeamModel.findOne({
      _id: req.params.team,
      event: req.params.event,
    });

    if (!team) {
      return res.status(404).json({
        status: 400,
        message: "Not Found. Team doesn't exist.",
      });
    }

    let members = team.members;

    await TeamModel.findByIdAndDelete(team.id);

    for (let member of members) {
      await ParticipantModel.findByIdAndDelete(member);
    }

    return res.json({
      status: 200,
      message: "Success. Deleted team.",
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};


const createRound = async (req, res, next) => {
  let event = await EventModel.findById(req.params.event);

  if (!event) next();

  let roundDocument = new RoundModel({
    event: event.id,
    teams: [],
    criteria: req.body.criteria,
    slottable: req.body.slottable,
    status: ROUND_STATUS.SCHEDULED,
  });

  await roundDocument.save().
    then(async round => {
      event.rounds.push(round.id);
      await event.save();

      return res.json({
        status: 200,
        message: "New round created",
        data: {
          id: round.id,
          event: req.params.event,
          teams: [],
          criteria: round.criteria,
          slottable: round.slottable,
        },
      });
    }).
    catch((e) => {
      // eslint-disable-next-line no-console
      console.poo(e);

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    });
};

const updateRound = async (req, res, next) => {
  let event = await EventModel.findById(req.params.event);

  if (!event) next();

  let roundDocument = await  RoundModel.findById(req.params.round);
  roundDocument.criteria = req.body.criteria;
  roundDocument.slottable = req.body.slottable;

  await roundDocument.save().
    then(async round => {
      event.rounds.push(round.id);
      await event.save();

      return res.json({
        status: 200,
        message: "Round updated",
        data: {
          id: round.id,
          event: req.params.event,
          teams: [],
          criteria: round.criteria,
          slottable: round.slottable,
        },
      });
    }).
    catch((e) => {
      // eslint-disable-next-line no-console
      console.poo(e);

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    });
};

const deleteRound = async (req, res, next) => {
  try {
    let event = await EventModel.findById(req.params.event);

    if (!event) return next();

    // TODO: If round doesn't exist in the event
    // This doesn't work. Why??
    // if (!event.rounds.includes(req.params.round)) return next();

    // Delete round
    let round = await RoundModel.findByIdAndDelete(req.params.round);

    // Remove reference to round from the event.
    event.rounds.splice(event.rounds.indexOf(req.params.round), 1);

    await event.save();

    return res.json({
      status: 200,
      message: "Success. Round deleted.",
      data: round,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const createScore = async (req, res, next) => {
  let round = await RoundModel.findOne({
    _id: req.params.round,
    event: req.params.event,
  });

  if (!round) next();

  if (!round.teams.includes(req.params.team)) next();

  let score = await ScoreModel.findOne({
    team: req.params.event,
    round: req.params.round,
  });

  if (score) {
    score.judges.concat(req.body.judges);
    await score.save();
  } else {
    score = await ScoreModel.create({
      team: req.params.team,
      round: req.params.round,
      judges: req.body.judges,
    });
  }

  return res.json({
    status: 200,
    message: "Success",
    data: score,
  });
};

const createScores = async (req, res, next) => {
  let round = await RoundModel.findOne({
    _id: req.params.round,
    event: req.params.event,
  });
  if (!round) return next();

  // TODO: This doesn't work. Why??
  // for (let score of req.body) {
  //   if (!round.teams.includes(score.team)) return next();
  // }

  let scores = await ScoreModel.find({
    round: req.params.round,
  });
  if (scores.length) {
    // HACK: Improve this
    for (let score of req.body) {
      let teamScore = await ScoreModel.findOne({
        team: score.team,
        round: score.round,
      });
      teamScore.judges = teamScore.judges.concat(score.judges);

      await teamScore.save();
    }
  } else {
    scores = await ScoreModel.create(req.body);
  }

  return res.json({
    status: 200,
    message: "Success",
    data: scores,
  });
};

const updateTeamScores = async (req, res) => {
  if (!req.body) req.body = [];

  if (req.body.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request",
    });
  }

  for (let team of req.body) {
    let teamDoc = await TeamModel.findOne({
      _id: team.id,
      event: req.params.event,
    });
    if (teamDoc) {
      teamDoc.disqualified = team.disqualified;
      await teamDoc.save();
    }

    let scoreDoc = await ScoreModel.findOne({
      team: team.id,
      round: req.params.round,
    });
    if (scoreDoc) {
      scoreDoc.overtime = team.overtime;
      await scoreDoc.save();
    }
  }

  return res.json({
    status: 200,
    message: "Success",
    data: {
      event: req.params.event,
      round: req.params.round,
      teams: req.body,
    },
  });
};

const createSlots = async (req, res) => {
  let teams = await TeamModel.find({
    event: req.params.event,
  });
  if (!teams) teams = [];

  let teamNames = teams.map(team => team.name);
  // TODO: Use team names
  teams = teams.map(team => team.id);

  // Slotting
  let slots = [];
  let noOfTeams = teams.length;
  for (let i = 0; i < noOfTeams; i++) {
    let index = Math.floor(Math.random() * teams.length);
    let team_id = teams[index];
    let team_name = teamNames[index];

    await SlotModel.create({
      number: i + 1,
      round: req.params.round,
      team: team_id,
      teamName: team_name,
    });
    slots.push({ id:team_id, name: team_name, number: i + 1 });
    teams.splice(teams.indexOf(team_id), 1);
    teamNames.splice(teamNames.indexOf(team_name), 1);
  }

  return res.json({
    status: 200,
    message: "Success",
    data: slots,
  });
};


const get = async (req, res, next) => {
  let event = await EventModel.findById(req.params.event);

  if (!event) return next();

  return res.json({
    status: 200,
    message: "Success",
    data: {
      id: event.id,
      name: event.name,
      description: event.description,
      rounds: event.rounds,
      teams: event.teams,
      minMembersPerTeam: event.minMembersPerTeam,
      maxMembersPerTeam: event.maxMembersPerTeam,
      maxTeamsPerCollege: event.maxTeamsPerCollege,
      venue: event.venue,
      duration: event.duration,
      startDate: event.startDate,
      endDate: event.endDate,
    },
  });
};

const getAll = async (req, res) => {
  let events = await EventModel.find().populate({
    path: "rounds",
    model: "Round",
  });

  events = events.map(event => {
    let roundId = event.rounds.map(round => round.id);
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      rounds: roundId,
      teams: event.teams,
      minMembersPerTeam: event.minMembersPerTeam,
      maxMembersPerTeam: event.maxMembersPerTeam,
      maxTeamsPerCollege: event.maxTeamsPerCollege,
      venue: event.venue,
      duration: event.duration,
      startDate: event.startDate,
      endDate: event.endDate,
    };
  });

  return res.json({
    status: 200,
    message: "Success",
    data: events,
  });
};

const getLeaderboard = async (req, res, next) => {
  let event = await EventModel.findById(req.params.event);

  if (!event) next();

  let scores = await ScoreModel.find({
    round: { $in: event.rounds },
  });

  scores = scores.map(score => ({
    team: score.team,
    points: {
      original: score.points,
      final: score.points - (score.overtime > 0 ? 5 * (Math.ceil(score.overtime / 15)) : 0),
    },
  }));

  let mappedScores = scores.reduce((acc, curr) => {
    let points = acc.get(curr.team) || { original: 0, final: 0 };
    acc.set(curr.team, {
      original: curr.points.original + points.original,
      final: curr.points.final + points.final,
    });
    return acc;
  }, new Map());

  let cumulatedScores = [ ...mappedScores ].map(([ team, score ]) => ({ team, score }));

  return res.json({
    status: 200,
    message: "Success",
    data: cumulatedScores,
  });
};

const getRoundLeaderboard = async (req, res, next) => {
  let round = await RoundModel.findOne({
    _id: req.params.round,
    event: req.params.event,
  });

  if (!round) next();

  let scores = await ScoreModel.find({
    round: round.id,
  }).populate({
    path: "team",
    model: "Team",
  });

  scores = scores.map(score => {
    let bias = score.overtime > 0 ? 5 * (Math.ceil(score.overtime / 15)) : 0;

    return {
      team: score.team,
      round: score.round,
      judgePoints: score.points,
      points: score.points - bias,
      overtime: score.overtime,
      disqualified: score.team.disqualified,
    };
  });

  return res.json({
    status: 200,
    message: "Success",
    data: scores,
  });
};

// IT WAS ALREADY THERE AND I WROTE IT AGAIN!
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

const getRound = async (req, res, next) => {

  let round = await RoundModel.findOne({
    _id: req.params.round,
    event: req.params.event,
  });

  if (!round) next();

  return res.json({
    status: 200,
    message: "Success",
    data: {
      id: round.id,
      event: round.event,
      criteria: round.criteria,
      published: round.published,
      teams: round.teams,
      duration: round.duration,
      slottable: round.slottable,
      status: round.status,
    },
  });
};

const getRounds = async (req, res) => {
  let rounds = await RoundModel.find({ event: req.params.event });

  if (!rounds) rounds = [];

  rounds = rounds.map(round => ({
    id: round.id,
    event: round.event,
    teams: round.teams,
    published: round.published,
    duration: round.duration,
    slottable: round.slottable,
    status: round.status,
  }));

  return res.json({
    status: 200,
    message: "Success",
    data: rounds,
  });
};

const getTeam = async (req, res, next) => {
  let team = await TeamModel.findOne({
    _id: req.params.team,
    event: req.params.event,
  });

  if (!team) next();

  return res.json({
    status: 200,
    message: "Success",
    data: {
      id: team.id,
      name:team.name,
      event: team.event,
      college: team.college,
      members: team.members,
      disqualified: team.disqualified,
    },
  });
};

const getTeams = async (req, res) => {
  let teams = await TeamModel.find({ event: req.params.event });

  if (!teams) teams = [];

  teams = teams.map(team => ({
    id: team.id,
    event: team.event,
    college: team.college,
    members: team.members,
    name: team.name,
    disqualified: team.disqualified,
  }));

  return res.json({
    status: 200,
    message: "Success",
    data: teams,
  });
};

const getTeamsInRound = async (req, res) => {
  let round = await RoundModel.findOne({
    _id: req.params.round,
    event: req.params.event,
  }).populate({
    path: "teams",
    model: "Team",
  });

  let teams = round.teams.map(team => ({
    id: team.id,
    event: team.event,
    college: team.college,
    name:team.name,
    members: team.members,
    disqualified: team.disqualified,
  }));

  return res.json({
    status: 200,
    message: "Success",
    data: teams,
  });
};

const create = async (req, res) => {
  let {
    name,
    minMembersPerTeam,
    maxMembersPerTeam,
    venue,
    description,
    duration,
    startDate,
    endDate,
    } = req.body;

  let event = new EventModel({
    name,
    minMembersPerTeam,
    maxMembersPerTeam,
    venue,
    description,
    duration,
    startDate,
    endDate,
  });

  await event.save().
    then(event => {
      return res.json({
        status: 200,
        message: "New event created",
        data: {
          id: event.id,
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
        },
      });
    }).
    catch((e) => {
      // eslint-disable-next-line no-console
      console.poo(e);

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    });
};

const edit = async (req, res) => {
  let {
    name,
    college,
    teams,
    minMembersPerTeam,
    maxMembersPerTeam,
    maxTeamsPerCollege,
    venue,
    description,
    duration,
    startDate,
    endDate,
    slottable,
    criteria,
  } = req.body;

  let event = await EventModel.findById(req.params.event);

  event.name = name ? name : event.name;
  event.college = college ? college : event.college;
  event.teams = teams ? teams : event.teams;
  event.minMembersPerTeam = minMembersPerTeam ? minMembersPerTeam : event.minMembersPerTeam;
  event.maxMembersPerTeam = maxMembersPerTeam ? maxMembersPerTeam : event.maxMembersPerTeam;
  event.maxTeamsPerCollege = maxTeamsPerCollege ? maxTeamsPerCollege : event.maxTeamsPerCollege;
  event.venue = venue ? venue : event.venue;
  event.description = description ? description : event.description;
  event.duration = duration ? duration : event.duration;
  event.startDate = startDate ? startDate : event.startDate;
  event.endDate = endDate ? endDate : event.endDate;
  event.slottable = !!slottable;

  if (criteria) {
    if (event.rounds && event.rounds.length) {
      for (let round of event.rounds) {
        let roundDoc = await RoundModel.findById(round);
        roundDoc.criteria = criteria;

        // eslint-disable-next-line no-console
        await roundDoc.save();
      }
    }
  }

  await event.save().
    then(event => {
      return res.json({
        status: 200,
        message: "Success. Event Updated",
        data: {
          id: event.id,
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
        },
      });
    }).
    catch((e) => {
      // eslint-disable-next-line no-console
      console.poo(e);

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    });
};

/**
 * Insert Participants in bulk.
 * @param {object} data The request object
 * @param {string} college The college id
 * @returns {Array} The members id
 */
const addBulkParticipants = (data, college) => {

  // TODO: check if student particpant registered for faculty event and vice versa

  return new Promise(async (resolve, reject) => {
    try {
      let members = [];
      await data.map(each => {
        let participant = new ParticipantModel({
          name: each.name,
          college: college,
          mobile: each.mobile,
          email: each.email,
        });
        members.push(participant._id);
        participant.save(err => {
          if(err) {
            throw err;
          }
        });
      });
      resolve(members);
    } catch (err) {
      reject(err);
    }
  });
};

const publishRoundLeaderboard = async (req, res) => {
  let round = await RoundModel.findById(req.params.round);

  if (!round) {
    return res.status(404).json({
      status: 404,
      message: "Round Not Found",
    });
  }

  round.published = true;
  await round.save();

  return res.json({
    status: 200,
    message: "Success",
    data: round,
  });
};

module.exports = {
  deleteTeam,
  deleteRound,
  createRound,
  createScore,
  createScores,
  get,
  getAll,
  getRound,
  getLeaderboard,
  getRoundLeaderboard,
  getEventLeaderboard,
  getRounds,
  getTeam,
  getTeams,
  getTeamsInRound,
  create,
  edit,
  createTeam,
  updateRound,
  updateTeamScores,
  publishRoundLeaderboard,
};

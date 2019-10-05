"use strict";

const EventModel = require("../models/Event");
const TeamModel = require("../models/Team");
const ParticipantModel = require("../models/Participant");
const { ROUND_STATUS } = require("../utils/constants");

const createTeam = async (req, res) => {
  let {
    college,
    participants,
  } = req.body;

  // Check if participation limit reached
  let participatedTeams = await TeamModel.find({ college: college});

  if (participatedTeams.length >= 1) {
    return res.json({
      status: 416,
      message: "College already registered",
    });
  }

  addBulkParticipants(participants, college).
    then(async members => {
      let team = new TeamModel({
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

        
        return res.json({
          status: 200,
          message: "Registration successfull",
          data: team,
        });
      });
    }).
    catch(e => {
      // eslint-disable-next-line no-console
      console.poo(e);

      if(e=="Incomplete form") {
        return res.status(401).json({
        status: 401,
        message: "Please complete the form as per the instructions",
      });
      }

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
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
      type: event.type,
      description: event.description,
      teams: event.teams,
      minMembersPerTeam: event.minMembersPerTeam,
      maxMembersPerTeam: event.maxMembersPerTeam,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      eventHeads: event.eventHeads,
      rules: event.rules,
      venue: event.venue
    },
  });
};

const getAll = async (req, res) => {
  let events = await EventModel.find();

  events = events.map(event => {
    return {
      id: event.id,
      name: event.name,
      type: event.type,
      description: event.description,
      teams: event.teams,
      minMembersPerTeam: event.minMembersPerTeam,
      maxMembersPerTeam: event.maxMembersPerTeam,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      eventHeads: event.eventHeads,
      rules: event.rules,
      venue: event.venue
    };
  });

  return res.json({
    status: 200,
    message: "Success",
    data: events,
  });
};



const create = async (req, res) => {
  let {
    name,
    type,
    minMembersPerTeam,
    maxMembersPerTeam,
    description,
    startDate,
    endDate,
    eventHeads,
    rules,
    venue,
    } = req.body;

  let event = new EventModel({
    name,
    type,
    minMembersPerTeam,
    maxMembersPerTeam,
    description,
    startDate,
    endDate,
    eventHeads,
    rules,
    venue,
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
          eventHeads: event.eventHeads,
          rules: event.rules,
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
        if(!each.mobile | !each.email | !each.gender | !each.name) {
          throw("Incomplete form");
        }
        let participant = new ParticipantModel({
          name: each.name,
          mobile: each.mobile.replace(/\D/g, '').slice(-10),
          email: each.email,
          gender: each.gender,
          accommodation: each.accommodation
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

module.exports = {
  get,
  getAll,
  create,
  createTeam,
};

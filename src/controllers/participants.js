"use strict";

const ParticipantModel = require("../models/Participant");

const get = async (req, res) => {
  try {
    let participant = await ParticipantModel.findById(req.params.participant);

    if (!participant) {
      return res.status(404).json({
        status: 404,
        message: "Not Found. No participant was found for the given ID.",
      });
    }

    return res.json({
      status: 200,
      message: "Success",
      data: participant,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const getAll = async (req, res) => {
  try {
    let participants = await ParticipantModel.find();

    return res.json({
      status: 200,
      message: "Success",
      data: participants,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const update = async (req, res) => {
  try {
    let participant = await ParticipantModel.findById(req.params.participant);

    if (!participant) {
      return res.status(404).json({
        status: 404,
        message: "Not Found. No participant was found for the given ID.",
      });
    }

    if (req.body.name) participant.name = req.body.name;
    if (req.body.registrationID) participant.registrationID = req.body.registrationID;

    await participant.save();

    return res.json({
      status: 200,
      message: "Success",
      data: participant,
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
  getAll,
  update,
};

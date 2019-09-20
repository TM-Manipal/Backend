const mongoose = require("mongoose");

const schema = {
  rounds: [ mongoose.Schema.Types.ObjectId ],
  name: {
    type: String,
    required: true,
  },
  minMembersPerTeam: {
    type: Number,
    required: true,
    default: 1,
  },
  maxMembersPerTeam: Number,
  maxTeamsPerCollege: {
    type: Number,
    default: 1,
  },
  venue: String,
  description: String,
  duration: Number,
  startDate: Date,
  endDate: Date,
};

const options = {
  autoCreate: true,
};

const eventSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Event", eventSchema);
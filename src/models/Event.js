const mongoose = require("mongoose");

const schema = {
  name: {
    type: String,
    required: true,
  },
  type: {
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
  startDate: Date,
  endDate: Date,
  rules: {
    type: [String],
    required: true,
  },
  eventHeads: [{name: String,contact: String}],
};

const options = {
  autoCreate: true,
};

const eventSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Event", eventSchema);
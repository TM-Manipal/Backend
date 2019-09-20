const mongoose = require("mongoose");

const schema = {
  teams: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
};

const options = {
  autoCreate: true,
};

const leaderboardSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);

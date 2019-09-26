const mongoose = require("mongoose");

const schema = {
  college: {
    type: String,
    required: true,
  },
  members: [ mongoose.Schema.Types.ObjectId ],
  disqualified: {
    type: Boolean,
    required: true,
    default: false,
  },
};

const options = {
  autoCreate: true,
};

const teamSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Team", teamSchema);

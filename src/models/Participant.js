const mongoose = require("mongoose");

const schema = {
  name: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  }
};

const options = {
  autoCreate: true,
};

const participantSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Participant", participantSchema);

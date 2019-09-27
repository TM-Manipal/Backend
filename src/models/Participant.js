const mongoose = require("mongoose");

const schema = {
  name: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  email: {
    type: String,
  },
  gender: {
    type: String,
  },
  accommodation: {
    type: Boolean,
  }
};

const options = {
  autoCreate: true,
};

const participantSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Participant", participantSchema);

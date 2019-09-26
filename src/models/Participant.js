const mongoose = require("mongoose");

const schema = {
  name: {
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
  },
  gender: {
    type: String,
    required: true,
  },
  needAccommodation: {
    type: Boolean,
    required: true,
  }
};

const options = {
  autoCreate: true,
};

const participantSchema = new mongoose.Schema(schema, options);

module.exports = mongoose.model("Participant", participantSchema);

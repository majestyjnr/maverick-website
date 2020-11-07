const mongoose = require("mongoose");
const { model } = require("mongoose");

const TeamSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: true,
  },
  memberPosition: {
    type: String,
    required: true,
  },
  memberName: {
    type: String,
    required: true,
  },
  memberPositionCategory: {
    type: String,
    required: true,
  },
  memberTelephone: {
    type: String,
    required: true,
  },
  memberEmail: {
    type: String,
    required: true,
  },
  memberImage: {
    type: String,
    required: true,
  },
  memberDescription: {
    type: String,
    required: true,
  },
  memberPartner: {
    type: String,
    required: true,
  },
});

const TeamMember = mongoose.model("team_member", TeamSchema);
module.exports = TeamMember;

const mongoose = require("mongoose");

const PodcastSchema = mongoose.Schema({
  podcastTitle: {
    type: String,
    required: true,
  },
  podcastAuthor: {
    type: String,
    required: true,
  },
  podcastImage: {
    type: String,
    required: true,
  },
  podcastFile: {
    type: String,
    required: true,
  },
  podcastDescription: {
    type: String,
    required: true,
  },
  podcastTags: {
    type: Array,
    required: true,
  },
  postedBy: {
    type: String,
    required: true,
  },
  timeUploaded: {
    type: String,
    required: true,
  },
});

const Podcast = mongoose.model("podcast", PodcastSchema);
module.exports = Podcast;

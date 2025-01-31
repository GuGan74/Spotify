




const mongoose = require("mongoose");
const Joi = require("joi");

const songSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  song: { type: String, required: true }, // Cloudinary URL for the audio file
  img: { type: String, required: false, default: "" }, // Cloudinary URL for the image file
  duration: { type: String, required: false, default: "0" }, // Optional duration as string
});

// Validation function using Joi
const validate = (song) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    artist: Joi.string().required(),
    song: Joi.string(), // This will be set automatically by Cloudinary
    img: Joi.string().optional(), // Optional Cloudinary image
    duration: Joi.string().optional(), // Optional duration
  });
  return schema.validate(song);
};

// Mongoose model
const Song = mongoose.model("Song", songSchema);

module.exports = { Song, validate };

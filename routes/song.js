const router = require("express").Router();
const { Song, validate } = require("../models/song");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const upload = require("../cloudinary"); // Import Cloudinary middleware

// Create song with Cloudinary audio upload
router.post("/", [admin, upload.single("audio")], async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    console.log("Uploaded File:", req.file); // Log the uploaded file

    // Validate the incoming request body
    const { error } = validate(req.body);
    if (error) {
      console.error("Validation Error:", error.details[0].message);
      return res.status(400).send({ message: error.details[0].message });
    }

    // Check if an audio file was uploaded
    if (!req.file || !req.file.path) {
      console.error("No file uploaded");
      return res.status(400).send({ message: "Audio file is required" });
    }

    // Create and save the song document
    const song = new Song({
      name: req.body.name,
      artist: req.body.artist,
      song: req.file.path, // Cloudinary URL
      img: req.body.img, // Optional image
      duration: req.body.duration, // Optional duration
    });

    await song.save();
    console.log("Song Created:", song);
    res.status(201).send({ data: song, message: "Song created successfully" });
  } catch (err) {
    console.error("Error creating song:", err); // Log the full error
    res.status(500).send({ message: "Internal Server Error", error: err.message });
  }
});

// Get all songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find();
    console.log("Fetched Songs:", songs);
    res.status(200).send({ data: songs });
  } catch (err) {
    console.error("Error fetching songs:", err);
    res.status(500).send({ message: "Failed to fetch songs" });
  }
});

// Update song
router.put("/:id", [validateObjectId, admin], async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) {
      console.error("Song not found");
      return res.status(404).send({ message: "Song not found" });
    }

    console.log("Updated Song:", song);
    res.status(200).send({ data: song, message: "Updated song successfully" });
  } catch (err) {
    console.error("Error updating song:", err);
    res.status(500).send({ message: "Failed to update song" });
  }
});

// Delete song by ID
router.delete("/:id", [validateObjectId, admin], async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      console.error("Song not found for deletion");
      return res.status(404).send({ message: "Song not found" });
    }

    console.log("Deleted Song:", song);
    res.status(200).send({ message: "Song deleted successfully" });
  } catch (err) {
    console.error("Error deleting song:", err);
    res.status(500).send({ message: "Failed to delete song" });
  }
});

// Like a song
router.put("/like/:id", [validateObjectId, auth], async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(400).send({ message: "Song does not exist" });

    const user = await User.findById(req.user._id);
    const index = user.likedSongs.indexOf(song._id);

    let resMessage = "";
    if (index === -1) {
      user.likedSongs.push(song._id);
      resMessage = "Added to your liked songs";
    } else {
      user.likedSongs.splice(index, 1);
      resMessage = "Removed from your liked songs";
    }

    await user.save();
    console.log("Updated liked songs for user:", user);
    res.status(200).send({ message: resMessage });
  } catch (err) {
    console.error("Error liking/unliking song:", err);
    res.status(500).send({ message: "Failed to update liked songs" });
  }
});

// Get liked songs
router.get("/like", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songs = await Song.find({ _id: { $in: user.likedSongs } });
    console.log("Liked Songs:", songs);
    res.status(200).send({ data: songs });
  } catch (err) {
    console.error("Error fetching liked songs:", err);
    res.status(500).send({ message: "Failed to fetch liked songs" });
  }
});

module.exports = router;

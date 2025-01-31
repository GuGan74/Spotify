require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors")
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
// const playListRoutes = require("./routes/playlist");

const app = express();
connection();
app.use(cors());
app.use(express.json());



app.use("/api/users/", userRoutes);
app.use("/api/login/", authRoutes);
app.use("/api/songs/", songRoutes);
// app.use("/api/playlist/", playListRoutes);


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

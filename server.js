// ***********Getting the server running***************

const express = require("express");
const app = express();
// Create a server to be used for socket IO
const server = require("http").Server(app);
// Make socket IO interact with the server provided
const io = require("socket.io")(server);
// Generates a random room
const { v4: uuidV4 } = require("uuid");

// Setup the express server to render our views
app.set("view-engine", "ejs");
// Static Folder (public directory for all the JS and CSS)
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// Dynamic route for the rooms
app.get("/:room", (req, res) => {
  res.render("room.ejs", { roomId: req.params.room });
});

// This will run whenever someone connects to the web page
io.on("connection", (socket) => {
  // Set up the joining room event
  socket.on("join-room", (roomId, userId) => {
    // Current socket joins the room provided
    socket.join(roomId);
    // Sends a message to everyone else in the room that a new user connected
    socket.to(roomId).emit("user-connected", userId);
    // Disconnect event
    socket.on("disconnect", () => {
      // Sends a message to everyone else in the room that a new user disconnected
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// Start the server on port 3000
server.listen(process.env.PORT || 3000, "0.0.0.0");

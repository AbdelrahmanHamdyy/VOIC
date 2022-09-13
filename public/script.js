// Get a reference to socket
const socket = io("/");
// Get the video grid element
const videoGrid = document.getElementById("video-grid");
// PeerJS handles the ID connection
// Creates connection between different users using webRTC and a server setup that creates these dynamic IDs
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

// Create our own video
const myVideo = document.createElement("video");
// Mute ourselves
myVideo.muted = true;
// Object that contains all the call peers
const peers = {};

// Connect the video (returns a promise)
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    // Listen to the call event
    myPeer.on("call", (call) => {
      // Answer the call and send them our stream
      call.answer(stream);
      // Create a video element
      const video = document.createElement("video");
      // Respond to any video streams
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // We need to be able to connect to other new users when they join
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// Listen to the disconnect event and close the call
socket.on("user-disconnected", (userId) => {
  peers[userId]?.close();
});

// Call the join room event when the peer server is running
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  // Call a user with the given ID and send our video stream
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  // Listen to the stream event called when the user sends back their video stream and add it to our list of videos
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  // Remove video on the close event
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
};

// Take the video, play it and add it to the grid
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

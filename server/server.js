
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    onlineUsers[socket.id] = username;

    io.emit("online_users", Object.values(onlineUsers));
    console.log(`${username} joined.`);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("user_typing", (data) => {
    socket.broadcast.emit("user_typing", data);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.username);
    delete onlineUsers[socket.id];
    io.emit("online_users", Object.values(onlineUsers));
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});

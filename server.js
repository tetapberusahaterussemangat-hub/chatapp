const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};
let users = {};

io.on("connection", (socket) => {
  console.log("User connect");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);

    users[socket.id] = { username, room };

    if (!rooms[room]) rooms[room] = 0;
    rooms[room]++;

    // kirim ke semua client
    io.emit("roomList", rooms);

    // info join
    io.to(room).emit("message", `${username} masuk ke room`);
  });

  socket.on("chatMessage", (msg) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit("message", `${user.username}: ${msg}`);
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      rooms[user.room]--;

      if (rooms[user.room] <= 0) {
        delete rooms[user.room];
      }

      io.emit("roomList", rooms);
    }
  });
});


server.listen(3000, () => {
  console.log("Server jalan");
});
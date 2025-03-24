import express, { Router } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["content-Type"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 7001;
const router = Router();
app.use("/", router);

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("join-room", ({ room, username }) => {
    console.log(`🚪 ${socket.id} joined room: ${room}`);
    socket.join(room);
    socket.to(room).emit("user-connected", { from: socket.id, username });

    // Handle WebRTC signaling
    socket.on("offer", (offer) => {
      console.log("📡 Received offer:", offer);
      socket.to(room).emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      console.log("📡 Received answer:", answer);
      socket.to(room).emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      console.log("❄️ ICE Candidate received");
      socket.to(room).emit("ice-candidate", candidate);
    });

    // Handle chat messages
    socket.on("send-message", ({ room, message, sender }) => {
      io.to(room).emit("received-message", { sender, message });
    });

    // Handle user leaving manually
    socket.on("leave-room", ({ username, room }) => {
      console.log(`🚪 User ${username} left room ${room}`);
      socket.leave(room);
      socket.to(room).emit("user-disconnected", { username });
    });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    io.emit("user-disconnected", { userId: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running at port ${PORT}`);
});

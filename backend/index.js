import express, { Router } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.use(cors());
const PORT = process.env.PORT || 7001;
const router = Router();
app.use("/", router);

io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);

  socket.on("send-message", (data) => {
    io.emit("received-message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});
router.route("/api/hospitals").get(async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10nn000&type=hospital&key=${apiKey}&&keyword=government+hospital|AIIMS|Mahaveer&type=hospital|university|research_institute`;
    const response = await axios.get(url);

    return res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log("server is running at", PORT);
});

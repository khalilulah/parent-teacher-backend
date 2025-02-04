require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { sendResponse } = require("./utils/utilFunctions");
const { Server } = require("socket.io");
const http = require("http");
const {
  authRoutes,
  userRoutes,
  organizationRoutes,
  chatRoutes,
} = require("./routes");
const Message = require("./models/messageModel");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

// Initialize app
const app = express();
const server = http.createServer(app); // Use HTTP server to integrate with Socket.IO
const io = new Server(server);

// PORT USED
const PORT = process.env.PORT || 8080;

// CORS config
// Define a list of allowed origins
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowedOrigins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// OTHER CONFIGS
app.use(express.json());
app.use(cors(corsOptions));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", chatRoutes);

// API Connection test
app.get("/", (req, res) => {
  res.send("hello world...");
});
app.post("/", (req, res) => {
  res.send("this is a post request!");
});

// Middleware to catch undefined routes
app.use((req, res, next) => {
  sendResponse(
    res,
    404,
    "The requested endpoint does not exist or is undocumented.",
    null
  );
});

// CONNECT TO DB, THEN SERVER
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`DB connection successful, server connected to port ${PORT}`);
  })
  .catch((err) => console.log(err));

// Initialize object
const connectedUsers = {};

// SOCKET.IO Logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Identify and register the user
  socket.on("identify_user", (userId) => {
    connectedUsers[userId] = socket.id; // Map user ID to socket ID
    console.log(`User ${userId} is now online with socket ID: ${socket.id}`);
    socket.emit("user_identified"); // Emit acknowledgment
  });

  // Listen for get users request from clients
  socket.on("get_users", async (userId) => {
    try {
      console.log("User Id:", userId);

      // Get chats from the database
      const chats = await Chat.find({
        participants: { $in: [userId] },
      }).populate("participants");

      // Get the socket ID of the requesting user
      const socketId = connectedUsers[userId];
      if (socketId) {
        io.to(socketId).emit("send_users", chats);
      }

      console.log(connectedUsers);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle room joining
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  // Handle room leaving
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User left room: ${chatId}`);
  });

  // Listen for messages from clients
  socket.on("send_message", async (data) => {
    try {
      let { sender, chatId, message, fileUrl, fileType } = data;

      // Save message to the database
      const newMessage = new Message({
        sender,
        chatId,
        message: message || "",
        fileUrl: fileUrl || "",
        fileType: fileType || "",
      });
      await newMessage.save();

      io.to(chatId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User ${userId} is now offline.`);
        break;
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

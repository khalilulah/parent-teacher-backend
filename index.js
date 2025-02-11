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

      // Fetch all chats where the user is a participant
      const chats = await Chat.find({ participants: { $in: [userId] } })
        .populate("participants")
        .lean();

      for (let chat of chats) {
        // Fetch latest message
        const latestMessage = await Message.findOne({ chatId: chat.chatId })
          .sort({ createdAt: -1 })
          .lean();

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          chatId: chat.chatId,
          status: "delivered",
          sender: { $ne: userId }, // Only count messages not sent by the user
        });

        chat.latestMessage = latestMessage || null;
        chat.unreadCount = unreadCount;
      }

      // **Sort chats by the latest message timestamp (descending order)**
      chats.sort((a, b) => {
        const timeA = a.latestMessage
          ? new Date(a.latestMessage.createdAt).getTime()
          : 0;
        const timeB = b.latestMessage
          ? new Date(b.latestMessage.createdAt).getTime()
          : 0;
        return timeB - timeA; // Sort descending (latest messages first)
      });

      const socketId = connectedUsers[userId];
      if (socketId) {
        io.to(socketId).emit("send_users", chats);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  });

  // Handle room joining
  socket.on("join_chat", async ({ chatId, userId }) => {
    try {
      socket.join(chatId);
      console.log(`User ${userId} joined room: ${chatId}`);

      // Mark all messages from the other user as "read"
      await Message.updateMany(
        { chatId, sender: { $ne: userId }, status: "delivered" },
        { $set: { status: "read" } }
      );

      // Notify the frontend that messages have been read
      io.to(chatId).emit("messages_read", { chatId });
    } catch (error) {
      console.error("Error joining chat:", error);
    }
  });

  // Handle room leaving
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User left room: ${chatId}`);
  });

  // Listen for messages from clients
  socket.on("send_message", async (data) => {
    try {
      let { sender, chatId, message, fileUrl, fileType, fileName, fileSize } =
        data;

      console.log(data);

      // Save message to the database
      const newMessage = new Message({
        sender,
        chatId,
        message: message || "",
        fileUrl,
        fileType,
        fileName,
        fileSize,
        status: "delivered",
      });

      await newMessage.save();

      io.to(chatId).emit("receive_message", newMessage);

      // Notify the receiver if online
      if (connectedUsers[data.receiver]) {
        io.to(connectedUsers[data.receiver]).emit(
          "message_delivered",
          newMessage._id
        );
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Mark message as read
  socket.on("message_read", async (messageId) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "read" });
      io.emit("message_status_update", { messageId, status: "read" });
    } catch (err) {
      console.error("Error updating message status:", err);
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

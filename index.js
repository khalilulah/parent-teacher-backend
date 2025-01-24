require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { sendResponse } = require("./utils/utilFunctions");
const { authRoutes, userRoutes, organizationRoutes } = require("./routes");

// Initialize app
const app = express();

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
    app.listen(PORT, () => {
      console.log(`DB connection successful, server connected to port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

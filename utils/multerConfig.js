// middlewares/upload.js
const multer = require("multer");

// Store file in memory (RAM), not disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;

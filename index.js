const express = require("express");
const connectDB = require("./database/db");
const reminderJob = require("./scripts/scheduler");
const sendEmail = require("./utils/sendEmail");

require("dotenv").config();

const app = express();
connectDB();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

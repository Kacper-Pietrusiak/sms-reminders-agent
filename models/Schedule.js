const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Odniesienie do Student
  date: { type: Date, required: true },
  isNotified: { type: Boolean, default: false }, // Flaga, czy powiadomienie zostało wysłane
});

module.exports = mongoose.model("Schedule", ScheduleSchema);

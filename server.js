require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { addEvent } = require("./utils/googleCalendar");
const Student = require("./models/Student");
const Schedule = require("./models/Schedule");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Połączenie z MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => console.error("Błąd połączenia z MongoDB:", err));

// Endpointy

// Dodaj nowego ucznia
app.post("/students", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane." });
  }

  try {
    const student = new Student({ name, email, phone });
    await student.save();
    res.status(201).json({ message: "Uczeń został dodany.", student });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Błąd podczas dodawania ucznia.", error: err.message });
  }
});

// Pobierz listę uczniów
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Błąd podczas pobierania uczniów.",
        error: err.message,
      });
  }
});

// Dodaj nowe zajęcia
app.post("/schedules", async (req, res) => {
  const { studentId, date } = req.body;

  if (!studentId || !date) {
    return res
      .status(400)
      .json({ message: "ID ucznia i data zajęć są wymagane." });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Uczeń nie istnieje." });
    }

    const schedule = new Schedule({ studentId, date, isNotified: false });
    await schedule.save();

    // Dodaj wydarzenie do Kalendarza Google
    const event = {
      summary: `Korepetycje z ${student.name}`,
      description: `Zajęcia z uczniem ${student.name}`,
      start: {
        dateTime: new Date(date).toISOString(),
        timeZone: "Europe/Warsaw",
      },
      end: {
        dateTime: new Date(
          new Date(date).getTime() + 60 * 60 * 1000
        ).toISOString(), // Domyślnie 1 godzina
        timeZone: "Europe/Warsaw",
      },
      attendees: [{ email: student.email }],
    };

    await addEvent(event);

    res
      .status(201)
      .json({
        message: "Zajęcia zostały dodane i zapisane w Kalendarzu Google.",
        schedule,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Błąd podczas dodawania zajęć.", error: err.message });
  }
});

// Pobierz listę zajęć
app.get("/schedules", async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("studentId");
    res.status(200).json(schedules);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania zajęć.", error: err.message });
  }
});

// Uruchom serwer
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

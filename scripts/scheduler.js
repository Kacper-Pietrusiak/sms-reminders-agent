const schedule = require("node-schedule");
const Schedule = require("../models/Schedule");
const Student = require("../models/Student");
const sendSMS = require("../utils/sendSMS");
const sendEmail = require("../utils/sendEmail");

const reminderJob = schedule.scheduleJob("0,30 * * * *", async () => {
  const now = new Date();

  // Oblicz lokalny czas w strefie UTC+1
  const timeZoneOffset = 1 * 60 * 60 * 1000; // UTC+1 (3600000 ms)
  const localTime = new Date(now.getTime() + timeZoneOffset);

  // Oblicz zakres 24 godzin
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  console.log("Harmonogram uruchomiony:");
  console.log("Czas lokalny:", localTime.toISOString());
  console.log(
    "Zakres czasowy:",
    localTime.toISOString(),
    next24h.toISOString()
  );

  try {
    // Pobierz zajęcia w lokalnym zakresie czasu, które nie zostały powiadomione
    const schedules = await Schedule.find({
      date: { $gte: now, $lte: next24h },
      isNotified: false,
    }).populate("studentId");

    console.log("Znalezione zajęcia:", schedules);

    // Iteruj przez zajęcia i wyślij powiadomienia
    schedules.forEach(async (schedule) => {
      const student = schedule.studentId;

      if (!student) {
        console.error(
          `Brak powiązanego studenta dla harmonogramu: ${schedule._id}`
        );
        return;
      }

      const message = `Cześć ${
        student.name
      }, przypominamy o zajęciach w dniu ${schedule.date.toLocaleString(
        "pl-PL",
        {
          timeZone: "Europe/Warsaw",
        }
      )}.`;

      console.log(
        `Wysyłam SMS i e-mail do: ${student.name}, telefon: ${student.phone}, e-mail: ${student.email}`
      );

      // Wyślij SMS i e-mail
      await sendSMS(student.phone, message);
      // await sendEmail(student.email, "Przypomnienie o zajęciach", message);

      // Oznacz zajęcia jako powiadomione
      await Schedule.updateOne({ _id: schedule._id }, { isNotified: true });
    });
  } catch (error) {
    console.error("Błąd podczas wykonywania zadania:", error);
  }
});

module.exports = reminderJob;

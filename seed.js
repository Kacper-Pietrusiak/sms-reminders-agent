require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/Student");
const Schedule = require("./models/Schedule");

const seedData = async () => {
  try {
    // Połącz się z bazą danych
    await mongoose.connect(process.env.MONGO_URI); // Usunięto przestarzałe opcje
    console.log("Połączenie z MongoDB zostało nawiązane.");

    // Usuń istniejące dane, aby uniknąć duplikatów
    await Student.deleteMany({});
    await Schedule.deleteMany({});
    console.log("Poprzednie dane zostały usunięte.");

    // Dodaj przykładowego ucznia
    const students = await Student.insertMany([
      {
        name: "Kacper Pietrusiak",
        email: "kacperpietrusiak.szyb@gmail.com",
        phone: "+48661355309",
      },
    ]);
    console.log("Dodano uczniów:", students);

    // Dodaj przykładowe zajęcia
    const schedules = await Schedule.insertMany([
      {
        studentId: students[0]._id,
        date: new Date("2025-01-29T13:00:00.000Z"),
        isNotified: false, // Domyślne oznaczenie zajęć jako niepowiadomionych
      },
    ]);
    console.log("Dodano zajęcia:", schedules);

    console.log("Dane zostały pomyślnie dodane!");
  } catch (error) {
    console.error("Wystąpił błąd podczas dodawania danych:", error);
  } finally {
    mongoose.connection.close();
    console.log("Połączenie z MongoDB zostało zamknięte.");
  }
};

seedData();

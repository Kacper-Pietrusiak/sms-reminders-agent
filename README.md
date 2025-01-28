# SMS Reminders Agent

Agent przypomnień SMS to aplikacja do zarządzania korepetycjami, wysyłania automatycznych powiadomień SMS, zapisywania wydarzeń w Kalendarzu Google oraz przechowywania danych w MongoDB.

---

## 📋 Spis Treści

- [📋 Wymagania](#📋-wymagania)
- [⚙️ Instalacja](#⚙️-instalacja)
- [🔧 Konfiguracja](#🔧-konfiguracja)
- [🚀 Uruchomienie](#🚀-uruchomienie)
- [📡 Endpointy API](#📡-endpointy-api)
  - [➕ Dodanie ucznia](#➕-dodanie-ucznia)
  - [📄 Pobranie listy uczniów](#📄-pobranie-listy-uczniów)
  - [🗓️ Dodanie zajęć](#🗓️-dodanie-zajęć)
  - [📃 Pobranie listy zajęć](#📃-pobranie-listy-zajęć)
- [📨 Wysyłanie SMS](#📨-wysyłanie-sms)
- [🐞 Debugowanie](#🐞-debugowanie)

---

## 📋 Wymagania

- **Node.js** (wersja 16+)
- **MongoDB** (lokalnie lub w chmurze, np. MongoDB Atlas)
- Konto **Google Cloud** z włączonym API Kalendarza Google
- Konto **Twilio** (do wysyłania SMS)

---

## ⚙️ Instalacja

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/username/sms-reminders-agent.git
   cd sms-reminders-agent

   ```

2. **Zainstaluj zależności**
   ```bash
   npm install
   ```

---

## 🔧 Konfiguracja

1. Plik .env

W katalogu głównym projektu utwórz plik .env i uzupełnij go następującymi danymi:

    ```plaintext
    MONGO_URI=your_mongodb_connection_string
    PORT=3000
    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_PHONE_NUMBER=your_twilio_phone_number
    ```

2. Google Calendar API

- Pobierz plik credentials.json z Google Cloud Console.
- Umieść plik credentials.json w katalogu głównym projektu.
- Uruchom autoryzację:

  ```bash
  node authorize.js
  ```

- Otwórz podany URL, zaloguj się na swoje konto Google, zezwól aplikacji na dostęp do Kalendarza Google, a następnie wklej kod autoryzacyjny w terminalu.
- Token zostanie zapisany w pliku token.json.

## 🚀 Uruchomienie

1. Uruchom serwer:

   ```bash
   node server.js
   ```

Serwer będzie dostępny pod adresem http://localhost:3000.

## 📡 Endpointy API

1. ➕ Dodanie ucznia

- Endpoint: POST /students
- Body (JSON):

  ```json
  {
    "name": "Jan Kowalski",
    "email": "jan.kowalski@gmail.com",
    "phone": "+48123456789"
  }
  ```

- Odpowiedź:

  ```json
  {
    "message": "Uczeń został dodany.",
    "student": {
      "_id": "64f12345abcd67890",
      "name": "Jan Kowalski",
      "email": "jan.kowalski@gmail.com",
      "phone": "+48123456789",
      "__v": 0
    }
  }
  ```

2. 📄 Pobranie listy uczniów

- Endpoint: GET /students
- Odpowiedź:

  ```json
  [
    {
      "_id": "64f12345abcd67890",
      "name": "Jan Kowalski",
      "email": "jan.kowalski@gmail.com",
      "phone": "+48123456789",
      "__v": 0
    }
  ]
  ```

3. 🗓️ Dodanie zajęć

- Endpoint: POST /schedules
- Body (JSON):

  ```json
  {
    "studentId": "64f12345abcd67890",
    "date": "2025-01-29T12:30:00.000Z"
  }
  ```

- Odpowiedź:

  ```json
  {
    "message": "Zajęcia zostały dodane i zapisane w Kalendarzu Google.",
    "schedule": {
      "_id": "64f12345abcd67891",
      "studentId": "64f12345abcd67890",
      "date": "2025-01-29T12:30:00.000Z",
      "isNotified": false,
      "__v": 0
    }
  }
  ```

4. 📃 Pobranie listy zajęć

- Endpoint: GET /schedules
- Odpowiedź:

  ```json
  [
    {
      "_id": "64f12345abcd67891",
      "studentId": {
        "_id": "64f12345abcd67890",
        "name": "Jan Kowalski",
        "email": "jan.kowalski@gmail.com",
        "phone": "+48123456789",
        "__v": 0
      },
      "date": "2025-01-29T12:30:00.000Z",
      "isNotified": false,
      "__v": 0
    }
  ]
  ```

## 📨 Wysyłanie SMS

1. Konfiguracja Twilio

- Zaloguj się na Twilio Console.
- Skopiuj swoje ACCOUNT SID oraz AUTH TOKEN i umieść je w pliku .env:

  ```plaintext
  TWILIO_ACCOUNT_SID=your_twilio_account_sid
  TWILIO_AUTH_TOKEN=your_twilio_auth_token
  TWILIO_PHONE_NUMBER=your_twilio_phone_number
  ```

- Upewnij się, że numer telefonu ucznia jest w formacie międzynarodowym, np. +48.

2. Funkcja Wysyłania SMS

- Wysyłanie SMS jest realizowane przez funkcję sendSMS w pliku utils/sendSMS.js:

  ```javascript
  const twilio = require("twilio");

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  const sendSMS = (to, message) => {
    client.messages
      .create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      })
      .then((message) => console.log(`SMS sent: ${message.sid}`))
      .catch((error) => console.error("Error sending SMS:", error.message));
  };

  module.exports = sendSMS;
  ```

3. Automatyczne Powiadomienia

- W harmonogramie przypomnień (scheduler.js), SMS-y są wysyłane automatycznie przed zajęciami:

  ```javascript
  schedules.forEach(async (schedule) => {
    const student = schedule.studentId;

    const message = `Cześć ${
      student.name
    }, przypominamy o zajęciach w dniu ${schedule.date.toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    })}.`;

    sendSMS(student.phone, message);
  });
  ```

## 🐞 Debugowanie

1. Problem z MongoDB:

- Upewnij się, że MONGO_URI w .env wskazuje na poprawny adres.

2. Problem z Google API:

- Upewnij się, że credentials.json i token.json są poprawnie skonfigurowane.

3. Problem z Twilio:

- Sprawdź, czy TWILIO_ACCOUNT_SID i TWILIO_AUTH_TOKEN są poprawne.

4. Logi Serwera:

- Uruchom aplikację i sprawdź logi:

  ```bash
  node server.js
  ```

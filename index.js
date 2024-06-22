// Zum Importieren der Module
const express = require('express'); // Express framework für den Aufbau des Servers
const mongoose = require('mongoose'); // Mongoose-Bibliothek für die Interaktion mit MongoDB
const bodyParser = require('body-parser'); // Middleware zur Handhabung von JSON-Daten im Anfragekörper

// Erstelle eine neue Express-Anwendung
const app = express();
app.use(bodyParser.json()); // Verwende body-parser Middleware, um JSON-Daten zu parsen

// Verbinde dich mit der MongoDB-Datenbank
mongoose.connect('mongodb://localhost:27017/arabicLearningApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Definiere das Schema für die Benutzer
const userSchema = new mongoose.Schema({
    name: String, // Name des Benutzers
    email: { type: String, unique: true }, // E-Mail des Benutzers, muss einzigartig sein
    password: String, // Passwort des Benutzers
    role: { type: String, enum: ['student', 'teacher'], default: 'student' }, // Rolle des Benutzers, entweder 'student' oder 'teacher'
    progress: { type: Number, default: 0 }, // Fortschritt des Benutzers, standardmäßig 0
    preferences: {
        languageLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }, // Sprachniveau des Benutzers
        interests: [String], // Interessen des Benutzers
    },
});

// Erstelle ein Modell basierend auf dem Benutzer-Schema
const User = mongoose.model('User', userSchema);

// Definiere das Schema für die Module
const moduleSchema = new mongoose.Schema({
    title: String, // Titel des Moduls
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true }, // Niveau des Moduls
    content: String, // Inhalt des Moduls
    exercises: [String], // Übungen, die im Modul enthalten sind
});

// Erstelle ein Modell basierend auf dem Modul-Schema
const Module = mongoose.model('Module', moduleSchema);

// Definiere das Schema für die Übungen
const exerciseSchema = new mongoose.Schema({
    question: String, // Frage der Übung
    type: { type: String, enum: ['fill-in-the-blank', 'multiple-choice', 'drag-and-drop'], required: true }, // Typ der Übung
    options: [String], // Optionen für die Übung (z.B. bei Multiple-Choice)
    correctAnswer: String, // Richtige Antwort der Übung
});

// Erstelle ein Modell basierend auf dem Übungs-Schema
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Route zur Benutzerregistrierung
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body; // Extrahiere die Benutzerdaten aus der Anfrage
    const user = new User({ name, email, password, role }); // Erstelle einen neuen Benutzer

    try {
        await user.save(); // Speichere den Benutzer in der Datenbank
        res.status(201).send(user); // Sende eine Erfolgsmeldung mit dem erstellten Benutzer
    } catch (error) {
        res.status(400).send(error); // Sende eine Fehlermeldung, falls etwas schiefgeht
    }
});

// Route zur Benutzeranmeldung
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Extrahiere die Anmeldedaten aus der Anfrage

    try {
        const user = await User.findOne({ email, password }); // Finde den Benutzer basierend auf E-Mail und Passwort
        if (!user) {
            return res.status(400).send({ message: 'Invalid email or password' }); // Sende eine Fehlermeldung, falls die Anmeldedaten nicht übereinstimmen
        }
        res.send(user); // Sende die Benutzerdaten als Antwort
    } catch (error) {
        res.status(500).send(error); // Sende eine Fehlermeldung, falls etwas schiefgeht
    }
});

// Route zum Abrufen des Nutzerprofils
app.get('/profile/:id', async (req, res) => {
    const userId = req.params.id; // Extrahiere die Benutzer-ID aus den URL-Parametern

    try {
        const user = await User.findById(userId); // Finde den Benutzer basierend auf der ID
        if (!user) {
            return res.status(404).send({ message: 'User not found' }); // Sende eine Fehlermeldung, falls der Benutzer nicht gefunden wird
        }
        res.send(user); // Sende die Benutzerdaten als Antwort
    } catch (error) {
        res.status(500).send(error); // Sende eine Fehlermeldung, falls etwas schiefgeht
    }
});

// Route zum Erstellen einer neuen Übung
app.post('/exercises', async (req, res) => {
    const exerciseData = req.body; // Extrahiere die Übungsdaten aus der Anfrage
    const exercise = new Exercise(exerciseData); // Erstelle eine neue Übung

    try {
        await exercise.save(); // Speichere die Übung in der Datenbank
        res.status(201).send(exercise); // Sende eine Erfolgsmeldung mit der erstellten Übung
    } catch (error) {
        res.status(400).send(error); // Sende eine Fehlermeldung, falls etwas schiefgeht
    }
});

// Route zum Abrufen aller Übungen
app.get('/exercises', async (req, res) => {
    try {
        const exercises = await Exercise.find(); // Finde alle Übungen in der Datenbank
        res.send(exercises); // Sende die Übungen als Antwort
    } catch (error) {
        res.status(500).send(error); // Sende eine Fehlermeldung, falls etwas schiefgeht
    }
});

// Starte den Server auf Port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000'); // Logge eine Meldung, dass der Server läuft
});

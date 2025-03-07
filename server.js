const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { Server } = require("socket.io");
const http = require("http");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

// Verify API key is loaded
console.log('API Key:', process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Database Connection
const db = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "chatapp1"
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));
app.set("view engine", "ejs");

// Store Online Users
const onlineUsers = {};

// Routes
app.get("/", (req, res) => {
    req.session.user ? res.redirect("/chat") : res.redirect("/login");
});

app.get("/chat", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("chat", {
        username: req.session.user.username,
        language: req.session.user.language
    });
});

app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

// Registration
app.post("/register", (req, res) => {
    const { username, password, language } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.send("Database error!");
        if (results.length > 0) return res.send("Username exists!");

        bcrypt.hash(password, 10, (err, hash) => {
            db.query("INSERT INTO users (username, password, language) VALUES (?, ?, ?)",
                [username, hash, language],
                (err) => {
                    if (err) return res.send("Registration failed!");
                    res.redirect("/login");
                });
        });
    });
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err || results.length === 0) return res.send("Invalid credentials!");

        bcrypt.compare(password, results[0].password, (err, match) => {
            if (!match) return res.send("Invalid credentials!");

            req.session.user = {
                id: results[0].id,
                username: results[0].username,
                language: results[0].language
            };
            res.redirect("/chat");
        });
    });
});

// Modified Logout Route
app.get("/logout", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    try {
        // Fetch messages between users
        const [messages] = await db.promise().execute(
            "SELECT sender, message, timestamp FROM messages"
        );
        console.log(messages);

        if (messages.length === 0) {
            return res.send("No conversation history to generate agreement");
        }

        // Format chat history
        const chatHistory = messages.map(m => `${m.timestamp} - ${m.sender}: ${m.message}`).join('\n');

        // const chatHistory = messages.map(m => `${m.sender}: ${m.message}`).join('\n');

        // Generate agreement using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate a simple small formal agreement document in plain text based on the following chat conversation. 
Include key agreed points(most importat), obligations, terms, and conditions. Structure it with clear sections.dont user ** to bold the word don't use bank word mean and don't use xyz name here is sender is client than it means Client sent to agent if sender is agent then it means agent sent to client based on it genrate and if anything is not availben give blank space to write physcaly with pen don't use star to show bold 
Chat History:\n${chatHistory}`;

        const result = await model.generateContent(prompt);
        const agreementText = await result.response.text();

        // Get unique participants
        const participants = [...new Set(messages.map(m => m.sender))];

        // Destroy session and render agreement
        req.session.destroy(() => {
            res.render("agreement", {
                agreement: agreementText,
                parties: participants.length >= 2 ?
                    [participants[0], participants[1]] :
                    ['Party A', 'Party B']
            });
        });

    } catch (error) {
        console.error("Agreement generation error:", error);
        res.status(500).send("Error generating agreement");
    }
});

// Translation Function
async function translateMessage(text, sourceLang, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    try {
        const response = await axios.get(url);
        return response.data.responseData.translatedText || text;
    } catch (error) {
        console.log(`Translation error (${sourceLang}→${targetLang}):`, error.message);
        return text;
    }
}

// Socket.io Implementation
io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("user connected", (userData) => {
        onlineUsers[userData.username] = {
            socketId: socket.id,
            language: userData.language || 'en'
        };
        io.emit("update users", Object.keys(onlineUsers));
    });

    socket.on("chat message", async ({ sender, message }) => {
        const senderData = onlineUsers[sender];
        if (!senderData) return;

        db.query(
            "INSERT INTO messages (sender, receiver, message, source_lang) VALUES (?, ?, ?, ?)",
            [sender, "all", message, senderData.language],
            async (err) => {
                if (err) return console.error("Message save error:", err);

                for (const [username, userData] of Object.entries(onlineUsers)) {
                    try {
                        let finalMessage = message;

                        if (userData.language !== senderData.language) {
                            finalMessage = await translateMessage(
                                message,
                                senderData.language,
                                userData.language
                            );
                        }

                        io.to(userData.socketId).emit("chat message", {
                            sender: sender,
                            message: finalMessage
                        });
                    } catch (error) {
                        io.to(userData.socketId).emit("chat message", {
                            sender: sender,
                            message: message
                        });
                    }
                }
            }
        );
    });

    socket.on("typing", (username) => {
        socket.broadcast.emit("typing", username);
    });

    socket.on("stop typing", (username) => {
        socket.broadcast.emit("stop typing", username);
    });

    socket.on("disconnect", () => {
        const user = Object.keys(onlineUsers).find(u => onlineUsers[u].socketId === socket.id);
        if (user) {
            delete onlineUsers[user];
            io.emit("update users", Object.keys(onlineUsers));
        }
        console.log("User disconnected");
    });
});

server.listen(3000, () =>
    console.log("Server running on http://192.168.0.101:3000")
);

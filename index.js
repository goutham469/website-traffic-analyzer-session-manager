const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config()

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// 🔥 in-memory session store
const sessions = new Map();

io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("session-start", ({ id, sessionStart }) => {
        sessions.set(id, { start:sessionStart, socketId:socket.id, lastSeen:Date.now() });
    });

    socket.on("session-end", ({ id }) => {
        const start = sessions.get(id);
        const end = Date.now();

        if (start) {
            console.log({
                id,
                start,
                end,
                duration: end - start
            });

            sessions.delete(id);

            // TODO: call your external API here
        }
    });

    socket.on("heartbeat", ({ id }) => {
        const session = sessions.get(id);
        if (session) {
            session.lastSeen = Date.now();
        }
    });

    socket.on("disconnect", () => {
        for (const [userId, session] of sessions.entries()) {
            if (session.socketId === socket.id) {
                const end = Date.now();

                console.log({
                    userId,
                    start: session.start,
                    end,
                    duration: end - session.start
                });

                sessions.delete(userId);
                break;
            }
        }
    });
});

app.post("/visit", (req, res) => {
    console.log("Visit data:", req.body);
    res.json({ success: true });
});

app.get("/", (req, res) => {
    res.send("I am fine...")
})

app.get("/live-sessions", (req,res) => {
    res.json(sessions);
})

const {PORT} = process.env;

server.listen(5000, () => {
    console.log("Server running on port ", PORT);
});
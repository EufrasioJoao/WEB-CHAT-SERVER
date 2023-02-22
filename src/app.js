// core modules
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// externals modules
const formatMessage = require("./utils/formatMessage");

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../public")));

app.get("/", async (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/index.html"));
});

//creating the server
const server = http.createServer(app);
const io = new Server(server, {
    /* instantiating new server with socket.io */
    cors: {
        origin: ["http://localhost:3000", "*"],
        methods: ["POST", "GET"],
    },
});

// listening to the connection event from the client
io.on("connection", (socket) => {
    socket.on("join_room", (data) => {
        /* join_room event to join room */
        socket.join(data);
        console.log(`user ${socket.id} joined`);
    });

    /* send_message event to send messages*/
    socket.on("send_message", ({ author, message, authorImage, room }) => {
        io.to(room).emit(
            "receive_message",
            formatMessage(author, authorImage, message)
        );
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("server is running on port " + PORT));

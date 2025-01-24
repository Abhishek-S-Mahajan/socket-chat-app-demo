import { createServer } from "http";
import express from "express";
import path from "path";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT;

const server = createServer(app);

//@desc: initiate socket.io and then attach this to the http server
const io = new Server(server);

//@desc: serve static files
app.use(express.static(path.join(process.cwd(), "public")));

//@desc: only unique users
const users = new Set();

io.on("connect", (socket) => {
    console.log("A user is now connected.");

    //@desc: handle users when a new user joins the chat
    socket.on("join", (username) => {
        users.add(username);

        //@desc: add username to the socket object
        socket.username = username;

        //@desc: broadcast to all users, that a new user has joined the chat
        io.emit("user-joined", username);

        //@desc: send the updated user list to all the users
        io.emit("user-list", Array.from(users));
    });

    //@desc: handle incoming chat messages
    socket.on("chat-message", (message) => {
        //@desc: broadcast the received message to all the connected users
        io.emit("chat-message", message);
    });

    //@desc: handle users when they leave the chat
    socket.on("leave", () => {
        console.log("A user has left the chat");
        users.forEach((user) => {
            if (user === socket.username) {
                users.delete(user);

                //@desc: broadcast to all users, that a user has left the chat
                io.emit("user-left", user);

                //@desc: send the updated user list
                io.emit("user-list", Array.from(users));
            }
        });
    });
});



server.listen(PORT, () => console.log(`Serving on port ${PORT}...`));
// server.js

const express = require('express');
const cors = require('cors');
// const body_parser = require('body-parser');

require('./connection');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = require("http").createServer(app);
const PORT = 5001;
const io = require('socket.io')(server, { // A web socket is a way to communicate between the server and the client
    cors: { // A server can onlyy send data after it has received a comment, a server can individually
        origin: 'http://localhost:3000',
        method: ["GET", "POST"]
    }
});


server.listen(PORT, () => {
    console.log("listening to port", PORT)
});
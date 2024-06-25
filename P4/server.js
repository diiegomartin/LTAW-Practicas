const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/chat.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat.js'));
});

let users = {};

io.on('connection', (socket) => {
    socket.on('newUser', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
        socket.broadcast.emit('message', { username: 'Servidor', text: `${username} se ha unido al chat.` });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];
        io.emit('userList', Object.values(users));
        if (username) {
            socket.broadcast.emit('message', { username: 'Servidor', text: `${username} ha abandonado el chat.` });
        }
    });

    socket.on('chatMessage', (msg) => {
        console.log(`Mensaje recibido: ${msg.text}`);
        io.emit('message', msg);
    });
});

function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (let name in interfaces) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
}

const PORT = 9090;
const ipAddress = getIPAddress();
server.listen(PORT, () => {
    console.log(`Server running at http://${ipAddress}:${PORT}/`);
});

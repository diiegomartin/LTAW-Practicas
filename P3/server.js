const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
        if (msg.text.startsWith('/')) {
            handleCommand(socket, msg);
        } else {
            io.emit('message', msg);
        }
    });

    function handleCommand(socket, msg) {
        const command = msg.text.split(' ')[0];
        console.log(`Comando recibido: ${command}`);
        switch (command) {
            case '/help':
                socket.emit('message', { username: 'Servidor', text: 'Comandos soportados: /help, /list, /hello, /date' });
                break;
            case '/list':
                socket.emit('message', { username: 'Servidor', text: `Número de usuarios conectados: ${Object.keys(users).length}` });
                break;
            case '/hello':
                socket.emit('message', { username: 'Servidor', text: 'Hola!' });
                break;
            case '/date':
                socket.emit('message', { username: 'Servidor', text: `Fecha actual: ${new Date().toLocaleString()}` });
                break;
            default:
                socket.emit('message', { username: 'Servidor', text: 'Comando no reconocido. Usa /help para ver la lista de comandos.' });
        }
    }
});

const PORT = 9090;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

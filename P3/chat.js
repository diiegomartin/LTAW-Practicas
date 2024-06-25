document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usersList = document.getElementById('users-list');
    const userModal = document.getElementById('user-modal');
    const usernameInput = document.getElementById('username-input');
    const usernameSubmit = document.getElementById('username-submit');

    let username;

    usernameSubmit.addEventListener('click', () => {
        username = usernameInput.value.trim();
        if (username) {
            socket.emit('newUser', username);
            userModal.style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';
        }
    });

    socket.on('message', (msg) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (msg.username === 'Servidor') {
            messageElement.classList.add('server');
        } else if (msg.username === username) {
            messageElement.classList.add('user');
        } else {
            messageElement.classList.add('other');
        }
        messageElement.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on('userList', (users) => {
        usersList.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.classList.add('user');
            userElement.textContent = user;
            usersList.appendChild(userElement);
        });
    });

    sendButton.addEventListener('click', () => {
        const msg = messageInput.value;
        if (msg.trim()) {
            socket.emit('chatMessage', { username, text: msg });
            messageInput.value = '';
            messageInput.focus();
        }
    });

    messageInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
});

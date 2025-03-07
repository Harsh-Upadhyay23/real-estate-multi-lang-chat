const socket = io();
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chat message", { sender: "<%= username %>", message });
        messageInput.value = "";
    }
}

socket.on("chat message", ({ sender, message }) => {
    const msgElement = document.createElement("p");
    msgElement.textContent = `${sender}: ${message}`;
    chatBox.appendChild(msgElement);
});

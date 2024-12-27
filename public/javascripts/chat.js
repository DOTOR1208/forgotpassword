const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatInput = document.getElementById('chatInput');
let chatId = null; // To store the ID of the current chat session

// Create a new chat session
document.getElementById('newChatBtn').addEventListener('click', async () => {
    const chatName = prompt('Enter a name for the new chat:');
    if (!chatName) {
        alert('Chat name is required!');
        return;
    }

    try {
        const response = await fetch('/chat/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: chatName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error); // Display the error message
            return;
        }

        const data = await response.json();
        chatId = data.id;

        // Update the chat header with the new chat name
        const chatHeader = document.querySelector('.p-4.border-b');
        chatHeader.textContent = `Chat AI - ${data.name}`;
        
        // Clear previous messages
        chatMessages.innerHTML = '';

        // Show the message input field
        chatInput.classList.remove('hidden');
    } catch (error) {
        alert('An error occurred while creating the chat. Please try again.');
    }
});

// Send message and get AI response
sendBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (!message || !chatId) {
        alert('Please enter a message or create a chat first!');
        return;
    }

    // Append user message to the chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'flex justify-end';
    userMessageDiv.innerHTML = `<div class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg max-w-md">${message}</div>`;
    chatMessages.appendChild(userMessageDiv);

    // Clear input field
    messageInput.value = '';

    // Send message to server and get AI response
    const response = await fetch('/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, message }),
    });
    const data = await response.json();

    // Append AI response to the chat
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'flex items-start';
    aiMessageDiv.innerHTML = `
        <div>
        <p class="italic text-gray-500 mb-1">Chat AI</p>
        <div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg max-w-md">${data.aiResponse}</div>
        </div>
    `;
    chatMessages.appendChild(aiMessageDiv);

    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
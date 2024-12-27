const axios = require('axios');
const {createNewChat, findChatById, updateChatMessages, getChats, findChatByName} = require('./chatModel');

const JARVIS_API_URL = process.env.JARVIS_API_URL;
const JARVIS_API_KEY = process.env.JARVIS_API_KEY;

var createChat = async (req, res) => { 
    try {
        const { name } = req.body;

        // Check if the chat name already exists
        const existingChat = await findChatByName(name);
        if (existingChat) {
          return res.status(400).json({ error: 'Chat name already exists. Please choose a different name.' });
        }

        // Create the new chat
        const chat = await createNewChat(name);
        res.json(chat);
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Error creating chat.' });
    }
};

var sendMessage = async (req, res) => {
    try {
        const { id, message } = req.body;

        // Validate input
        if (!id || !message) {
            return res.status(400).json({ error: 'Chat ID and message are required.' });
        }

        console.log('Fetching chat with ID:', id);

        // Fetch the chat
        const chat = await findChatById(id);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        console.log('Chat found:', chat);

        // Simulate AI response (replace with Jarvis API integration)
        const apiResponse = await axios.post(
            JARVIS_API_URL,
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: message }],
            },
            {
                headers: {
                    Authorization: `Bearer ${JARVIS_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('API Response:', apiResponse.data);

        let aiResponse = "I'm sorry, something went wrong.";
        if (apiResponse.data && apiResponse.data.choices && apiResponse.data.choices[0].message) {
            aiResponse = apiResponse.data.choices[0].message.content;
        }
        
        console.log('AI Response:', aiResponse);

        // Update the chat messages
        const updatedChat = await updateChatMessages(id, message, aiResponse).catch((err) => {
            console.error('Error updating chat messages:', err);
            throw new Error('Database update failed.');
        });

        res.json({ userMessage: message, aiResponse });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
};

var renderChatPage = async (req, res) => {
    try {
      const chats = await getChats(); // Add this function in chatModel
      res.render('chat', { title: 'Chat', chats });
    } catch (error) {
      res.status(500).json({ error: 'Error rendering chat page' });
    }
};
  
module.exports = {renderChatPage, sendMessage, createChat};

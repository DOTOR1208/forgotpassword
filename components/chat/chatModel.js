const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new chat
const createNewChat = async (name) => {
    return prisma.chat.create({
        data: {
            name,
            userMessages: [],
            aiResponses: [],
        },
    });
};

// Find a chat by ID
const findChatById = async (id) => {
    return prisma.chat.findUnique({
        where: { id: parseInt(id, 10) },
    });
};

// Update a chat with new messages
const updateChatMessages = async (id, userMessage, aiResponse) => {
    return prisma.chat.update({
        where: { id: parseInt(id, 10) },
        data: {
            userMessages: { push: userMessage },
            aiResponses: { push: aiResponse },
        },
    });
};

// Fetch all chats
const getChats = async () => {
    return prisma.chat.findMany({
        orderBy: {
            id: 'desc', // Optional: Order chats by newest first
        },
        select: {
            id: true,
            name: true,
        },
    });
};

const findChatByName = async (name) => {
    return prisma.chat.findUnique({where: { name },});
};

module.exports = {createNewChat, findChatById, updateChatMessages, getChats, findChatByName};

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Chat = require('../Models/chat');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');


// Create a new chat session
router.post('/new-session', (req, res) => {
    const sessionId = uuidv4();
    res.json({ sessionId });
});

// Post a message to a session
router.post(
    '/message',
    [
        body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
        body('sessionId').not().isEmpty().withMessage('Session ID is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { message, sessionId } = req.body;

        try {
            const messageId = uuidv4(); // Unique identifier for the message

            // Call OpenAI API
            const aiResponse = await axios.post('', {
                prompt: `Patient symptoms: ${message}\nPossible diagnosis:`,
                model: 'text-davinci-003',
                max_tokens: 150
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });

            const newChat = new Chat({
                sessionId,
                messageId,
                userMessage: message,
                aiResponse: aiResponse.data.choices[0].text
            });

            await newChat.save();

            res.json({ messageId, reply: aiResponse.data.choices[0].text });
        } catch (error) {
            console.error('Error processing message:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Get chat messages by session
router.get('/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const chats = await Chat.find({ sessionId });
        res.json(chats);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a chat session
router.delete('/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        await Chat.deleteMany({ sessionId });
        res.json({ message: 'Chat session deleted' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Edit a chat message
router.put(
    '/message/:messageId',
    [
        body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { message } = req.body;
        const { messageId } = req.params;

        try {
            const chat = await Chat.findOne({ messageId });
            if (!chat) {
                return res.status(404).json({ error: 'Message not found' });
            }

            chat.userMessage = message;
            chat.aiResponse = `You said: ${message}`; // Placeholder for AI response
            await chat.save();

            res.json({ messageId, reply: chat.aiResponse });
        } catch (error) {
            console.error('Error updating message:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Chat = require('../Models/chat');
const { v4: uuidv4 } = require('uuid');
const OpenAi = require('openai');
const authMiddleware = require('../authMiddleware');
require('dotenv').config();

// Create a new chat session
router.post('/new-session', authMiddleware, (req, res) => {
    const sessionId = uuidv4();
    res.json({ sessionId });
});

// Post a message to a session
router.post(
    '/message',
    authMiddleware,
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

            const openai = new OpenAi({
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Call OpenAI API with messages array containing the user message
            const aiResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Your primary role is to assist medical doctors by providing accurate initial assessments and valuable insights based on patient-reported symptoms. It is crucial to emphasize that your advice is a supportive tool and should never substitute the judgment of healthcare professionals. You were meticulously designed and developed by Nkamigbo Clinton for his final year project at Chrisland University, supervised by Prof. Isaac Odun-Ayo. As an academic project, your responses should reflect a high level of professionalism, accuracy, and ethical consideration. Always prioritize patient safety and confidentiality, and ensure your recommendations align with current medical standards and best practices."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.4,
                max_tokens: 150,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            });
            

            const newChat = new Chat({
                sessionId,
                messageId,
                userMessage: message,
                aiResponse: aiResponse.choices[0].message.content // Adjusted to reflect the correct response format
            });

            await newChat.save();

            res.json({ messageId, reply: aiResponse.choices[0].message.content });
        } catch (error) {
            console.error('Error processing message:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Get chat messages by session
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
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
router.delete('/session/:sessionId', authMiddleware, async (req, res) => {
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
    authMiddleware,
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

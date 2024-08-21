const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');
const Reminder = require('../Models/Reminder');
const HealthcareProvider = require('../Models/HealthcareProvider')
const Patient = require('../Models/Patient')

// Authentication middleware (if not already defined)
const authMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

// Get all notifications for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const provider = await HealthcareProvider.findOne({ user: req.user._id });
        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        
        const notifications = await Notification.find({ 
            recipient: provider._id,
            recipientModel: 'HealthcareProvider'
        }).sort({ createdAt: -1 }).limit(20);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Get unread notification count
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            recipientModel: req.user.role === 'provider' ? 'HealthcareProvider' : 'Patient',
            isRead: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unread count', error: error.message });
    }
});

router.get('/patient', authMiddleware, async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user._id });
        const notifications = await Notification.find({ 
        recipient: patient._id,
        recipientModel: 'Patient'
    }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark a notification as read
router.patch('/:notificationId/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});

//
router.post('/remove-appointment-request', authMiddleware, async (req, res) => {
    try {
      const { appointmentId } = req.body;
      await Notification.deleteMany({ 
        relatedId: appointmentId, 
        type: 'new_appointment_request',
        recipientModel: 'HealthcareProvider'
      });
      res.status(200).json({ message: 'Appointment request notifications removed' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing notifications', error: error.message });
    }
  });

// Delete a notification
router.delete('/:notificationId', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.notificationId,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
});


// Commented out code (as requested to be added back)
// const Reminder = require('../Models/Reminder');

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/user');
const HealthcareProvider = require('../Models/HealthcareProvider');
const Appointment = require('../Models/Appointment');
const Consultation = require('../Models/Consultation');
const FollowUpConsultation = require('../Models/FollowUpConsultation');

router.use((req, res, next) => {
    console.log('HealthProviderRoute middleware');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Params:', req.params);
    next();
});

// Authentication middleware
const authMiddleware = async (req, res, next) => {
console.log('Session:', req.session);
if (req.session && req.session.userId) {
    try {
    const user = await User.findById(req.session.userId);
    if (user) {
        req.user = user;
        return next();
    }
    } catch (error) {
    console.error('Auth middleware error:', error);
    }
}
console.log('Authentication failed');
res.status(401).json({ error: 'Not authenticated' });
};

// const authMiddleware = (req, res, next) => {
//     console.log('Session:', req.session);
//     console.log('User:', req.user);
//     if (!req.user) {
//         return res.status(401).json({ error: 'Not authenticated' });
//     }
//     next();
// };

// Create Healthcare Provider
router.post('/', async (req, res) => {
    try {
        const { email, password, name, age, gender, specialization, credentials } = req.body;
        console.log(req.body);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'provider'
        });
        const savedUser = await newUser.save();

        const newHealthCareProvider = new HealthcareProvider({
            name,
            age,
            gender,
            specialization,
            credentials,
            user: savedUser._id
        });

        const savedHealthCareProvider = await newHealthCareProvider.save();

        savedUser.provider = savedHealthCareProvider._id;
        await savedUser.save();

        res.status(201).json(savedHealthCareProvider);
    } catch (e) {
        let msg;
        if (e.code == 11000) {
            msg = "Staff already exists";
        } else {
            msg = e.message;
        }
        console.log(e);
        res.status(400).json(msg);
    }
});

// Login Healthcare Provider
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User authenticated, setting session:', user._id);
        req.session.userId = user._id;
        
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Error saving session' });
            }
            res.json({ 
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add logout route
router.post('/logout', async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        res.clearCookie('connect.sid'); // clear the session cookie
        return res.json({ message: 'Logged out successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Could not log out, please try again' });
    }
});

// router.post('/login', async(req, res) =>{
//     try{
//         const {email, password} = req.body;
//         const healthcareProvider = await HealthcareProvider.findByCredentials(email, password);
//         healthcareProvider.status = 'online';
//         await healthcareProvider.save();
//         res.status(200).json(healthcareProvider);
//     } catch (e) {
//         res.status(400).json(e.message);
//     }
// });

// Get all healthcare providers
router.get('/', async (req, res) => {
    try {
        const providers = await HealthcareProvider.find();
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific healthcare provider
router.get('/:providerId', async (req, res) => {
    try {
        const provider = await HealthcareProvider.findById(req.params.providerId)
            .populate('consultations')
            .populate('followUpConsultations');

        if (!provider) {
            return res.status(404).json({ error: 'Healthcare provider not found' });
        }

        res.json(provider);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the healthcare provider for the currently authenticated user

router.get('/providers/myself', authMiddleware, async (req, res) => {
try {
    if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const provider = await HealthcareProvider.findOne({ user: req.user._id }); // Use findOne instead of findById
    
    if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(provider);
} catch (err) {
    console.error('Error fetching provider:', err);
    res.status(500).json({ error: 'Internal server error' });
}
});


// Get provider's last consultation (including follow-ups)
router.get('/last-consultation', authMiddleware, async (req, res) => {
    try {
        const providerId = req.user._id;

        // Find the latest regular consultation
        const lastConsultation = await Consultation.findOne({ provider: providerId })
            .sort({ date: -1 })
            .populate('patient', 'name')
            .lean();

        // Find the latest follow-up consultation
        const lastFollowUp = await FollowUpConsultation.findOne({ provider: providerId })
            .sort({ date: -1 })
            .populate('patient', 'name')
            .lean();

        // Determine which one is more recent
        let mostRecentConsultation;
        if (lastConsultation && lastFollowUp) {
            mostRecentConsultation = lastConsultation.date > lastFollowUp.date ? lastConsultation : lastFollowUp;
        } else {
            mostRecentConsultation = lastConsultation || lastFollowUp;
        }

        if (!mostRecentConsultation) {
            return res.status(404).json({ message: 'No consultations found' });
        }

        // Add a field to indicate if it's a follow-up
        mostRecentConsultation.isFollowUp = mostRecentConsultation.newSymptoms !== undefined;

        res.json(mostRecentConsultation);
    } catch (error) {
        console.error('Error fetching last consultation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get notifications for a provider
// router.get('/notifications', async (req, res) => {
//     try {
//         const notifications = await Notification.find({ 
//             recipient: req.user.provider,
//             recipientModel: 'HealthcareProvider'
//         }).sort({ createdAt: -1 }).limit(10);

//         res.json(notifications);
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

// Get pending appointments for a provider
router.get('/pending-appointments', async (req, res) => {
    try {
        const pendingAppointments = await Appointment.find({ 
            healthcareProvider: req.user.provider,
            status: 'pending'
        }).sort({ date: 1 });

        res.json(pendingAppointments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Confirm an appointment
router.post('/confirm-appointment/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, healthcareProvider: req.user.provider },
            { status: 'confirmed' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or not authorized' });
        }

        res.json(appointment);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Healthcare provider
router.put('/:providerId', async (req, res) => {
    try {
        const { providerId } = req.params;
        const updates = req.body;
        const allowedUpdates = ['name', 'specialization', 'credentials'];

        // Ensure only allowed fields are updated
        const validUpdates = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key)) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // Performing the update
        const updatedProvider = await HealthcareProvider.findByIdAndUpdate(
            providerId,
            { $set: validUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedProvider) {
            return res.status(404).json({ error: 'Healthcare provider not found' });
        }

        res.json(updatedProvider);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete Healthcare Provider
router.delete('/:healthcareProviderId', async (req, res) => {
    try {
        const healthcareProvider = await HealthcareProvider.findByIdAndDelete(req.params.healthcareProviderId);
        if (!healthcareProvider) {
            return res.status(404).json({ message: 'Staff not found' });
        } else {
            res.json({ message: 'Staff deleted successfully' });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.use((req, res) => {
    console.log('Unhandled provider route:', req.method, req.url);
    res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
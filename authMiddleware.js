// authMiddleware.js
const User = require('./Models/user');
const Patient = require('./Models/Patient');
const HealthcareProvider = require('./Models/HealthcareProvider');

const authMiddleware = async (req, res, next) => {
    console.log('Session:', req.session);

    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                
                // Attach additional info based on user role
                if (user.role === 'patient') {
                    const patient = await Patient.findOne({ user: user._id });
                    req.user.patientInfo = patient;
                } else if (user.role === 'provider') {
                    const provider = await HealthcareProvider.findOne({ user: user._id });
                    req.user.providerInfo = provider;
                }

                console.log('User authenticated:', req.user._id, 'Role:', user.role);
                return next();
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
        }
    }

    console.log('Authentication failed');
    res.status(401).json({ error: 'Not authenticated' });
};

module.exports = authMiddleware;
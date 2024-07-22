const router = require('express').Router();
const bcrypt = require('bcrypt');
const Patient = require('../Models/Patient');
const MedicalHistory = require('../Models/MedicalHistory');
const User = require('../Models/user');
const Consultation = require('../Models/Consultation');
const Notification = require('../Models/Notification');
const Appointment = require('../Models/Appointment')
// const authMiddleware = require('../authMiddleware');

router.use((req, res, next) => {
    console.log('patientRoute middleware');
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

// Create Patient
router.post('/', async (req, res) => {
    try {
        const { email, password, name, age, gender, clinicId } = req.body;
        console.log(req.body);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'patient'
        });

        const savedUser = await newUser.save();

        // Create a new patient associated with the user
        const newPatient = new Patient({
            name,
            age,
            gender,
            clinicId,
            user: savedUser._id
        });

        const savedPatient = await newPatient.save();

        // Update the user with the patient reference
        savedUser.patient = savedPatient._id;
        await savedUser.save();

        res.status(201).json({ user: savedUser, patient: savedPatient });
    } catch (e) {
        let msg;
        if (e.code === 11000) {
            msg = 'User already exists';
        } else {
            msg = e.message;
        }
        res.status(400).json(msg);
    }
});

// Login patient
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

// search user by name
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: 'Name parameter is required' });
        }
        const patients = await Patient.find({ 
            name: { $regex: name, $options: 'i' } 
        }).select('clinicId, name age gender');  
        
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get patient profile
// Get patient profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
      console.log('Fetching profile for user:', req.user._id);
      const patient = await Patient.findOne({ user: req.user._id });
      console.log('Patient found:', patient);
      if (!patient) {
        console.log('Patient not found');
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(patient);
    } catch (err) {
      console.error('Error fetching patient:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Get patient's last consultation
router.get('/last-consultation', authMiddleware, async (req, res) => {
try {
    const patient = await Patient.findOne({ user: req.user._id });
    const lastConsultation = await Consultation.findOne({ patient: patient._id })
    .sort({ date: -1 })
    .limit(1);
    res.json(lastConsultation || {});
} catch (error) {
    res.status(500).json({ error: 'Server error' });
}
});

// Get patient's notifications
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user._id });
        const notifications = await Notification.find({ 
            recipient: patient._id,
            recipientModel: 'Patient'
        }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        }
    });


// Get a specific patient by user ID
router.get('/:patientId', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId)
            .populate('medicalHistory')
            .populate('medications')
            .populate({
                path: 'consultations',
                populate: {
                    path: 'medicationPrescriptions.medication',
                    model: 'Medication'
                }
            })
            .populate('followUpConsultations');

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(patient);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Request appointment
router.post('/request-appointment', authMiddleware, async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const patient = await Patient.findOne({ user: req.user._id });
    const newAppointment = new Appointment({
      patient: patient._id,
      date,
      time,
      reason,
      status: 'pending'
    });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Patient
router.put('/:patientId', async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['name', 'age', 'gender', 'clinicId'];

        const validUpdates = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key)) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.patientId,
            { $set: validUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(updatedPatient);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete Patient
router.delete('/:patientId', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        await MedicalHistory.deleteMany({ patient: req.params.patientId });
        res.json({ message: 'Patient deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Add new medical history entry for a patient
router.post('/:patientId/medicalHistory', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const { condition, diagnosisDate, treatment } = req.body;
        const newMedicalHistory = await MedicalHistory.create({ condition, diagnosisDate, treatment, patient: req.params.patientId });
        patient.medicalHistory.push(newMedicalHistory._id);
        await patient.save();
        res.status(201).json(newMedicalHistory);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Update a medical history entry for a patient
router.put('/:patientId/medicalHistory/:entryId', async (req, res) => {
    try {
        const { condition, diagnosisDate, treatment } = req.body;
        const updatedEntry = await MedicalHistory.findByIdAndUpdate(
            req.params.entryId,
            { condition, diagnosisDate, treatment },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: 'Medical history entry not found' });
        }

        res.json(updatedEntry);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;

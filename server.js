const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./Models/user');
const authRoutes = require('./routes/authRoute');
const patientRoutes = require('./routes/patientRoute');
const healthcareProviderRoutes = require('./routes/HealthProviderRoute');
const appointmentRoutes = require('./routes/appointmentRoute');
const consultationRoutes = require('./routes/consultationRoute');
const followUpConsultationsRoutes = require('./routes/followUpConsultationRoute');
const chatRoute = require('./routes/chatRoute');
const complaintRoute = require('./routes/complaintRoute');
const schedulerService = require('./Services/schedulerService');
const notificationRoutes = require('./routes/notificationRoute');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Appointment = require('./Models/Appointment'); // Adjust the path as necessary
require('dotenv').config();

require('./connection');
schedulerService.startScheduler();

const app = express();

// parse json bodies
app.use(bodyParser.json());

app.use(session({
    secret: 'qwertyuiop1234567890',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Updated Authentication middleware
app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                console.log('User authenticated:', req.user._id, 'Role:', user.role);
            } else {
                console.log('User not found for session ID:', req.session.userId);
                delete req.session.userId;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    } else {
        console.log('No user session');
    }
    next();
});

// Cron job to run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
    
        const appointments = await Appointment.find({
            date: { $gte: new Date(), $lt: tomorrow },
            status: 'confirmed'
        }).populate('patient healthcareProvider');

        for (const appointment of appointments) {
        // Send email to patient
        await sendEmail(appointment.patient.email, 'Appointment Reminder', `Reminder: You have an appointment with ${appointment.healthcareProvider.name} on ${appointment.date}`);

        // Send email to healthcare provider
        await sendEmail(appointment.healthcareProvider.email, 'Appointment Reminder', `Reminder: You have an appointment with ${appointment.patient.name} on ${appointment.date}`);
        }
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
});

async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
        user: 'your-email@gmail.com', // Replace with your email and password
        pass: 'your-password'
    }
    });

    const mailOptions = {
      from: 'your-email@gmail.com', // Replace with your email
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
    }

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','http://192.168.255.196:3000', 'http://192.168.255.196:3001'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/providers', healthcareProviderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/followUpConsultation', followUpConsultationsRoutes);
app.use('/api/chat', chatRoute);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoute);

const server = require('http').createServer(app);
const PORT = 5001;

server.listen(PORT, '0.0.0.0', () => {
    console.log("listening to port", PORT);
});

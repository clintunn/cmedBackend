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
const schedulerService = require('./Services/schedulerService');
const notificationRoutes = require('./routes/notificationRoute');
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
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://Campus-Med:o3jrR4A5GGurKR1N@cluster0.umrdntl.mongodb.net/' }),
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

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','http://192.168.55.196:3000'];

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

const server = require('http').createServer(app);
const PORT = 5001;

server.listen(PORT, '0.0.0.0', () => {
    console.log("listening to port", PORT);
});

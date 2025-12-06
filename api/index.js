import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import all routes
import authRoutes from '../server/routes/auth.js';
import subjectRoutes from '../server/routes/subjects.js';
import resourceRoutes from '../server/routes/resources.js';
import timetableRoutes from '../server/routes/timetable.js';
import dashboardRoutes from '../server/routes/dashboard.js';
import shareRoutes from '../server/routes/share.js';

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// MongoDB connection with caching for serverless
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        throw err;
    }
};

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/share', shareRoutes);

// Health check
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is running on Vercel!' });
});

// Vercel serverless handler
export default async function handler(req, res) {
    await connectDB();
    return app(req, res);
}

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
import searchRoutes from '../server/routes/search.js';

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// MongoDB connection with caching for serverless
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb && mongoose.connection.readyState === 1) {
        console.log('Using cached MongoDB connection');
        return cachedDb;
    }

    try {
        console.log('Connecting to MongoDB...');

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        cachedDb = conn;
        console.log('MongoDB Connected:', conn.connection.host);
        return cachedDb;
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        throw err;
    }
};

// Health check - no auth required
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is running on Vercel!',
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });
});

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Vercel serverless handler
export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error('Handler Error:', err);
        return res.status(500).json({
            error: 'Database connection failed',
            message: err.message
        });
    }
}

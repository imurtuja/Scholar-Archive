import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

// Load env vars FIRST before any routes that depend on env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import routes after env is loaded
const { default: authRoutes } = await import('./routes/auth.js');
const { default: subjectRoutes } = await import('./routes/subjects.js');
const { default: resourceRoutes } = await import('./routes/resources.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// DB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();

// Routes
// Routes
app.use((req, res, next) => {
    console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get('/api/test', (req, res) => res.send('API is running'));

console.log('Mounting auth routes...');
app.use('/api/auth', authRoutes);

console.log('Mounting subject routes...', subjectRoutes);
app.use('/api/subjects', subjectRoutes);

console.log('Mounting resource routes...');
app.use('/api/resources', resourceRoutes);

const { default: timetableRoutes } = await import('./routes/timetable.js');
console.log('Mounting timetable routes...');
app.use('/api/timetable', timetableRoutes);

const { default: dashboardRoutes } = await import('./routes/dashboard.js');
console.log('Mounting dashboard routes...');
app.use('/api/dashboard', dashboardRoutes);

const { default: shareRoutes } = await import('./routes/share.js');
console.log('Mounting share routes...');
app.use('/api/share', shareRoutes);

const { default: searchRoutes } = await import('./routes/search.js');
console.log('Mounting search routes...');
app.use('/api/search', searchRoutes);

// Catch-all for debugging 404s
app.use((req, res, next) => {
    console.log(`[DEBUG] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

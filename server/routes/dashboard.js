import express from 'express';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';
import Timetable from '../models/Timetable.js';
import Activity from '../models/Activity.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
    try {
        const totalSubjects = await Subject.countDocuments({ user: req.user.id });
        const totalResources = await Resource.countDocuments({ user: req.user.id });

        // Fetch recent user activities
        const recentActivity = await Activity.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Fetch upcoming exams - only non-completed ones
        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const upcomingExams = await Timetable.find({
            user: req.user.id,
            date: { $gte: todayStart },
            completed: { $ne: true } // Only show non-completed exams
        }).sort({ date: 1, time: 1 }).limit(5);

        // Fetch today's non-completed exams to check for ongoing
        const todaysExams = await Timetable.find({
            user: req.user.id,
            date: { $gte: todayStart, $lte: todayEnd },
            completed: { $ne: true }
        });

        const ongoingExams = todaysExams.filter(exam => {
            if (!exam.time) return false;
            const [hours, minutes] = exam.time.split(':').map(Number);
            const examTime = new Date();
            examTime.setHours(hours, minutes, 0, 0);

            // Assume exam duration is 3 hours
            const examEndTime = new Date(examTime);
            examEndTime.setHours(hours + 3);

            const currentTime = new Date();
            return currentTime >= examTime && currentTime <= examEndTime;
        });

        res.json({
            totalSubjects,
            totalResources,
            recentActivity,
            upcomingExams,
            ongoingExams
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

export default router;


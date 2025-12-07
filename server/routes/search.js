import express from 'express';
import jwt from 'jsonwebtoken';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Global search across subjects and resources
router.get('/', auth, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ subjects: [], resources: [] });
        }

        const searchQuery = q.trim();
        const searchRegex = new RegExp(searchQuery, 'i');

        // Search subjects
        const subjects = await Subject.find({
            user: req.user.id,
            $or: [
                { name: searchRegex },
                { code: searchRegex },
                { 'syllabus.units.title': searchRegex },
                { 'syllabus.units.topics': searchRegex }
            ]
        })
            .select('name code year semester')
            .limit(5);

        // Search resources
        const resources = await Resource.find({
            user: req.user.id,
            $or: [
                { title: searchRegex },
                { content: searchRegex }
            ]
        })
            .populate('subject', 'name code')
            .select('title category subject')
            .limit(10);

        res.json({
            subjects: subjects.map(s => ({
                _id: s._id,
                name: s.name,
                code: s.code,
                year: s.year,
                semester: s.semester,
                type: 'subject'
            })),
            resources: resources.map(r => ({
                _id: r._id,
                title: r.title,
                category: r.category,
                subject: r.subject?.name || 'Unknown',
                subjectId: r.subject?._id,
                type: 'resource'
            }))
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

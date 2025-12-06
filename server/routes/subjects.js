import express from 'express';
import Subject from '../models/Subject.js';
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

// Get all subjects for user (sorted by year, semester, order, then createdAt)
router.get('/', auth, async (req, res) => {
    try {
        // Sort: year asc, semester asc, order asc, createdAt asc (newer subjects after older ones)
        const subjects = await Subject.find({ user: req.user.id }).sort({ year: 1, semester: 1, order: 1, createdAt: 1 });
        res.json(subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Create subject
router.post('/', auth, async (req, res) => {
    try {
        const { name, code, credits, year, semester, color, syllabus, order } = req.body;

        // If no order provided, find the max order for this year/semester and add 1
        let subjectOrder = order;
        if (subjectOrder === undefined || subjectOrder === null || subjectOrder === '') {
            const maxOrderSubject = await Subject.findOne({
                user: req.user.id,
                year,
                semester
            }).sort({ order: -1 });
            subjectOrder = maxOrderSubject ? (maxOrderSubject.order || 0) + 1 : 1;
        }

        const newSubject = new Subject({
            user: req.user.id,
            name,
            code,
            credits,
            year,
            semester,
            color,
            syllabus,
            order: parseInt(subjectOrder) || 1
        });
        const subject = await newSubject.save();

        // Log activity
        await new Activity({
            user: req.user.id,
            action: 'subject_add',
            description: `Added new subject: ${name}`,
            metadata: { subjectId: subject._id, name, year, semester }
        }).save();

        res.json(subject);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Update subject
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('PUT /subjects/:id called with id:', req.params.id);
        console.log('Request body:', req.body);

        // Validate ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid subject ID format' });
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            console.log('Subject not found');
            return res.status(404).json({ message: 'Subject not found' });
        }

        if (subject.user.toString() !== req.user.id) {
            console.log('Not authorized - user mismatch');
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { name, code, credits, year, semester, order } = req.body;

        if (name !== undefined) subject.name = name;
        if (code !== undefined) subject.code = code;
        if (credits !== undefined) subject.credits = credits;
        if (year !== undefined) subject.year = year;
        if (semester !== undefined) subject.semester = semester;
        if (order !== undefined) subject.order = parseInt(order) || 0;

        await subject.save();
        console.log('Subject saved successfully');

        // Log activity (wrapped in try-catch to not fail the main operation)
        try {
            await new Activity({
                user: req.user.id,
                action: 'subject_edit',
                description: `Updated subject: ${subject.name}`,
                metadata: { subjectId: subject._id, name: subject.name }
            }).save();
        } catch (activityErr) {
            console.error('Activity log error (non-critical):', activityErr.message);
        }

        res.json(subject);
    } catch (err) {
        console.error('Update subject error:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Delete subject
router.delete('/:id', auth, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        if (subject.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const subjectName = subject.name;
        await subject.deleteOne();

        // Log activity
        await new Activity({
            user: req.user.id,
            action: 'subject_delete',
            description: `Removed subject: ${subjectName}`,
            metadata: { name: subjectName }
        }).save();

        res.json({ message: 'Subject removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

export default router;

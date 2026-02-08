import express from 'express';
import Timetable from '../models/Timetable.js';
import Activity from '../models/Activity.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware
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

// Get all exams for user
router.get('/', auth, async (req, res) => {
    try {
        const exams = await Timetable.find({ user: req.user.id }).sort({ date: 1, time: 1 });
        res.json(exams);
    } catch (err) {
        console.error('[ERROR] GET /api/timetable:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Add exam
router.post('/', auth, async (req, res) => {
    try {
        console.log('[DEBUG] POST /api/timetable - Request body:', req.body);
        const { subject, code, date, time, room, year, semester } = req.body;

        // Validate required fields
        if (!subject || !date || !time || !year || !semester) {
            console.log('[ERROR] Missing required fields:', { subject, date, time, year, semester });
            return res.status(400).json({ message: 'Missing required fields: subject, date, time, year, and semester are required' });
        }

        const newExam = new Timetable({
            user: req.user.id,
            subject,
            code,
            date,
            time,
            room,
            year,
            semester
        });
        console.log('[DEBUG] Creating exam:', newExam);
        const exam = await newExam.save();
        console.log('[DEBUG] Exam saved:', exam);

        // Log activity
        await new Activity({
            user: req.user.id,
            action: 'exam_add',
            description: `Scheduled exam: ${subject}`,
            metadata: { examId: exam._id, subject, date }
        }).save();

        res.json(exam);
    } catch (err) {
        console.error('[ERROR] POST /api/timetable:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Delete exam
router.delete('/:id', auth, async (req, res) => {
    try {
        const exam = await Timetable.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        if (exam.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const examSubject = exam.subject;
        await exam.deleteOne();

        // Log activity
        await new Activity({
            user: req.user.id,
            action: 'exam_delete',
            description: `Removed exam: ${examSubject}`,
            metadata: { subject: examSubject }
        }).save();

        res.json({ message: 'Exam removed' });
    } catch (err) {
        console.error('[ERROR] DELETE /api/timetable/:id:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Toggle complete
router.put('/:id/toggle', auth, async (req, res) => {
    try {
        const exam = await Timetable.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        if (exam.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        exam.completed = !exam.completed;
        await exam.save();

        // Log activity
        await new Activity({
            user: req.user.id,
            action: 'exam_complete',
            description: exam.completed ? `Completed exam: ${exam.subject}` : `Uncompleted exam: ${exam.subject}`,
            metadata: { examId: exam._id, subject: exam.subject, completed: exam.completed }
        }).save();

        res.json(exam);
    } catch (err) {
        console.error('[ERROR] PUT /api/timetable/:id/toggle:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Update exam
router.put('/:id', auth, async (req, res) => {
    try {
        const { subject, date, time, year, semester } = req.body;

        // Validate required fields
        if (!subject || !date || !time || !year || !semester) {
            return res.status(400).json({ message: 'Missing required fields: subject, date, time, year, and semester are required' });
        }

        const exam = await Timetable.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        if (exam.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        exam.subject = subject;
        exam.date = date;
        exam.time = time;
        exam.year = year;
        exam.semester = semester;

        await exam.save();

        // Log activity
        await new Activity({
            user: req.user.id,
            action: 'exam_edit',
            description: `Edited exam: ${subject}`,
            metadata: { examId: exam._id, subject, date }
        }).save();

        res.json(exam);
    } catch (err) {
        console.error('[ERROR] PUT /api/timetable/:id:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

export default router;


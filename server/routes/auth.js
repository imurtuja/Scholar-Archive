import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        console.log('[DEBUG] Register request body:', req.body);
        let { name, email, password, institution, course, year, durationYears, totalSemesters } = req.body;
        email = email.toLowerCase();

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('[DEBUG] Registration failed: User already exists for email', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            institution,
            course,
            year,
            durationYears: durationYears || 4,
            totalSemesters: totalSemesters || 8
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        institution: user.institution,
                        course: user.course,
                        currentYear: user.currentYear,
                        durationYears: user.durationYears,
                        totalSemesters: user.totalSemesters
                    }
                });
            }
        );
    } catch (err) {
        console.error('[DEBUG] Registration Error:', err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[DEBUG] Login request body:', req.body);

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log('[DEBUG] Login failed: User not found for email:', email);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        console.log('[DEBUG] User found:', user.email);

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('[DEBUG] Password match result:', isMatch);

        if (!isMatch) {
            console.log('[DEBUG] Login failed: Password mismatch');
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        institution: user.institution,
                        course: user.course,
                        currentYear: user.currentYear,
                        durationYears: user.durationYears,
                        totalSemesters: user.totalSemesters
                    }
                });
            }
        );
    } catch (err) {
        console.error('[ERROR] Login Route:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Get User Profile (for token verification on page load)
router.get('/profile', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution,
            course: user.course,
            currentYear: user.currentYear,
            durationYears: user.durationYears,
            totalSemesters: user.totalSemesters
        });
    } catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Update User Profile
router.put('/profile', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.user.id;

        const { name, email, bio, institution, course, year, currentYear, durationYears } = req.body;

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (bio) user.bio = bio;
        if (institution) user.institution = institution;
        if (course) user.course = course;
        // Handle both 'year' and 'currentYear' field names
        if (currentYear !== undefined) user.currentYear = currentYear;
        if (year !== undefined) user.currentYear = year;
        if (durationYears !== undefined) user.durationYears = durationYears;

        await user.save();

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                institution: user.institution,
                course: user.course,
                currentYear: user.currentYear,
                durationYears: user.durationYears,
                totalSemesters: user.totalSemesters
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

export default router;

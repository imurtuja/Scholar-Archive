import express from 'express';
import Resource from '../models/Resource.js';
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

// Get all resources for user
router.get('/', auth, async (req, res) => {
    try {
        const resources = await Resource.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Add resource
router.post('/', auth, async (req, res) => {
    try {
        const { subject, title, type, category, link, content } = req.body;
        const newResource = new Resource({
            user: req.user.id,
            subject,
            title,
            type,
            category,
            link,
            content
        });
        const resource = await newResource.save();
        res.json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Delete resource
router.delete('/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await resource.deleteOne();
        res.json({ message: 'Resource removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

export default router;

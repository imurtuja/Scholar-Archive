import express from 'express';
import auth from '../middleware/auth.js';
import SharedLink from '../models/SharedLink.js';
import Resource from '../models/Resource.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Create a share link
router.post('/', auth, async (req, res) => {
    try {
        const { type, targetId, includedContent } = req.body;

        if (!type || !targetId) {
            return res.status(400).json({ error: 'Type and targetId are required' });
        }

        // Get the target item to get its title
        let targetItem;
        let title;
        let description = '';

        if (type === 'resource') {
            targetItem = await Resource.findOne({ _id: targetId, user: req.user.id });
            if (!targetItem) {
                return res.status(404).json({ error: 'Resource not found' });
            }
            title = targetItem.title;
            description = targetItem.content?.substring(0, 100) || '';
        } else if (type === 'subject') {
            targetItem = await Subject.findOne({ _id: targetId, user: req.user.id });
            if (!targetItem) {
                return res.status(404).json({ error: 'Subject not found' });
            }
            title = targetItem.name;

            // Build description based on included content
            const contentParts = [];
            if (includedContent?.syllabus) contentParts.push('Syllabus');
            if (includedContent?.notes) contentParts.push('Notes');
            if (includedContent?.questions) contentParts.push('Questions');
            if (includedContent?.papers) contentParts.push('Papers');
            description = contentParts.length > 0
                ? `Includes: ${contentParts.join(', ')}`
                : `${targetItem.year} - ${targetItem.semester}`;
        } else {
            return res.status(400).json({ error: 'Invalid type. Must be "resource" or "subject"' });
        }

        // Create new share link (always create new to support different content combinations)
        const shareLink = new SharedLink({
            user: req.user.id,
            type,
            targetId,
            title,
            description,
            ...(type === 'subject' && includedContent && { includedContent })
        });

        await shareLink.save();
        res.status(201).json(shareLink);
    } catch (error) {
        console.error('Error creating share link:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all my share links
router.get('/', auth, async (req, res) => {
    try {
        const shares = await SharedLink.find({ user: req.user.id, isActive: true })
            .sort({ createdAt: -1 })
            .populate('views.user', 'name email');

        res.json(shares);
    } catch (error) {
        console.error('Error fetching shares:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a share link
router.delete('/:id', auth, async (req, res) => {
    try {
        const share = await SharedLink.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isActive: false },
            { new: true }
        );

        if (!share) {
            return res.status(404).json({ error: 'Share link not found' });
        }

        res.json({ message: 'Share link deleted' });
    } catch (error) {
        console.error('Error deleting share:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get shared content (public route but requires auth)
router.get('/view/:linkId', auth, async (req, res) => {
    try {
        const share = await SharedLink.findOne({
            linkId: req.params.linkId,
            isActive: true
        }).populate('user', 'name');

        if (!share) {
            return res.status(404).json({ error: 'Share link not found or expired' });
        }

        // Check expiry
        if (share.expiresAt && new Date() > share.expiresAt) {
            return res.status(410).json({ error: 'Share link has expired' });
        }

        // Log view if not the owner
        if (share.user._id.toString() !== req.user.id) {
            const existingView = share.views.find(v => v.user?.toString() === req.user.id);
            if (!existingView) {
                share.views.push({ user: req.user.id });
                await share.save();
            }
        }

        // Get the actual content
        let content;
        if (share.type === 'resource') {
            content = await Resource.findById(share.targetId)
                .populate('subject', 'name code');
        } else if (share.type === 'subject') {
            const subject = await Subject.findById(share.targetId);
            if (!subject) {
                return res.status(404).json({ error: 'Subject not found' });
            }

            // Get resources for this subject, filtered by includedContent
            const includedContent = share.includedContent || {
                syllabus: true,
                notes: true,
                questions: true,
                papers: true
            };

            // Build category filter based on includedContent
            const categoryFilter = [];
            if (includedContent.notes) categoryFilter.push('notes');
            if (includedContent.questions) categoryFilter.push('questions');
            if (includedContent.papers) categoryFilter.push('papers');

            let resources = [];
            if (categoryFilter.length > 0) {
                resources = await Resource.find({
                    subject: share.targetId,
                    category: { $in: categoryFilter }
                });
            }

            content = {
                ...subject.toObject(),
                // Only include syllabus if selected
                syllabus: includedContent.syllabus ? subject.syllabus : null,
                resources,
                includedContent
            };
        }

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        res.json({
            share: {
                linkId: share.linkId,
                type: share.type,
                title: share.title,
                sharedBy: share.user.name,
                createdAt: share.createdAt,
                includedContent: share.includedContent
            },
            content
        });
    } catch (error) {
        console.error('Error fetching shared content:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get share analytics (view count and viewers)
router.get('/analytics/:id', auth, async (req, res) => {
    try {
        const share = await SharedLink.findOne({ _id: req.params.id, user: req.user.id })
            .populate('views.user', 'name email');

        if (!share) {
            return res.status(404).json({ error: 'Share not found' });
        }

        res.json({
            totalViews: share.views.length,
            viewers: share.views.map(v => ({
                name: v.user?.name || 'Unknown',
                email: v.user?.email || 'Unknown',
                viewedAt: v.viewedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;

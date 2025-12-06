import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const SharedLinkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    linkId: {
        type: String,
        unique: true,
        default: () => nanoid(10)
    },
    type: {
        type: String,
        enum: ['resource', 'subject'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'type'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    // For subject shares - which content types to include
    includedContent: {
        syllabus: { type: Boolean, default: true },
        notes: { type: Boolean, default: true },
        questions: { type: Boolean, default: true },
        papers: { type: Boolean, default: true }
    },
    views: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for faster lookups
SharedLinkSchema.index({ linkId: 1 });
SharedLinkSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('SharedLink', SharedLinkSchema);

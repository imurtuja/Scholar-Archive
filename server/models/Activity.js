import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'profile_update',
            'password_change',
            'subject_add',
            'subject_edit',
            'subject_delete',
            'resource_add',
            'resource_delete',
            'exam_add',
            'exam_edit',
            'exam_delete',
            'exam_complete',
            'login'
        ]
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
ActivitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Activity', ActivitySchema);

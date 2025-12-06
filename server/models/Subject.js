import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        trim: true
    },
    credits: {
        type: Number,
        default: 0
    },
    year: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#3B82F6'
    },
    syllabus: {
        type: Object, // Storing the parsed syllabus JSON structure
        default: {}
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Subject', subjectSchema);

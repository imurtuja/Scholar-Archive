import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    institution: {
        type: String,
        trim: true
    },
    course: {
        type: String,
        trim: true
    },
    year: {
        type: String,
        trim: true
    },
    currentYear: {
        type: Number,
        default: 1
    },
    courseType: {
        type: String,
        trim: true
    },
    durationYears: {
        type: Number,
        default: 4
    },
    totalSemesters: {
        type: Number,
        default: 8
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);

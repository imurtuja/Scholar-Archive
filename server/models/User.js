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
        required: false  // Not required for OAuth users
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
    // Google OAuth fields
    googleId: {
        type: String,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    profileComplete: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    scheduledDeletion: {
        type: Date,
        default: null
    }
});

export default mongoose.model('User', userSchema);

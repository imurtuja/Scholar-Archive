import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { sendPasswordResetEmail, sendDeletionScheduledEmail, sendVerificationOTP } from '../utils/emailService.js';

const router = express.Router();

// Configure Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                console.log('[OAuth] Returning user found:', user.email, 'profileComplete:', user.profileComplete);
                return done(null, user);
            }

            // Check if user exists with same email
            const existingEmailUser = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
            if (existingEmailUser) {
                // Link Google to existing account
                existingEmailUser.googleId = profile.id;
                existingEmailUser.authProvider = 'google';
                existingEmailUser.isEmailVerified = true;
                await existingEmailUser.save();
                return done(null, existingEmailUser);
            }

            // Create new user from Google profile
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value.toLowerCase(),
                googleId: profile.id,
                authProvider: 'google',
                isEmailVerified: true,
                profileComplete: false // Will require profile setup
            });
            await user.save();
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
    console.log('[OAuth] Google OAuth strategy configured');
} else {
    console.log('[OAuth] Google OAuth not configured - add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
}

// In-memory OTP storage (email -> { otp, expiresAt, name })
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Password strength validation
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('one special character');
    return errors;
};

// Send OTP for email verification
router.post('/send-otp', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required' });
        }

        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP
        otpStore.set(normalizedEmail, { otp, expiresAt, name });

        // Send OTP email
        console.log(`[OTP] Attempting to send OTP to ${normalizedEmail}`);
        const emailResult = await sendVerificationOTP(normalizedEmail, name, otp);

        if (!emailResult.success) {
            console.error('[OTP] Email sending failed:', emailResult.error);
            return res.status(500).json({
                message: 'Failed to send verification email: ' + (emailResult.error || 'Unknown error')
            });
        }

        console.log(`[OTP] Successfully sent to ${normalizedEmail}`);
        res.json({ message: 'OTP sent successfully', email: normalizedEmail });
    } catch (err) {
        console.error('[OTP Error]:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const normalizedEmail = email.toLowerCase();
        const storedData = otpStore.get(normalizedEmail);

        if (!storedData) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(normalizedEmail);
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        // Mark as verified (keep in store for registration)
        storedData.verified = true;
        otpStore.set(normalizedEmail, storedData);

        console.log(`[OTP] Verified for ${normalizedEmail}`);
        res.json({ message: 'Email verified successfully', verified: true });
    } catch (err) {
        console.error('[OTP Verify Error]:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        let { name, email, password, institution, course, year, durationYears, totalSemesters } = req.body;
        email = email.toLowerCase();

        // Check if email was verified via OTP
        const otpData = otpStore.get(email);
        if (!otpData || !otpData.verified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        // Validate password strength
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                message: 'Password must contain: ' + passwordErrors.join(', ')
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        // Parse year string like "4th Year" to get numeric value
        let currentYearNum = 1;
        if (year) {
            const match = year.match(/(\d+)/);
            if (match) {
                currentYearNum = parseInt(match[1]) || 1;
            }
        }

        user = new User({
            name,
            email,
            password,
            institution,
            course,
            year,
            currentYear: currentYearNum,
            durationYears: durationYears || 4,
            totalSemesters: totalSemesters || 8,
            isEmailVerified: true
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Clear OTP data after successful registration
        otpStore.delete(email);

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
        console.error('[Registration Error]:', err.message);
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

// Forgot Password - Generate reset token and send email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists for security
            return res.json({ message: 'If the email exists, a reset link has been sent.' });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET + user.password, // Include password hash to invalidate token after password change
            { expiresIn: '1h' }
        );

        // Build the reset URL
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send the email
        const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);

        if (emailResult.success) {
            console.log('[EMAIL] Password reset email sent to:', email);
            res.json({ message: 'If the email exists, a reset link has been sent.' });
        } else {
            console.error('[EMAIL] Failed to send reset email:', emailResult.error);
            // Still return success message for security (don't reveal email issues)
            res.json({ message: 'If the email exists, a reset link has been sent.' });
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password - Verify token and update password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Decode token to get user email first
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.userId) {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        // Verify token with user's current password hash (ensures token becomes invalid after use)
        try {
            jwt.verify(token, process.env.JWT_SECRET + user.password);
        } catch (err) {
            return res.status(400).json({ message: 'Reset token has expired or is invalid' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password (for logged-in users)
router.post('/change-password', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.user.id;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Account (immediate - keep for backwards compatibility)
router.delete('/delete-account', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.user.id;

        // Import models to delete user data
        const Subject = (await import('../models/Subject.js')).default;
        const Resource = (await import('../models/Resource.js')).default;
        const Activity = (await import('../models/Activity.js')).default;
        const SharedLink = (await import('../models/SharedLink.js')).default;
        const Timetable = (await import('../models/Timetable.js')).default;

        // Delete all user data
        await Subject.deleteMany({ user: userId });
        await Resource.deleteMany({ user: userId });
        await Activity.deleteMany({ user: userId });
        await SharedLink.deleteMany({ user: userId });
        await Timetable.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account and all data deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Schedule Account Deletion (14-day grace period)
router.post('/schedule-deletion', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set deletion date to 14 days from now
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 14);

        user.scheduledDeletion = deletionDate;
        await user.save();

        // Send email notification (non-blocking)
        try {
            await sendDeletionScheduledEmail(user.email, user.name, deletionDate);
            console.log('[EMAIL] Account deletion scheduled email sent to:', user.email);
        } catch (emailError) {
            console.error('[EMAIL] Failed to send deletion email:', emailError.message);
            // Continue anyway - email is not critical
        }

        res.json({
            message: 'Account scheduled for deletion',
            deletionDate: deletionDate.toISOString()
        });
    } catch (err) {
        console.error('Schedule deletion error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel Scheduled Deletion (when user logs back in)
router.post('/cancel-deletion', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.scheduledDeletion) {
            user.scheduledDeletion = null;
            await user.save();
            return res.json({ message: 'Account deletion cancelled', wasPending: true });
        }

        res.json({ message: 'No pending deletion', wasPending: false });
    } catch (err) {
        console.error('Cancel deletion error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
    }),
    (req, res) => {
        // Create JWT token
        const payload = {
            user: {
                id: req.user.id
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        );

        // Redirect to frontend with token
        // Use oauth-callback to properly set auth state
        const redirectPath = req.user.profileComplete ? '/oauth-callback' : '/complete-profile';
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}${redirectPath}?token=${token}`);
    }
);

// Complete profile for Google users
router.post('/complete-profile', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { institution, degree, major, year, durationYears } = req.body;

        // Parse year string to get numeric value
        let currentYearNum = 1;
        if (year) {
            const match = year.match(/(\d+)/);
            if (match) {
                currentYearNum = parseInt(match[1]) || 1;
            }
        }

        user.institution = institution;
        user.course = `${degree} - ${major}`;
        user.year = year;
        user.currentYear = currentYearNum;
        user.durationYears = durationYears || 4;
        user.totalSemesters = (durationYears || 4) * 2;
        user.profileComplete = true;

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
                totalSemesters: user.totalSemesters,
                profileComplete: user.profileComplete
            }
        });
    } catch (err) {
        console.error('Complete profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

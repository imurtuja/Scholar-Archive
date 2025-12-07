import nodemailer from 'nodemailer';

// Create Gmail transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// Simple, reliable email template
const getPasswordResetTemplate = (userName, resetUrl) => {
    const firstName = userName ? userName.split(' ')[0] : 'there';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fa;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

<!-- Header with logo -->
<tr>
<td style="padding:40px 40px 32px 40px;text-align:center;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<svg width="48" height="48" viewBox="0 0 48 48" style="display:block;margin:0 auto 12px;">
<rect width="48" height="48" rx="12" fill="#6366f1"/>
<path d="M24 14L16 20V30C16 31.1 16.9 32 18 32H30C31.1 32 32 31.1 32 30V20L24 14Z" fill="white"/>
<path d="M20 26H28V30H20V26Z" fill="#6366f1" opacity="0.5"/>
</svg>
<h2 style="margin:0;color:#1f2937;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ScholarArchive</h2>
</td>
</tr>
</table>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 40px;">
<div style="height:1px;background:#e5e7eb;"></div>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px;">

<!-- Title -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:16px;">
<h1 style="margin:0;color:#1f2937;font-size:28px;font-weight:700;">Reset Your Password</h1>
</td>
</tr>
</table>

<!-- Message -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:32px;">
<p style="margin:0;color:#6b7280;font-size:16px;line-height:1.6;">
Hi <strong style="color:#1f2937;">${firstName}</strong>, we received a request to reset your password. Click the button below to create a new password.
</p>
</td>
</tr>
</table>

<!-- Button -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:24px;">
<a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;">Reset Password</a>
</td>
</tr>
</table>

<!-- Timer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:24px;">
<p style="margin:0;color:#f59e0b;font-size:14px;font-weight:600;">⏱ This link expires in 1 hour</p>
</td>
</tr>
</table>

<!-- Security note -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
<p style="margin:0;color:#15803d;font-size:14px;line-height:1.5;">
<strong>🛡️ Security tip:</strong> If you didn't request this password reset, please ignore this email. Your account is safe.
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0 0 8px 0;color:#9ca3af;font-size:14px;">
Need help? Contact <a href="mailto:support@scholararchive.com" style="color:#6366f1;text-decoration:none;">support@scholararchive.com</a>
</p>
<p style="margin:0;color:#d1d5db;font-size:13px;">
© ${new Date().getFullYear()} ScholarArchive. All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, userName, resetUrl) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'ScholarArchive',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '🔐 Reset Your Password - ScholarArchive',
            html: getPasswordResetTemplate(userName, resetUrl),
            text: `Hi ${userName || 'there'}, Reset your password here: ${resetUrl}. This link expires in 1 hour.`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

// Account deletion email
export const sendDeletionScheduledEmail = async (email, userName, deletionDate) => {
    try {
        const transporter = createTransporter();
        const firstName = userName ? userName.split(' ')[0] : 'there';
        const formattedDate = new Date(deletionDate).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fa;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

<!-- Header with logo -->
<tr>
<td style="padding:40px 40px 32px 40px;text-align:center;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<svg width="48" height="48" viewBox="0 0 48 48" style="display:block;margin:0 auto 12px;">
<rect width="48" height="48" rx="12" fill="#ef4444"/>
<path d="M24 14L16 20V30C16 31.1 16.9 32 18 32H30C31.1 32 32 31.1 32 30V20L24 14Z" fill="white"/>
<path d="M20 26H28V30H20V26Z" fill="#ef4444" opacity="0.5"/>
</svg>
<h2 style="margin:0;color:#1f2937;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ScholarArchive</h2>
</td>
</tr>
</table>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 40px;">
<div style="height:1px;background:#e5e7eb;"></div>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px;">

<!-- Title -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:16px;">
<h1 style="margin:0;color:#1f2937;font-size:28px;font-weight:700;">Account Deletion Scheduled</h1>
</td>
</tr>
</table>

<!-- Message -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:24px;">
<p style="margin:0;color:#6b7280;font-size:16px;line-height:1.6;">
Hi <strong style="color:#1f2937;">${firstName}</strong>, your account is scheduled to be permanently deleted on:
</p>
</td>
</tr>
</table>

<!-- Date -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:32px;">
<div style="background:#fef2f2;border:2px solid #fecaca;border-radius:8px;padding:16px 24px;display:inline-block;">
<p style="margin:0;color:#dc2626;font-size:18px;font-weight:700;">📅 ${formattedDate}</p>
</div>
</td>
</tr>
</table>

<!-- Info box -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:20px;">
<p style="margin:0 0 12px 0;color:#15803d;font-size:15px;font-weight:600;">💡 Changed your mind?</p>
<p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
You can cancel this deletion by simply logging into your account before the scheduled date. All your data will remain intact.
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0 0 8px 0;color:#9ca3af;font-size:14px;">
Questions? Contact <a href="mailto:support@scholararchive.com" style="color:#ef4444;text-decoration:none;">support@scholararchive.com</a>
</p>
<p style="margin:0;color:#d1d5db;font-size:13px;">
© ${new Date().getFullYear()} ScholarArchive. All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;

        const mailOptions = {
            from: {
                name: 'ScholarArchive',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '⚠️ Account Deletion Scheduled - ScholarArchive',
            html: html,
            text: `Hi ${firstName}, your ScholarArchive account is scheduled for deletion on ${formattedDate}. To cancel, simply log in before this date.`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Deletion email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

// Send verification OTP email
export const sendVerificationOTP = async (email, userName, otp) => {
    try {
        const transporter = createTransporter();
        const firstName = userName ? userName.split(' ')[0] : 'there';

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fa;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

<!-- Header with logo -->
<tr>
<td style="padding:40px 40px 32px 40px;text-align:center;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<svg width="48" height="48" viewBox="0 0 48 48" style="display:block;margin:0 auto 12px;">
<rect width="48" height="48" rx="12" fill="#10b981"/>
<path d="M24 14L16 20V30C16 31.1 16.9 32 18 32H30C31.1 32 32 31.1 32 30V20L24 14Z" fill="white"/>
<path d="M20 26H28V30H20V26Z" fill="#10b981" opacity="0.5"/>
</svg>
<h2 style="margin:0;color:#1f2937;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ScholarArchive</h2>
</td>
</tr>
</table>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 40px;">
<div style="height:1px;background:#e5e7eb;"></div>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px;">

<!-- Title -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:16px;">
<h1 style="margin:0;color:#1f2937;font-size:28px;font-weight:700;">Verify Your Email</h1>
</td>
</tr>
</table>

<!-- Message -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:24px;">
<p style="margin:0;color:#6b7280;font-size:16px;line-height:1.6;">
Hi <strong style="color:#1f2937;">${firstName}</strong>, use the code below to verify your email and complete your registration:
</p>
</td>
</tr>
</table>

<!-- OTP Code -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:24px;">
<div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px 40px;display:inline-block;">
<p style="margin:0;color:#059669;font-size:36px;font-weight:700;letter-spacing:8px;font-family:monospace;">${otp}</p>
</div>
</td>
</tr>
</table>

<!-- Timer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:24px;">
<p style="margin:0;color:#f59e0b;font-size:14px;font-weight:600;">⏱ This code expires in 10 minutes</p>
</td>
</tr>
</table>

<!-- Security note -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;">
<p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
<strong>🛡️ Security tip:</strong> Never share this code with anyone. Our team will never ask for your OTP.
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0 0 8px 0;color:#9ca3af;font-size:14px;">
Need help? Contact <a href="mailto:support@scholararchive.com" style="color:#10b981;text-decoration:none;">support@scholararchive.com</a>
</p>
<p style="margin:0;color:#d1d5db;font-size:13px;">
© ${new Date().getFullYear()} ScholarArchive. All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;

        const mailOptions = {
            from: {
                name: 'ScholarArchive',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '✅ Verify Your Email - ScholarArchive',
            html: html,
            text: `Hi ${firstName}, your verification code is: ${otp}. This code expires in 10 minutes.`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

export default { sendPasswordResetEmail, sendDeletionScheduledEmail, sendVerificationOTP };

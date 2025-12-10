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

// Password reset email template
const getPasswordResetTemplate = (userName, resetUrl) => {
    const firstName = userName ? userName.split(' ')[0] : 'there';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

<!-- Brand Header with Gradient -->
<tr>
<td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:0;height:200px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:60px 40px;">
<h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Reset Your Password</h1>
</td>
</tr>
</table>
</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:48px 40px;">

<p style="margin:0 0 24px 0;color:#111827;font-size:16px;line-height:1.6;">
Hello ${firstName},
</p>

<p style="margin:0 0 32px 0;color:#4b5563;font-size:15px;line-height:1.7;">
We received a request to reset your password for your ScholarArchive account. To create a new password, please click the button below.
</p>

<!-- Button -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:0 0 32px 0;">
<a href="${resetUrl}" style="display:inline-block;background:#1f2937;color:#ffffff;text-decoration:none;padding:14px 32px;font-size:15px;font-weight:600;border-radius:4px;">Reset Password</a>
</td>
</tr>
</table>

<p style="margin:0 0 24px 0;color:#6b7280;font-size:14px;line-height:1.6;">
This link will expire in 1 hour for security reasons.
</p>

<p style="margin:0 0 8px 0;color:#4b5563;font-size:14px;line-height:1.6;">
If you didn't request this password reset, please ignore this email. Your account remains secure.
</p>

<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">
Thanks,
</p>
<p style="margin:4px 0 0 0;color:#4b5563;font-size:14px;line-height:1.6;">
The ScholarArchive Team
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f9fafb;padding:32px 40px;border-top:1px solid #e5e7eb;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<p style="margin:0 0 16px 0;color:#1f2937;font-size:16px;font-weight:700;">ScholarArchive</p>
<p style="margin:0 0 4px 0;color:#6b7280;font-size:13px;">
Please do not reply directly to this email.
</p>
<p style="margin:0 0 16px 0;color:#6b7280;font-size:13px;">
Copyright © ${new Date().getFullYear()} ScholarArchive. All rights reserved.
</p>
<p style="margin:0;color:#9ca3af;font-size:12px;">
<a href="mailto:support@scholararchive.com" style="color:#667eea;text-decoration:none;">Contact Us</a> | 
<a href="#" style="color:#667eea;text-decoration:none;">Privacy Statement</a>
</p>
</td>
</tr>
</table>
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
            subject: 'Reset Your Password - ScholarArchive',
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
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:0;height:200px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:60px 40px;">
<h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Account Deletion Notice</h1>
</td>
</tr>
</table>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:48px 40px;">

<p style="margin:0 0 24px 0;color:#111827;font-size:16px;line-height:1.6;">
Hello ${firstName},
</p>

<p style="margin:0 0 32px 0;color:#4b5563;font-size:15px;line-height:1.7;">
Your ScholarArchive account has been scheduled for deletion. Your account and all associated data will be permanently removed on:
</p>

<!-- Date Box -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:0 0 32px 0;">
<div style="background:#fef2f2;border:2px solid #fecaca;padding:20px 32px;display:inline-block;border-radius:4px;">
<p style="margin:0;color:#991b1b;font-size:18px;font-weight:700;">${formattedDate}</p>
</div>
</td>
</tr>
</table>

<p style="margin:0 0 24px 0;color:#4b5563;font-size:15px;line-height:1.7;">
<strong>What happens next:</strong>
</p>

<p style="margin:0 0 12px 0;color:#4b5563;font-size:14px;line-height:1.6;">
• All account data will be permanently deleted<br>
• Saved articles and research notes will be removed<br>
• Account preferences and settings will be erased
</p>

<p style="margin:32px 0 24px 0;color:#059669;font-size:15px;line-height:1.7;background:#f0fdf4;padding:16px;border-left:4px solid #10b981;">
<strong>Changed your mind?</strong> You can cancel this deletion by logging into your account before the scheduled date. All your data will remain intact.
</p>

<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">
Thanks,
</p>
<p style="margin:4px 0 0 0;color:#4b5563;font-size:14px;line-height:1.6;">
The ScholarArchive Team
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f9fafb;padding:32px 40px;border-top:1px solid #e5e7eb;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<p style="margin:0 0 16px 0;color:#1f2937;font-size:16px;font-weight:700;">ScholarArchive</p>
<p style="margin:0 0 4px 0;color:#6b7280;font-size:13px;">
Please do not reply directly to this email.
</p>
<p style="margin:0 0 16px 0;color:#6b7280;font-size:13px;">
Copyright © ${new Date().getFullYear()} ScholarArchive. All rights reserved.
</p>
<p style="margin:0;color:#9ca3af;font-size:12px;">
<a href="mailto:support@scholararchive.com" style="color:#dc2626;text-decoration:none;">Contact Us</a> | 
<a href="#" style="color:#dc2626;text-decoration:none;">Privacy Statement</a>
</p>
</td>
</tr>
</table>
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
            subject: 'Account Deletion Scheduled - ScholarArchive',
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
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:0;height:200px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:60px 40px;">
<h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Verify Your Email</h1>
</td>
</tr>
</table>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:48px 40px;">

<p style="margin:0 0 24px 0;color:#111827;font-size:16px;line-height:1.6;">
Hello ${firstName},
</p>

<p style="margin:0 0 32px 0;color:#4b5563;font-size:15px;line-height:1.7;">
Thank you for creating a ScholarArchive account. To complete your registration, please verify your email address by entering the code below:
</p>

<!-- OTP Code -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:0 0 32px 0;">
<div style="background:#f0fdf4;border:2px solid #86efac;padding:24px 48px;display:inline-block;border-radius:4px;">
<p style="margin:0;color:#065f46;font-size:40px;font-weight:700;letter-spacing:12px;font-family:monospace;">${otp}</p>
</div>
</td>
</tr>
</table>

<p style="margin:0 0 24px 0;color:#6b7280;font-size:14px;line-height:1.6;">
This verification code will expire in 10 minutes.
</p>

<p style="margin:0 0 8px 0;color:#4b5563;font-size:14px;line-height:1.6;">
If you didn't create this account, please ignore this email.
</p>

<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">
Thanks,
</p>
<p style="margin:4px 0 0 0;color:#4b5563;font-size:14px;line-height:1.6;">
The ScholarArchive Team
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f9fafb;padding:32px 40px;border-top:1px solid #e5e7eb;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<p style="margin:0 0 16px 0;color:#1f2937;font-size:16px;font-weight:700;">ScholarArchive</p>
<p style="margin:0 0 4px 0;color:#6b7280;font-size:13px;">
Please do not reply directly to this email.
</p>
<p style="margin:0 0 16px 0;color:#6b7280;font-size:13px;">
Copyright © ${new Date().getFullYear()} ScholarArchive. All rights reserved.
</p>
<p style="margin:0;color:#9ca3af;font-size:12px;">
<a href="mailto:support@scholararchive.com" style="color:#059669;text-decoration:none;">Contact Us</a> | 
<a href="#" style="color:#059669;text-decoration:none;">Privacy Statement</a>
</p>
</td>
</tr>
</table>
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
            subject: 'Verify Your Email - ScholarArchive',
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

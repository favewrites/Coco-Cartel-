const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// ============================================
// CONFIG
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

// ============================================
// EMAIL TRANSPORT
// ============================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================
// HELPERS
// ============================================
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const sendResponse = (res, status, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(status).json(response);
};

// ============================================
// REGISTER
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return sendResponse(res, 400, false, 'First name, last name, email, and password are required');
    }

    if (password.length < 6) {
      return sendResponse(res, 400, false, 'Password must be at least 6 characters');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendResponse(res, 409, false, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      isAdmin: false
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return sendResponse(res, 201, true, 'Registration successful', {
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    return sendResponse(res, 500, false, 'Server error during registration');
  }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendResponse(res, 200, true, 'Login successful', {
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, 500, false, 'Server error during login');
  }
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', authMiddleware, async (req, res) => {
  return sendResponse(res, 200, true, 'Logout successful');
});

// ============================================
// GET CURRENT USER
// ============================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User retrieved successfully', { user });

  } catch (error) {
    console.error('Get user error:', error);
    return sendResponse(res, 500, false, 'Server error');
  }
});

// ============================================
// FORGOT PASSWORD
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, false, 'Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendResponse(res, 200, true, 'If an account exists, a reset link has been sent');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request — Coco Cartel',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your Coco Cartel account.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#C9A227;color:#0D0D0D;padding:12px 24px;text-decoration:none;display:inline-block;font-weight:600;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    return sendResponse(res, 200, true, 'If an account exists, a reset link has been sent');

  } catch (error) {
    console.error('Forgot password error:', error);
    return sendResponse(res, 500, false, 'Server error');
  }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return sendResponse(res, 400, false, 'Password must be at least 6 characters');
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return sendResponse(res, 200, true, 'Password reset successful');

  } catch (error) {
    console.error('Reset password error:', error);
    return sendResponse(res, 500, false, 'Server error');
  }
});

// ============================================
// CHANGE PASSWORD
// ============================================
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, 400, false, 'Current and new password are required');
    }

    if (newPassword.length < 6) {
      return sendResponse(res, 400, false, 'New password must be at least 6 characters');
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return sendResponse(res, 401, false, 'Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return sendResponse(res, 200, true, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return sendResponse(res, 500, false, 'Server error');
  }
});

module.exports = router;
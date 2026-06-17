const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user info to request
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, access denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Verify the authenticated user has admin privileges
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { auth, adminAuth, authMiddleware: auth };
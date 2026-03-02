const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: generate token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined; // strip password from response
  res.status(statusCode).json({ success: true, token, user });
};

// ── POST /api/auth/register ────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, phone });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// ── PUT /api/auth/update-profile ──────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/change-password ─────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

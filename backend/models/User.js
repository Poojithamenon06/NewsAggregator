// ─── models/User.js ───────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: '', // initials-based avatar generated on frontend
    },
    preferences: {
      categories: { type: [String], default: ['general'] },
      country:    { type: String,   default: 'us' },
      theme:      { type: String,   default: 'dark' },
    },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare password method ───────────────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Safe user object (strip password) ────────────────────────────────────────
UserSchema.methods.toSafeObject = function () {
  return {
    _id:         this._id,
    name:        this.name,
    email:       this.email,
    avatar:      this.avatar,
    preferences: this.preferences,
    createdAt:   this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);

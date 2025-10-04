'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const ROLES = ['admin', 'user'];

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // exclude by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving if modified
UserSchema.pre('save', async function hashPassword(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// PUBLIC_INTERFACE
UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  /** Compare a plain text password against the hashed password. */
  return bcrypt.compare(candidate, this.password);
};

// PUBLIC_INTERFACE
UserSchema.statics.safeFields = function safeFields() {
  /** Fields safe for returning in APIs. */
  return ['_id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'];
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

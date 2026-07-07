import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import UserModel from '../models/User';
import { getIsConnected } from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { localDB } from '../local-db';
import { sanitizeBody, validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();
// POST /api/users/register - Register a user
router.post('/register', sanitizeBody, validateRegistration, async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const { name, email, password } = req.body;

    if (dbConnected) {
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const isInitialAdmin = email.trim().toLowerCase() === 'pankesh2008@gmail.com' ||
        (process.env.INITIAL_ADMIN_EMAIL && email.trim().toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase());

      const newUser = new UserModel({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: isInitialAdmin ? 'admin' : 'user'
      });

      await newUser.save();

      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } else {
      console.log('⚠️ Database disconnected, using local file DB fallback for registration');
      const existingUser = localDB.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
      const isInitialAdmin = email.trim().toLowerCase() === 'pankesh2008@gmail.com' ||
        (process.env.INITIAL_ADMIN_EMAIL && email.trim().toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase());

      const newUser = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: isInitialAdmin ? 'admin' : 'user'
      };

      localDB.saveUser(newUser);

      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// POST /api/users/login - User login
router.post('/login', sanitizeBody, validateLogin, async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const { email, password } = req.body;

    if (dbConnected) {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Ensure initial admin is promoted if not already
      const isInitialAdmin = user.email.toLowerCase() === 'pankesh2008@gmail.com' ||
        (process.env.INITIAL_ADMIN_EMAIL && user.email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase());
      
      if (isInitialAdmin && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log(`✅ [Dynamic Admin Promotion] Successfully promoted ${user.email} to Admin on login in MongoDB Atlas!`);
      }

      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      console.log('⚠️ Database disconnected, using local file DB fallback for login');
      const user = localDB.findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Ensure initial admin is promoted if not already
      const isInitialAdmin = user.email.toLowerCase() === 'pankesh2008@gmail.com' ||
        (process.env.INITIAL_ADMIN_EMAIL && user.email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase());
      
      if (isInitialAdmin && user.role !== 'admin') {
        localDB.updateUserRole(user._id, 'admin');
        user.role = 'admin';
        console.log(`✅ [Dynamic Admin Promotion] Successfully promoted ${user.email} to Admin on login in Local File DB!`);
      }

      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    if (dbConnected) {
      const user = await UserModel.findById(req.user?.id).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } else {
      console.log('⚠️ Database disconnected, using local file DB fallback for profile retrieve');
      const user = localDB.findUserById(req.user?.id || '');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving user', error: error.message });
  }
});

// GET /api/users/wishlist - Get current user's wishlist
router.get('/wishlist', authMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();
  try {
    if (dbConnected) {
      const user = await UserModel.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user.wishlist || []);
    } else {
      const user = localDB.findUserById(req.user?.id || '');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user.wishlist || []);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving wishlist', error: error.message });
  }
});

// POST /api/users/wishlist - Toggle product in wishlist
router.post('/wishlist', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  const dbConnected = getIsConnected();
  try {
    if (dbConnected) {
      const user = await UserModel.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const wishlist = user.wishlist || [];
      const idx = wishlist.indexOf(productId);
      if (idx === -1) {
        wishlist.push(productId);
      } else {
        wishlist.splice(idx, 1);
      }
      
      user.wishlist = wishlist;
      await user.save();
      res.json(user.wishlist);
    } else {
      const updatedWishlist = localDB.toggleWishlist(req.user?.id || '', productId);
      res.json(updatedWishlist);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating wishlist', error: error.message });
  }
});

// GET /api/users - Get all users (Admins only)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    if (dbConnected) {
      const users = await UserModel.find({}).select('-passwordHash').sort({ createdAt: -1 });
      res.json(users);
    } else {
      console.log('⚠️ Database disconnected, returning users from local file DB');
      const users = localDB.getUsers().map(({ passwordHash, ...u }) => u);
      res.json(users);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving all users', error: error.message });
  }
});

// PUT /api/users/:id/role - Change user role (Admins only)
router.put('/:id/role', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const dbConnected = getIsConnected();

  if (!role || (role !== 'user' && role !== 'admin')) {
    return res.status(400).json({ message: 'Valid role ("user" or "admin") is required' });
  }

  try {
    if (dbConnected) {
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent admin from removing their own admin privileges by mistake if needed, but allow it if requested
      user.role = role as 'user' | 'admin';
      await user.save();

      const userRes = await UserModel.findById(id).select('-passwordHash');
      res.json(userRes);
    } else {
      console.log('⚠️ Database disconnected, updating user role in local file DB fallback');
      const updatedUser = localDB.updateUserRole(id, role as 'user' | 'admin');
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating user role', error: error.message });
  }
});

// Helper to send real password reset email using nodemailer
async function sendResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
  console.log("1. Starting sendResetEmail");
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !portStr || !user || !pass || !from) {
    throw new Error('Email sending failed because SMTP credentials are not fully configured in your environment variables. Please ensure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM are all set.');
  }

  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    throw new Error('SMTP_PORT environment variable must be a valid number.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
  } catch (err) {
    console.error("❌ SMTP VERIFY FAILED:", err);
    throw err;
  }

  const mailOptions = {
    from: `"PixelMart" <${from}>`,
    to: email,
    subject: 'Password Reset Request for PixelMart',
    text: `Hello ${name},

We received a request to reset your password for your PixelMart account. Click the link below to securely set a new password:

${resetUrl}

This link is valid for 15 minutes.
If you did not make this request, you can ignore this.`,
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #171717; margin: 0; font-size: 24px; font-weight: 700;">PixelMart</h1>
  </div>
  <p style="font-size: 14px; color: #404040; line-height: 1.6;">Hello ${name},</p>
  <p style="font-size: 14px; color: #404040; line-height: 1.6;">We received a request to reset your password for your PixelMart account. Click the button below to securely set a new password:</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${resetUrl}" style="background-color: #171717; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-block;">Reset Password</a>
  </div>
  <p style="font-size: 12px; color: #737373; line-height: 1.6;">This link is valid for 15 minutes. If the button above doesn't work, copy and paste the following URL into your browser:</p>
  <p style="font-size: 11px; color: #a3a3a3; word-break: break-all; background-color: #f5f5f5; padding: 8px 12px; border-radius: 6px; font-family: monospace;">${resetUrl}</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #737373; line-height: 1.6;">If you did not make this request, you can safely ignore this email.</p>
</div>`
  };

  await transporter.sendMail(mailOptions);
  console.log("3. Email sent successfully");
}

// POST /api/users/forgot-password - Handle forgot password token generation
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const dbConnected = getIsConnected();
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    let userFound = false;
    let name = 'Customer';

    if (dbConnected) {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (user) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expiry;
        await user.save();
        userFound = true;
        name = user.name;
      }
    } else {
      const user = localDB.saveResetToken(email, token, expiry.toISOString());
      if (user) {
        userFound = true;
        name = user.name;
      }
    }

    // Build reset URL
    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Elegant simulated email logger (kept as backup/fallback)
    console.log(`
┌────────────────────────────────────────────────────────┐
│               📧 PIXELMART SIMULATED EMAIL            │
├────────────────────────────────────────────────────────┤
│ To: ${email}
│ Subject: Password Reset Request for PixelMart
├────────────────────────────────────────────────────────┤
│ Hello ${name},
│
│ We received a request to reset your password. Click the
│ link below to securely set a new password:
│
│ ${resetUrl}
│
│ This link is valid for 15 minutes.
│ If you did not make this request, you can ignore this.
└────────────────────────────────────────────────────────┘
`);

    // If user exists, send actual email using nodemailer
    if (userFound) {
      await sendResetEmail(email.toLowerCase(), name, resetUrl);
    }

    // Return success response. Also return resetLink to make it exceptionally easy to click and test
    return res.json({
      success: true,
      message: 'If an account exists with that email, reset instructions have been sent.',
      resetLink: resetUrl // Returned for development/testing ease
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: 'Error processing forgot password request', error: error.message });
  }
});

// POST /api/users/reset-password - Reset password using token
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  const dbConnected = getIsConnected();

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (dbConnected) {
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      user.passwordHash = passwordHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({ success: true, message: 'Password has been reset successfully.' });
    } else {
      const user = localDB.resetPasswordWithToken(token, passwordHash);

      if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      return res.json({ success: true, message: 'Password has been reset successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// GET /api/users/test-email - Temporary email testing endpoint
router.get('/test-email', async (req: Request, res: Response) => {
  try {
    await sendResetEmail('sahupankesh7@gmail.com', 'Test User', 'https://example.com');
    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

import fs from 'fs';
import path from 'path';

export default router;

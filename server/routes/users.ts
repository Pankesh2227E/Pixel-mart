import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { getIsConnected } from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { localDB } from '../local-db';
import { sanitizeBody, validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

// POST /api/users/register - Register a user
router.post('/register', sanitizeBody, validateRegistration, async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const { name, email, password } = req.body;

    if (dbConnected) {
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
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
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
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
        return res.status(400).json({ message: 'User with this email already exists' });
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
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
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

      // Create JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
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

      // Create JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
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

// POST /api/users/forgot-password - Handle forgot password token generation
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const dbConnected = getIsConnected();
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiry = new Date(Date.now() + 3600000); // 1 hour

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
      const users = localDB.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expiry.toISOString();
        // Since getUsers() is a read, we should persist back to file
        const db = {
          users,
          orders: localDB.getOrders(),
          products: localDB.getProducts(),
          categories: localDB.getCategories()
        };
        fs.writeFileSync(path.join(process.cwd(), 'server', 'local-db.json'), JSON.stringify(db, null, 2), 'utf8');
        userFound = true;
        name = user.name;
      }
    }

    // Build reset URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Elegant simulated email logger
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
│ This link is valid for 1 hour.
│ If you did not make this request, you can ignore this.
└────────────────────────────────────────────────────────┘
`);

    // Return success response. Also return resetLink to make it exceptionally easy to click and test
    return res.json({
      success: true,
      message: 'If an account exists with that email, reset instructions have been sent.',
      resetLink: resetUrl // Returned for development/testing ease
    });
  } catch (error: any) {
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
      const users = localDB.getUsers();
      const user = users.find(u => 
        u.resetPasswordToken === token && 
        u.resetPasswordExpires && 
        new Date(u.resetPasswordExpires).getTime() > Date.now()
      );

      if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      user.passwordHash = passwordHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      const db = {
        users,
        orders: localDB.getOrders(),
        products: localDB.getProducts(),
        categories: localDB.getCategories()
      };
      fs.writeFileSync(path.join(process.cwd(), 'server', 'local-db.json'), JSON.stringify(db, null, 2), 'utf8');

      return res.json({ success: true, message: 'Password has been reset successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

import fs from 'fs';
import path from 'path';

export default router;

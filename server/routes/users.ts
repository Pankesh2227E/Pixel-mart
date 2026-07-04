import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { getIsConnected } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { localDB } from '../local-db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

// POST /api/users/register - Register a user
router.post('/register', async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (dbConnected) {
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const newUser = new UserModel({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'user' // default role
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
      const newUser = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'user'
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
router.post('/login', async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

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

export default router;

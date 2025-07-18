import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'WTiA6GzMYGe+8gbWW1i2TKXVrQBiDinUbJ4Tai4ue6E=';

// User login endpoint
authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
      sameSite: 'strict'
    });

    // 6. Return user data (without password)
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token // Also return token in response (for mobile/clients that can't use cookies)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default authRoutes;
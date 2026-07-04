/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';

// Helper to strip HTML tags and prevent basic XSS scripts
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Deep sanitization of objects to handle nested inputs safely
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      } else if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        // Sanitize nested objects up to 1 level (e.g., shippingAddress)
        for (const subKey in req.body[key]) {
          if (typeof req.body[key][subKey] === 'string') {
            req.body[key][subKey] = sanitizeString(req.body[key][subKey]);
          }
        }
      }
    }
  }
  next();
}

export function validateRegistration(req: Request, res: Response, next: NextFunction) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long.' });
  }

  if (name.length > 50) {
    return res.status(400).json({ message: 'Name cannot exceed 50 characters.' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 100) {
    return res.status(400).json({ message: 'Please provide a valid, properly formatted email address (max 100 characters).' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (password.length > 128) {
    return res.status(400).json({ message: 'Password cannot exceed 128 characters.' });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  next();
}

export function validateContact(req: Request, res: Response, next: NextFunction) {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required (name, email, subject, message).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ message: 'Message cannot exceed 2000 characters.' });
  }

  if (subject.length > 150) {
    return res.status(400).json({ message: 'Subject cannot exceed 150 characters.' });
  }

  next();
}

export function validateReview(req: Request, res: Response, next: NextFunction) {
  const { rating, comment } = req.body;

  if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
    return res.status(400).json({ message: 'Comment must be at least 3 characters long.' });
  }

  if (comment.length > 1000) {
    return res.status(400).json({ message: 'Comment cannot exceed 1000 characters.' });
  }

  next();
}

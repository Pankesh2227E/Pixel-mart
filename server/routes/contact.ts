import { Router, Request, Response } from 'express';
import mongoose, { Schema, Model } from 'mongoose';
import { getIsConnected } from '../db';
import { localDB } from '../local-db';
import { sanitizeBody, validateContact } from '../middleware/validation';
import fs from 'fs';
import path from 'path';

const router = Router();

// Mongoose Contact Schema
interface IContact {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ContactModel: Model<IContact> = mongoose.models.Contact
  ? (mongoose.models.Contact as Model<IContact>)
  : mongoose.model<IContact>('Contact', ContactSchema);

// POST /api/contact - Send message
router.post('/', sanitizeBody, validateContact, async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  const dbConnected = getIsConnected();

  try {
    if (dbConnected) {
      const newContact = new ContactModel({ name, email, subject, message });
      await newContact.save();
    } else {
      // Local fallback
      const dbFile = path.join(process.cwd(), 'server', 'local-db.json');
      let currentDB: any = { users: [], orders: [], products: [], categories: [], contactMessages: [] };
      if (fs.existsSync(dbFile)) {
        currentDB = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      }
      if (!currentDB.contactMessages) {
        currentDB.contactMessages = [];
      }
      currentDB.contactMessages.push({
        _id: 'msg_' + Math.random().toString(36).substring(2, 11),
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync(dbFile, JSON.stringify(currentDB, null, 2), 'utf8');
    }

    // Output simulated email to the console
    console.log(`
┌────────────────────────────────────────────────────────┐
│            📬 NEW CONTACT US MESSAGE RECEIVED          │
├────────────────────────────────────────────────────────┤
│ From: ${name} <${email}>
│ Subject: ${subject}
├────────────────────────────────────────────────────────┤
│ Message:
│ ${message}
│
│ Date: ${new Date().toLocaleString()}
└────────────────────────────────────────────────────────┘
`);

    return res.json({
      success: true,
      message: 'Your message has been sent successfully. Our support team will get back to you shortly!'
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process contact message', error: error.message });
  }
});

export default router;

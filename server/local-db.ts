/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'server', 'local-db.json');

interface LocalUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt?: string;
}

interface LocalOrder {
  _id: string;
  id: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: any;
  paymentMethod: string;
  date: string;
  status: string;
  user?: string;
  createdAt?: string;
}

interface LocalDB {
  users: LocalUser[];
  orders: LocalOrder[];
}

function readDB(): LocalDB {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Try creating directory if it doesn't exist
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], orders: [] }, null, 2), 'utf8');
      return { users: [], orders: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return { users: [], orders: [] };
  }
}

function writeDB(data: LocalDB) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
}

export const localDB = {
  getUsers: () => readDB().users,
  saveUser: (user: LocalUser) => {
    const db = readDB();
    db.users.push(user);
    writeDB(db);
  },
  findUserByEmail: (email: string) => {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id: string) => {
    return readDB().users.find(u => u._id === id);
  },
  getOrders: () => readDB().orders,
  saveOrder: (order: LocalOrder) => {
    const db = readDB();
    db.orders.push(order);
    writeDB(db);
  },
  findOrdersByUser: (userId: string) => {
    return readDB().orders.filter(o => o.user === userId);
  },
  findOrderById: (orderId: string) => {
    return readDB().orders.find(o => o.id === orderId);
  }
};

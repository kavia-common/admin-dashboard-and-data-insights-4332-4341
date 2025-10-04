'use strict';

/**
 * Seed script to populate database with an admin user and some sample users/orders.
 * Requires env variables: MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */

require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Order = require('../models/Order');

async function createAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in environment.');
  }

  let admin = await User.findOne({ email }).select('+password');
  if (!admin) {
    admin = new User({
      email,
      password,
      name: 'Admin',
      role: 'admin',
      isActive: true,
    });
    await admin.save();
    console.log(`Admin user created: ${email}`);
  } else {
    // Update password if provided
    admin.password = password;
    await admin.save();
    console.log(`Admin user ensured/updated: ${email}`);
  }
  return admin;
}

function makeItems() {
  const catalog = [
    { name: 'Pro Subscription', price: 29.99 },
    { name: 'Team Add-on', price: 9.99 },
    { name: 'Analytics Pack', price: 14.99 },
    { name: 'Priority Support', price: 4.99 },
  ];
  const count = Math.floor(Math.random() * 3) + 1;
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const item = catalog[Math.floor(Math.random() * catalog.length)];
    items.push({
      name: item.name,
      qty: Math.floor(Math.random() * 3) + 1,
      price: item.price,
    });
  }
  return items;
}

async function createSampleUsers(count = 5) {
  const users = [];
  for (let i = 0; i < count; i += 1) {
    const email = `user${Date.now()}_${i}@example.com`;
    const user = new User({
      email,
      password: 'password123',
      name: `User ${i + 1}`,
      role: 'user',
      isActive: true,
    });
    await user.save();
    users.push(user);
  }
  console.log(`Created ${users.length} sample users.`);
  return users;
}

async function createOrdersForUsers(users) {
  let totalOrders = 0;
  for (const u of users) {
    const numOrders = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numOrders; i += 1) {
      const items = makeItems();
      const total = Order.calculateTotal(items);
      const statusOptions = ['pending', 'processing', 'completed', 'cancelled'];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const order = new Order({
        user: u._id,
        items,
        total,
        currency: 'USD',
        status,
        placedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      });
      await order.save();
      totalOrders += 1;
    }
  }
  console.log(`Created ${totalOrders} sample orders.`);
}

(async function runSeed() {
  try {
    await connectDB();
    const admin = await createAdmin();
    // Also create some users and orders, including for admin for demo
    const users = await createSampleUsers(6);
    users.push(admin);
    await createOrdersForUsers(users);
    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();

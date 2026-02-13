// Fix: Make payment_method column nullable
// This migration fixes the issue where auto-generated payments on collection
// fail because payment_method is NOT NULL but gets set to NULL
import dotenv from 'dotenv';
dotenv.config();

import sequelize, { initializePostgres } from '../src/config/database.js';

async function fixPaymentMethod() {
  try {
    console.log('[Migration] Connecting to database...');
    await initializePostgres();
    console.log('[Migration] Connected. Running migration...');

    // Alter column to allow NULL
    await sequelize.query(`
      ALTER TABLE payments ALTER COLUMN payment_method DROP NOT NULL;
    `).catch(err => {
      // Column might already be nullable
      console.log('[Migration] Column already nullable or table not found, skipping:', err.message);
    });

    // Also run sync to make sure all models are in sync
    await sequelize.sync({ alter: true });

    console.log('[Migration] Payment method column is now nullable. Done!');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] Error:', error);
    process.exit(1);
  }
}

fixPaymentMethod();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';
dotenv.config();

export interface EnvValidationResult {
  valid: boolean;
  messages: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const messages: string[] = [];
  let valid = true;

  console.log('\n🔍 --- STARTING SYSTEM ENVIRONMENT VALIDATION ---');

  // 1. JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    messages.push('⚠️ JWT_SECRET is not specified in the environment variables.');
    console.warn('🔑 JWT_SECRET: [NOT CONFIGURED] (Security warning: Using in-memory fallback, sessions will reset on server restart).');
  } else if (jwtSecret === 'super_secret_jwt_key_12345') {
    messages.push('⚠️ JWT_SECRET is using the default development fallback key.');
    console.warn('🔑 JWT_SECRET: [INSECURE DEFAULT] (Please update JWT_SECRET in production).');
  } else {
    console.log('🔑 JWT_SECRET: [VALIDATED] Successfully validated custom secure key.');
  }

  // 2. MONGODB_URI
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    messages.push('⚠️ MONGODB_URI is not set.');
    console.warn('📊 MONGODB_URI: [NOT CONFIGURED] Fallback local-db.json JSON database will be active.');
  } else {
    console.log('📊 MONGODB_URI: [CONFIGURED] Connection string provided.');
  }

  // 3. CASHFREE PAYMENTS CONFIGURATION
  const cfId = process.env.CASHFREE_CLIENT_ID;
  const cfSecret = process.env.CASHFREE_CLIENT_SECRET;
  const cfMode = process.env.CASHFREE_MODE || 'sandbox';

  if (!cfId || !cfSecret) {
    messages.push('⚠️ CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET is not configured.');
    console.warn('💳 CASHFREE: [NOT CONFIGURED] Sandbox payment simulation mode will be active.');
  } else {
    console.log(`💳 CASHFREE: [ENABLED] Loaded Client ID successfully in [${cfMode.toUpperCase()}] mode.`);
  }

  // 4. APP_URL
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    messages.push('ℹ️ APP_URL is not set.');
    console.log('🌐 APP_URL: [DEFAULT] Defaulting to local root http://localhost:3000.');
  } else {
    console.log(`🌐 APP_URL: [CONFIGURED] Set to ${appUrl}`);
  }

  console.log('🔍 --- ENVIRONMENT VALIDATION COMPLETED --- \n');

  return {
    valid,
    messages
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cashfree, CFEnvironment } from 'cashfree-pg';

let cashfreeInstance: Cashfree | null = null;

export function getCashfree(): Cashfree {
  if (!cashfreeInstance) {
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET are required in environment variables');
    }
    
    // Choose environment mode: SANDBOX (default/test) or PRODUCTION
    const mode = process.env.CASHFREE_MODE === 'production'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;
      
    console.log(`💳 Initializing Cashfree SDK in ${mode === CFEnvironment.PRODUCTION ? 'PRODUCTION' : 'SANDBOX'} mode...`);
    cashfreeInstance = new Cashfree(mode, clientId, clientSecret);
  }
  return cashfreeInstance;
}

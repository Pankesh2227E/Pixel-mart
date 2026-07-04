import UserModel from './models/User';
import { localDB } from './local-db';
import { getIsConnected } from './db';

/**
 * Automatically promotes a specified email to the admin role.
 * This is executed on server startup and serves as a secure,
 * server-controlled bootstrapping method for the first administrator.
 */
export async function promoteToAdmin(email: string): Promise<void> {
  const targetEmail = email.trim().toLowerCase();
  if (!targetEmail) return;

  const dbConnected = getIsConnected();
  console.log(`👑 [Admin Bootstrapper] Running check for initial admin email: ${targetEmail}`);

  // 1. Promote in MongoDB Atlas if connected
  if (dbConnected) {
    try {
      const user = await UserModel.findOne({ email: targetEmail });
      if (user) {
        if (user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
          console.log(`✅ [Admin Bootstrapper] Successfully promoted user ${targetEmail} to Admin in MongoDB Atlas!`);
        } else {
          console.log(`ℹ️ [Admin Bootstrapper] User ${targetEmail} is already an Admin in MongoDB Atlas.`);
        }
      } else {
        console.log(`ℹ️ [Admin Bootstrapper] User ${targetEmail} does not exist in MongoDB Atlas yet. They will be auto-promoted to Admin on registration.`);
      }
    } catch (err) {
      console.error(`❌ [Admin Bootstrapper] Error checking/promoting admin in MongoDB:`, err);
    }
  } else {
    console.log(`⚠️ [Admin Bootstrapper] MongoDB Atlas is offline. Skipping MongoDB admin promotion check.`);
  }

  // 2. Promote in Local File DB (local-db.json)
  try {
    const localUser = localDB.findUserByEmail(targetEmail);
    if (localUser) {
      if (localUser.role !== 'admin') {
        localDB.updateUserRole(localUser._id, 'admin');
        console.log(`✅ [Admin Bootstrapper] Successfully promoted user ${targetEmail} to Admin in Local File DB!`);
      } else {
        console.log(`ℹ️ [Admin Bootstrapper] User ${targetEmail} is already an Admin in Local File DB.`);
      }
    } else {
      console.log(`ℹ️ [Admin Bootstrapper] User ${targetEmail} does not exist in Local File DB yet. They will be auto-promoted to Admin on registration.`);
    }
  } catch (err) {
    console.error(`❌ [Admin Bootstrapper] Error checking/promoting admin in Local File DB:`, err);
  }
}

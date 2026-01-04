/**
 * Migration script to fix users without password field
 * This script should be run once to fix existing users
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersDbPath = path.join(__dirname, '../../data/users.json');

async function migrateUsers() {
  try {
    console.log('🔄 Starting user migration...');
    
    if (!fs.existsSync(usersDbPath)) {
      console.log('❌ Users database not found');
      return;
    }

    const adapter = new JSONFile(usersDbPath);
    const db = new Low(adapter, { users: {}, lastUpdated: new Date().toISOString() });
    await db.read();

    const users = db.data.users || {};
    let fixedCount = 0;
    let missingPasswordCount = 0;

    for (const [userId, userData] of Object.entries(users)) {
      if (!userData.password) {
        missingPasswordCount++;
        console.log(`⚠️  User ${userData.email} is missing password field`);
        console.log(`   This user needs to re-register or reset password`);
      } else {
        // Ensure all required fields are present
        const fixedUser = {
          id: userData.id || userId,
          email: userData.email || '',
          password: userData.password,
          name: userData.name || '',
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
          lastLogin: userData.lastLogin || null,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          sessions: userData.sessions || []
        };
        
        db.data.users[userId] = fixedUser;
        fixedCount++;
      }
    }

    if (missingPasswordCount > 0) {
      console.log(`\n⚠️  Found ${missingPasswordCount} user(s) without password`);
      console.log(`   These users need to re-register`);
    }

    if (fixedCount > 0) {
      db.data.lastUpdated = new Date().toISOString();
      await db.write();
      console.log(`\n✅ Fixed ${fixedCount} user(s)`);
    } else {
      console.log(`\n✅ No users needed fixing`);
    }

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateUsers();



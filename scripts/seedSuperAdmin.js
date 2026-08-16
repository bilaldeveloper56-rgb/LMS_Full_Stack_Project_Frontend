import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';
import User from '../src/modules/users/user.model.js';
import { ROLES, USER_STATUS, AUTH_EVENTS } from '../src/constants/index.js';
import { logAuditEvent } from '../src/modules/audit/audit.service.js';

/**
 * Seed the initial platform SUPER_ADMIN account.
 * Enforces the core business rule: EXACTLY ONE platform-level SUPER_ADMIN.
 * If one already exists, aborts idempotently without creating duplicates.
 */
async function seedSuperAdmin() {
  try {
    logger.info('Initializing Super Admin seed process...');
    await connectDB();

    // 1. Check if Super Admin already exists
    const existingSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (existingSuperAdmin) {
      logger.warn(
        `Super Admin already exists with email '${existingSuperAdmin.email}'. Creation aborted. Platform allows exactly ONE Super Admin.`
      );
      await disconnectDB();
      process.exit(0);
    }

    // 2. Hash password
    const hashedPassword = await User.hashPassword(env.SUPER_ADMIN_PASSWORD);

    // 3. Create Super Admin
    const superAdmin = await User.create({
      firstName: env.SUPER_ADMIN_FIRST_NAME,
      lastName: env.SUPER_ADMIN_LAST_NAME,
      email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
      passwordHash: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      schoolId: null, // Strictly null for Super Admin
      status: USER_STATUS.ACTIVE,
      emailVerified: true,
      passwordChangedAt: new Date(),
    });

    // 4. Log audit event
    await logAuditEvent({
      event: AUTH_EVENTS.SUPER_ADMIN_SEEDED,
      userId: superAdmin._id,
      entityType: 'User',
      entityId: superAdmin._id,
      details: {
        email: superAdmin.email,
        role: ROLES.SUPER_ADMIN,
      },
    });

    logger.info(
      `✅ Platform SUPER_ADMIN created successfully: ${superAdmin.email}`
    );

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to seed Super Admin:', error);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

seedSuperAdmin();

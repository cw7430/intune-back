import { sql } from 'drizzle-orm';
import {
  pgSchema,
  bigint,
  varchar,
  timestamp,
  boolean,
  primaryKey,
  foreignKey,
  unique,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';

import {
  timestampForCreateOnly,
  timestampsForSoftDelete,
} from '@/common/database/helpers';

export const userSchema = pgSchema('user');

export const genderEnum = userSchema.enum('gender', ['MALE', 'FEMALE']);

export const authTypeEnum = userSchema.enum('auth_type', [
  'NATIVE',
  'SOCIAL',
  'CROSS',
]);

export const authRoleEnum = userSchema.enum('auth_role', [
  'USER',
  'ADMIN',
  'LEFT',
]);

export const user = userSchema.table(
  'user',
  {
    userId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    email: varchar('email', { length: 255 }).notNull(),
    nickName: varchar('nick_name', { length: 255 }),
    gender: genderEnum('gender'),
    authType: authTypeEnum('auth_type').default('NATIVE').notNull(),
    authRole: authRoleEnum('auth_role').default('USER').notNull(),
    ...timestampsForSoftDelete,
  },
  (table) => [
    primaryKey({ name: 'pk_user', columns: [table.userId] }),
    uniqueIndex('uq_user_email')
      .on(table.email)
      .where(sql`${table.authRole} <> 'LEFT'`),
    index('ix_active_user_created_at')
      .on(table.createdAt.desc())
      .where(sql`${table.authRole} <> 'LEFT'`),
    index('ix_delete_user_deleted_at')
      .on(table.deletedAt.desc())
      .where(sql`${table.authRole} = 'LEFT'`),
    check(
      'ck_user_deleted_state',
      sql`(
          (${table.authRole} <> 'LEFT' AND ${table.deletedAt} IS NULL)
          OR
          (${table.authRole} = 'LEFT' AND ${table.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const nativeUser = userSchema.table(
  'native_user',
  {
    nativeUserId: bigint('id', { mode: 'bigint' }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'pk_native_user', columns: [table.nativeUserId] }),
    foreignKey({
      name: 'fk_native_user',
      columns: [table.nativeUserId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const socialUser = userSchema.table(
  'social_user',
  {
    socialUserId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'pk_social_user', columns: [table.socialUserId] }),
    foreignKey({
      name: 'fk_native_user',
      columns: [table.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_social_user_provider').on(
      table.userId,
      table.provider,
      table.providerUserId,
    ),
    check('ck_social_provider', sql`${table.provider} IN ('GOOGLE', 'NAVER')`),
  ],
);

export const profileImage = userSchema.table(
  'profile_image',
  {
    profileImageId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 255 }).notNull(),
    fileSize: bigint('file_size', { mode: 'bigint' }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    ...timestampForCreateOnly,
  },
  (table) => [
    primaryKey({ name: 'pk_profile_image', columns: [table.profileImageId] }),
    foreignKey({
      name: 'fk_profile_image_user',
      columns: [table.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    uniqueIndex('uq_profile_image_default')
      .on(table.userId)
      .where(sql`${table.isDefault} IS TRUE`),
    index('ix_profile_image_user_created_at').on(
      table.userId,
      table.createdAt.desc(),
    ),
  ],
);

export const refreshToken = userSchema.table(
  'refresh_token',
  {
    refreshTokenId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expiredAt: timestamp('expired_at', {
      precision: 6,
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'pk_refresh_token', columns: [table.refreshTokenId] }),
    foreignKey({
      name: 'fk_refresh_token_user',
      columns: [table.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_refresh_token_user').on(table.userId),
    unique('uq_active_refresh_token').on(table.token),
    index('ix_refresh_token_expire').on(table.expiredAt),
  ],
);

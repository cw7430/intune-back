import { sql } from 'drizzle-orm';
import {
  pgSchema,
  bigint,
  text,
  boolean,
  primaryKey,
  foreignKey,
  unique,
  index,
  check,
} from 'drizzle-orm/pg-core';

import { user } from './user.schema';
import { timestampsForSoftDelete } from '@/common/database/helpers';

export const chatSchema = pgSchema('chat');

export const messageType = chatSchema.enum('message_type', [
  'TEXT',
  'IMAGE',
  'FILE',
]);

export const room = chatSchema.table(
  'room',
  {
    roomId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    isDeleted: boolean('is_deleted').notNull().default(false),
    ...timestampsForSoftDelete,
  },
  (table) => [
    primaryKey({ name: 'pk_room', columns: [table.roomId] }),
    index('ix_active_room_updated_at')
      .on(table.updatedAt.desc())
      .where(sql`${table.isDeleted} IS NOT TRUE`),
    index('ix_delete_room_deleted_at')
      .on(table.deletedAt.desc())
      .where(sql`${table.isDeleted} IS TRUE`),
    check(
      'ck_room_deleted_state',
      sql`(
        (${table.isDeleted} IS NOT TRUE AND ${table.deletedAt} IS NULL)
        OR
        (${table.isDeleted} IS TRUE AND ${table.deletedAt} IS NOT NULL)
      )`,
    ),
  ],
);

export const roomMember = chatSchema.table(
  'room_member',
  {
    roomMemberId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    roomId: bigint('room_id', { mode: 'bigint' }).notNull(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    isAccepted: boolean('is_accepted').notNull().default(false),
    lastReadMessageId: bigint('last_read_message_id', {
      mode: 'bigint',
    }),
  },
  (table) => [
    primaryKey({ name: 'pk_room_member', columns: [table.roomMemberId] }),
    foreignKey({
      name: 'fk_room_member',
      columns: [table.roomId],
      foreignColumns: [room.roomId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      name: 'fk_user_room_member',
      columns: [table.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_member_room_composite').on(table.roomMemberId, table.roomId),
    unique('uq_user_room').on(table.userId, table.roomId),
    index('ix_room_member_last_read_message').on(table.lastReadMessageId),
  ],
);

export const message = chatSchema.table(
  'message',
  {
    messageId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    roomId: bigint('room_id', { mode: 'bigint' }).notNull(),
    roomMemberId: bigint('room_member_id', { mode: 'bigint' }).notNull(),
    message: text('message'),
    messageType: messageType('message_type').default('TEXT').notNull(),
    isDeleted: boolean('is_deleted').notNull().default(false),
    ...timestampsForSoftDelete,
  },
  (table) => [
    primaryKey({ name: 'pk_message', columns: [table.messageId] }),
    foreignKey({
      name: 'fk_message_member_room',
      columns: [table.roomMemberId, table.roomId],
      foreignColumns: [roomMember.roomMemberId, roomMember.roomId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_activate_message').on(table.roomId, table.createdAt.desc()),
    index('ix_deleted_message').on(table.roomId, table.deletedAt.desc()),
    check(
      'ck_message_deleted_state',
      sql`(
        (${table.isDeleted} IS NOT TRUE AND ${table.deletedAt} IS NULL)
        OR
        (${table.isDeleted} IS TRUE AND ${table.deletedAt} IS NOT NULL)
      )`,
    ),
    check(
      'ck_message_type',
      sql`(
        ((${table.messageType} = 'TEXT') AND (${table.message} IS NOT NULL))
        OR
        ((${table.messageType} <> 'TEXT') AND (${table.message} IS NULL))
      )`,
    ),
  ],
);

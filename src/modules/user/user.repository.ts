import { Injectable } from '@nestjs/common';
import { sql, eq, ne, and } from 'drizzle-orm';

import * as schema from '@/common/database/schemas';
import { type DbOrTx } from '@/common/database/types';

@Injectable()
export class UserRepository {
  async findNativeSignInInfoByEmail(conn: DbOrTx, email: string) {
    const { user, nativeUser } = schema;
    const { userId, authType, authRole, nickName, gender } = user;
    const { passwordHash } = nativeUser;
    const result = await conn
      .select({
        userId,
        authType,
        passwordHash,
        authRole,
        nickName,
        gender,
      })
      .from(user)
      .where(
        and(
          eq(user.email, email),
          ne(user.authType, 'SOCIAL'),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .innerJoin(nativeUser, eq(user.userId, nativeUser.nativeUserId))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findSocialSignInInfoByProviderId(conn: DbOrTx, providerUserId: string) {
    const { user, socialUser } = schema;
    const { userId, authType, authRole, nickName, gender } = user;
    const result = await conn
      .select({ userId, authType, authRole, nickName, gender })
      .from(socialUser)
      .where(
        and(
          eq(socialUser.providerUserId, providerUserId),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .innerJoin(user, eq(socialUser.userId, user.userId))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findRefreshInfoByUserId(conn: DbOrTx, userId: bigint) {
    const { user } = schema;
    const { authType, authRole, nickName, gender } = user;

    const result = await conn
      .select({
        authType,
        authRole,
        nickName,
        gender,
      })
      .from(user)
      .where(and(eq(user.userId, userId), ne(user.authRole, 'LEFT')))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findRefreshTokenIdByUserIdAndToken(
    conn: DbOrTx,
    userId: bigint,
    token: string,
  ) {
    const { refreshToken } = schema;
    const { refreshTokenId } = refreshToken;

    const result = await conn
      .select({ refreshTokenId })
      .from(refreshToken)
      .where(
        and(eq(refreshToken.userId, userId), eq(refreshToken.token, token)),
      )
      .limit(1);

    return result[0] ?? undefined;
  }

  async createRefreshToken(
    conn: DbOrTx,
    userId: bigint,
    token: string,
    expiresAt: Date,
  ) {
    const { refreshToken } = schema;

    return conn
      .insert(refreshToken)
      .values({ userId, token, expiresAt })
      .returning({ refreshTokenId: refreshToken.refreshTokenId });
  }

  async updateRefreshToken(
    conn: DbOrTx,
    refreshTokenId: bigint,
    token: string,
    expiresAt: Date,
  ) {
    const { refreshToken } = schema;

    return conn
      .update(refreshToken)
      .set({ token, expiresAt })
      .where(eq(refreshToken.refreshTokenId, refreshTokenId))
      .returning({ refreshTokenId: refreshToken.refreshTokenId });
  }

  async deleteRefreshTokenByToken(conn: DbOrTx, token: string) {
    const { refreshToken } = schema;

    return conn.delete(refreshToken).where(eq(refreshToken.token, token));
  }

  async existsByEmail(conn: DbOrTx, email: string) {
    const { user } = schema;

    const [row] = await conn
      .select({ exists: sql<boolean>`true` })
      .from(user)
      .where(
        and(
          eq(user.email, email),
          ne(user.authType, 'SOCIAL'),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .limit(1);

    return !!row;
  }

  async createUser(
    conn: DbOrTx,
    email: string,
    nickName: string | null,
    gender: 'MALE' | 'FEMALE' | null,
    authType: 'NATIVE' | 'SOCIAL' = 'NATIVE',
  ) {
    const { user } = schema;
    return conn
      .insert(user)
      .values({ email, nickName, gender, authType })
      .returning({
        userId: user.userId,
        nickName: user.nickName,
        gender: user.gender,
        authType: user.authType,
        authRole: user.authRole,
      });
  }

  async createNativeUser(
    conn: DbOrTx,
    nativeUserId: bigint,
    passwordHash: string,
  ) {
    const { nativeUser } = schema;
    return conn
      .insert(nativeUser)
      .values({ nativeUserId, passwordHash })
      .returning({ nativeUserId: nativeUser.nativeUserId });
  }

  async createUserOnlineStatus(conn: DbOrTx, userOnlineStatusId: bigint) {
    const { userOnlineStatus } = schema;

    return conn
      .insert(userOnlineStatus)
      .values({ userOnlineStatusId })
      .returning({ userOnlineStatusId: userOnlineStatus.userOnlineStatusId });
  }

  async updateUserEmail(conn: DbOrTx, userId: bigint, email: string) {
    const { user } = schema;
    return conn.update(user).set({ email }).where(eq(user.userId, userId));
  }

  async updateUserNickName(conn: DbOrTx, userId: bigint, nickName: string) {
    const { user } = schema;
    return conn.update(user).set({ nickName }).where(eq(user.userId, userId));
  }

  async updateGender(conn: DbOrTx, userId: bigint, gender: 'MALE' | 'FEMALE') {
    const { user } = schema;
    return conn.update(user).set({ gender }).where(eq(user.userId, userId));
  }

  async updateUserInfo(
    conn: DbOrTx,
    userId: bigint,
    nickName: string,
    gender: 'MALE' | 'FEMALE',
  ) {
    const { user } = schema;
    return conn
      .update(user)
      .set({ nickName, gender })
      .where(eq(user.userId, userId));
  }

  async updateNativeUser(
    conn: DbOrTx,
    nativeUserId: bigint,
    passwordHash: string,
  ) {
    const { nativeUser } = schema;
    return conn
      .update(nativeUser)
      .set({ passwordHash })
      .where(eq(nativeUser.nativeUserId, nativeUserId))
      .returning({ nativeUserId: nativeUser.nativeUserId });
  }

  async updateUserOnlineStatusOnline(conn: DbOrTx, userOnlineStatusId: bigint) {
    const { userOnlineStatus } = schema;
    return conn
      .update(userOnlineStatus)
      .set({ isOnline: true })
      .where(eq(userOnlineStatus.userOnlineStatusId, userOnlineStatusId))
      .returning({ userOnlineStatusId: userOnlineStatus.userOnlineStatusId });
  }

  async updateUserOnlineStatusOffline(
    conn: DbOrTx,
    userOnlineStatusId: bigint,
  ) {
    const { userOnlineStatus } = schema;
    return conn
      .update(userOnlineStatus)
      .set({ isOnline: false, lastSeenAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userOnlineStatus.userOnlineStatusId, userOnlineStatusId))
      .returning({ userOnlineStatusId: userOnlineStatus.userOnlineStatusId });
  }
}

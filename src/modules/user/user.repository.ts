import { Injectable } from '@nestjs/common';
import { sql, eq, ne, and } from 'drizzle-orm';

import * as schema from '@/common/database/schemas';
import { type DbOrTx } from '@/common/database/types';

@Injectable()
export class UserRepository {
  async findNativeSignInInfoByEmail(conn: DbOrTx, email: string) {
    const { user, nativeUser } = schema;
    const { userId, authRole, nickName, gender } = user;
    const { passwordHash } = nativeUser;
    const result = await conn
      .select({
        userId,
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
    const { userId, authRole, nickName, gender } = user;
    const result = await conn
      .select({ userId, authRole, nickName, gender })
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
    const { authRole, nickName, gender } = user;

    const result = await conn
      .select({
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
    expiredAt: Date,
  ) {
    const { refreshToken } = schema;

    return conn
      .insert(refreshToken)
      .values({ userId, token, expiredAt })
      .returning({ id: refreshToken.refreshTokenId });
  }

  async updateRefreshToken(
    conn: DbOrTx,
    refreshTokenId: bigint,
    token: string,
    expiredAt: Date,
  ) {
    const { refreshToken } = schema;

    return conn
      .update(refreshToken)
      .set({ token, expiredAt })
      .where(eq(refreshToken.refreshTokenId, refreshTokenId))
      .returning({ id: refreshToken.refreshTokenId });
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
        id: user.userId,
        nickName: user.nickName,
        gender: user.gender,
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
      .returning({ id: nativeUser.nativeUserId });
  }
}

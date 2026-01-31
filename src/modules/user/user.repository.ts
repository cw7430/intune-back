import { Inject, Injectable } from '@nestjs/common';
import { sql, eq, ne, and } from 'drizzle-orm';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from '@/common/database/schemas';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findNativeSignInInfoByEmail(email: string) {
    const { user, nativeUser } = schema;
    const { userId, authRole, nickName } = user;
    const { passwordHash } = nativeUser;
    const result = await this.db
      .select({
        userId,
        passwordHash,
        authRole,
        nickName,
      })
      .from(user)
      .where(and(eq(user.email, email), ne(user.authRole, 'LEFT')))
      .innerJoin(nativeUser, eq(user.userId, nativeUser.nativeUserId))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findSocialSignInInfoByProviderId(providerUserId: string) {
    const { user, socialUser } = schema;
    const { userId, authRole, nickName } = user;
    const result = await this.db
      .select({ userId, authRole, nickName })
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

  async findRefreshInfoByEmail(userId: bigint) {
    const { user } = schema;
    const { authRole, nickName } = user;

    const result = await this.db
      .select({
        authRole,
        nickName,
      })
      .from(user)
      .where(and(eq(user.userId, userId), ne(user.authRole, 'LEFT')))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findRefreshTokenIdByUserIdAndToken(userId: bigint, token: string) {
    const { refreshToken } = schema;
    const { refreshTokenId } = refreshToken;

    const result = await this.db
      .select({ refreshTokenId })
      .from(refreshToken)
      .where(
        and(eq(refreshToken.userId, userId), eq(refreshToken.token, token)),
      )
      .limit(1);

    return result[0] ?? undefined;
  }

  async createRefreshToken(userId: bigint, token: string, expiredAt: Date) {
    const { refreshToken } = schema;

    const [inserted] = await this.db
      .insert(refreshToken)
      .values({ userId, token, expiredAt })
      .returning({ id: refreshToken.refreshTokenId });

    return inserted.id;
  }

  async updateRefreshToken(refreshTokenId: bigint, token: string) {
    const { refreshToken } = schema;

    const [updated] = await this.db
      .update(refreshToken)
      .set({ token })
      .where(eq(refreshToken.refreshTokenId, refreshTokenId))
      .returning({ id: refreshToken.refreshTokenId });

    return updated.id;
  }

  async deleteRefreshTokenByToken(token: string) {
    const { refreshToken } = schema;

    await this.db.delete(refreshToken).where(eq(refreshToken.token, token));
  }

  async existsByEmail(email: string) {
    const { user } = schema;

    const [row] = await this.db
      .select({ exists: sql<boolean>`true` })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return !!row;
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';

import { UserRepository } from '@/modules/user/user.repository';
import type * as schema from '@/common/database/schemas';

@Injectable()
export class UserService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly userRepository: UserRepository,
  ) {}

  private readonly log = new Logger(UserService.name);

  async updateUserOnline(userId: bigint): Promise<void> {
    const updatedUserStatus = await this.db.transaction(async (tx) => {
      const [updateUserOnlineStatus] =
        await this.userRepository.updateUserOnlineStatusOnline(tx, userId);
      return updateUserOnlineStatus;
    });
    this.log.log(`User is Online: ${updatedUserStatus.userOnlineStatusId}`);
  }

  async updateUserOffline(userId: bigint): Promise<void> {
    const updatedUserStatus = await this.db.transaction(async (tx) => {
      const [updateUserOfflineStatus] =
        await this.userRepository.updateUserOnlineStatusOffline(tx, userId);
      return updateUserOfflineStatus;
    });
    this.log.log(`User is Offline: ${updatedUserStatus.userOnlineStatusId}`);
  }
}

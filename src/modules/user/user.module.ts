import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSharedModule } from '@/modules/shared/user.shared.module';

@Module({
  imports: [UserSharedModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

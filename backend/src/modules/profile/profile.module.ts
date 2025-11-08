/**
 * Profile Module
 * Provides profile viewing and roommate matching functionality
 */

import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserSearchService } from './user-search.service';
import { PrismaModule } from '@core/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService, UserSearchService],
  exports: [ProfileService],
})
export class ProfileModule {}

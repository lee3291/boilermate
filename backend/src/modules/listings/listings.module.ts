import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { MailModule } from '../mail/mail.module';
// import { PrismaModule } from '../../core/database/prisma.module';

@Module({
  imports: [MailModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}

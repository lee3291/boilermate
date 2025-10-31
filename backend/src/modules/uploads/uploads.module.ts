import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service';
import { PrismaModule } from '@core/database/prisma.module';

@Module({
  imports: [PrismaModule], // just in case
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}

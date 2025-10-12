import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { ListingsModule } from '@modules/listings/listings.module'

@Module({
  imports: [PrismaModule, ListingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

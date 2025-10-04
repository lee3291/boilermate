import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { DogsModule } from '@modules/dogs/dogs.module'

@Module({
  imports: [PrismaModule, DogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { DogsModule } from '@modules/dogs/dogs.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, DogsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

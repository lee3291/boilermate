import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { DogsModule } from '@modules/dogs/dogs.module'
import { ChatsModule } from '@modules/chats/chats.module';
import { UploadsModule } from '@modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
      envFilePath: '.env', // Load environment variables
    }),
    PrismaModule, // Database module
    DogsModule, // Dogs feature module
    ChatsModule, // Chat feature module
    UploadsModule, // Image upload module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

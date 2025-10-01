import { Module } from '@nestjs/common';
import { DogsService } from './dogs.service';
import { DogsController } from './dogs.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  // Import PrismaModule to make PrismaService available
  imports: [PrismaModule],
  // Register the controller that handles HTTP requests
  controllers: [DogsController],
  // Register the service that handles business logic
  providers: [DogsService],
  // Export the service if other modules need to use it
  exports: [DogsService],
})
export class DogsModule {}

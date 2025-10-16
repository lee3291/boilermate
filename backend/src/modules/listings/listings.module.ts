import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaModule } from '../../core/database/prisma.module';

@Module({
    imports: [PrismaModule],            // gives ListingsService access to PrismaService
    controllers: [ListingsController],  // your minimal create endpoint lives here
    providers: [ListingsService],       // business logic + Prisma calls
    exports: [ListingsService],         // export if other modules might reuse it
})
export class ListingsModule {}

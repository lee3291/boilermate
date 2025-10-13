import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { DogsModule } from '@modules/dogs/dogs.module';
import { BugReportModule } from './modules/bug-report/bug-report.module';

@Module({
  imports: [PrismaModule, DogsModule, BugReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
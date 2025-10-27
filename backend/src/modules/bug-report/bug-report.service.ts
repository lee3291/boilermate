import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateBugReportDto } from './dto/create-bug-report.dto';

@Injectable()
export class BugReportService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBugReportDto) {
    const payload = {
      title: data.title,
      description: data.description ?? '',
      stepsToReprod: data.stepsToReprod ?? '',
      status: data.status ?? 'open',
    };

    return this.prisma.bugReport.create({ data: payload });
  }
}
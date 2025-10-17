// report.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(data: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        reporterId: data.reporterId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
        comments: data.comments,
        status: 'unresolved',
      },
    });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(id: number) {
    return this.prisma.report.update({
      where: { id },
      data: { status: 'resolved' },
    });
  }

  async deleteReport(id: number) {
    return this.prisma.report.delete({
      where: { id },
    });
  }
}

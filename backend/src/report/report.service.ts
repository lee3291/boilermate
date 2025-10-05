// report.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-report';
import { CreateReportDto } from './dto/create-report.dto';

const prisma = new PrismaClient();

@Injectable()
export class ReportService {
  async createReport(data: CreateReportDto) {
    return await prisma.report.create({
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
    return await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(id: number) {
    return await prisma.report.update({
      where: { id },
      data: { status: 'resolved' },
    });
  }

  async deleteReport(id: number) {
    return await prisma.report.delete({
      where: { id },
    });
  }
}

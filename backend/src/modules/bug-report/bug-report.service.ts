import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { UpdateBugReportDto } from './dto/update-bug-report.dto';
import { BugReportDetails } from './interfaces/bug-report.interface';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class BugReportService {
  private readonly logger = new Logger(BugReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async createBugReport(dto: CreateBugReportDto): Promise<BugReportDetails> {
    try {
      const report = await this.prisma.bugReport.create({
        data: {
          title: dto.title,
          description: dto.description,
          steps: dto.steps,
          userId: dto.userId,
          priority: dto.priority || 'MEDIUM',
          status: 'OPEN',
        },
      });
      this.logger.log(`Created bug report with ID: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error('Failed to create bug report', error);
      throw new InternalServerErrorException('Failed to create bug report');
    }
  }

  async getAllReports(): Promise<BugReportDetails[]> {
    try {
      return await this.prisma.bugReport.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error fetching bug reports', error);
      throw new InternalServerErrorException('Failed to fetch bug reports');
    }
  }

  async getReportById(id: string): Promise<BugReportDetails> {
    const report = await this.prisma.bugReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Bug report not found for ID: ${id}`);
    }
    return report;
  }

  async updateReport(id: string, dto: UpdateBugReportDto): Promise<BugReportDetails> {
    try {
      const existing = await this.getReportById(id);

      const updated = await this.prisma.bugReport.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          description: dto.description ?? existing.description,
          steps: dto.steps ?? existing.steps,
          priority: dto.priority ?? existing.priority,
          status: dto.status ?? existing.status,
          updatedAt: new Date(),
        },
      });

      if (dto.status && dto.status !== existing.status) {
        const email = `${existing.userId}@purdue.edu`;
        await this.sendStatusChangeEmail(email, updated, dto.status);
      }

      return updated;
    } catch (error) {
      this.logger.error('Failed to update bug report', error);
      throw new InternalServerErrorException('Failed to update bug report');
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      await this.prisma.bugReport.delete({ where: { id } });
      this.logger.log(`Deleted bug report with ID: ${id}`);
    } catch (error) {
      this.logger.error('Failed to delete bug report', error);
      throw new InternalServerErrorException('Failed to delete bug report');
    }
  }

  private async sendStatusChangeEmail(to: string, report: BugReportDetails, newStatus: string) {
    try {
      await this.mailService.sendEmail(
        to,
        `Bug Report ${report.id} Status Update`,
        `Your bug report titled "${report.title}" has been updated to status: ${newStatus}.`,
      );
      this.logger.log(`Sent status update email to: ${to}`);
    } catch (error) {
      this.logger.warn(`Failed to send status update email to ${to}: ${error.message}`);
    }
  }
}

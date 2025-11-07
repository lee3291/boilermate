import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@core/database/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateUserReportDto } from "./dto/create-user-report.dto";
import { UpdateUserReportDto } from "./dto/update-user-report.dto";

@Injectable()
export class UserReportService {
  private readonly logger = new Logger(UserReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  // Create user report
  async createUserReport(dto: CreateUserReportDto) {
    try {
      const report = await this.prisma.userReport.create({
        data: {
          userId: dto.userId,
          reportedUserId: dto.reportedUserId,
          reason: dto.reason,
          comments: dto.comments,
          status: "UNRESOLVED",
        },
      });

      this.logger.log(`Created user report with ID: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error("Failed to create user report", error);
      throw new InternalServerErrorException("Failed to create user report");
    }
  }

  //  Fetch all reports
  async getAllReports() {
    try {
      return await this.prisma.userReport.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      this.logger.error("Error fetching user reports", error);
      throw new InternalServerErrorException("Failed to fetch user reports");
    }
  }

  //  Update report (status, comments, etc.)
  async updateReport(id: string, dto: UpdateUserReportDto) {
    try {
      const existing = await this.prisma.userReport.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException("User report not found");
      }

      const updated = await this.prisma.userReport.update({
        where: { id },
        data: {
          reason: dto.reason ?? existing.reason,
          comments: dto.comments ?? existing.comments,
          status: dto.status ?? existing.status,
          updatedAt: new Date(),
        },
      });

      //  Send email if status changed
      if (dto.status && dto.status !== existing.status) {
        const email = `${existing.userId}@purdue.edu`;

        await this.mailService.sendEmail(
          email,
          "User Report Status Updated",
          `Your report against user "${existing.reportedUserId}" has been updated to status: ${dto.status}.`
        );

        this.logger.log(`Sent status update email to: ${email}`);
      }

      return updated;
    } catch (error) {
      this.logger.error("Failed to update user report", error);
      throw new InternalServerErrorException("Failed to update user report");
    }
  }
}

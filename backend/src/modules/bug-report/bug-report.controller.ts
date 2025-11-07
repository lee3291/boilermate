import { Controller, Get, Put, Post, Param, Body } from "@nestjs/common";
import { BugReportService } from "./bug-report.service";
import { CreateBugReportDto } from "./dto/create-bug-report.dto";
import { UpdateBugReportDto } from "./dto/update-bug-report.dto";

@Controller("bug-report")
export class BugReportController {
  constructor(private readonly svc: BugReportService) {}

  // CREATE Bug Report
  @Post()
  async create(@Body() dto: CreateBugReportDto) {
    return this.svc.createBugReport(dto);
  }

  // GET all bug reports
  @Get()
  findAll() {
    return this.svc.getAllReports();
  }

  // UPDATE bug report
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBugReportDto) {
    return this.svc.updateReport(id, dto);
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { BugReportService } from './bug-report.service';
import { CreateBugReportDto } from './dto/create-bug-report.dto';

@Controller('bug-report')
export class BugReportController {
  constructor(private readonly bugReportService: BugReportService) {}

  @Post()
  create(@Body() createBugReportDto: CreateBugReportDto) {
    return this.bugReportService.create(createBugReportDto);
  }
}
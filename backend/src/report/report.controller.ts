// report.controller.ts
import { Body, Controller, Get, Param, Post, Patch, Delete } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() body: CreateReportDto) {
    return await this.reportService.createReport(body);
  }

  @Get()
  async findAll() {
    return await this.reportService.getAllReports();
  }

  @Patch(':id/resolve')
  async resolve(@Param('id') id: string) {
    return await this.reportService.resolveReport(Number(id));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.reportService.deleteReport(Number(id));
  }
}

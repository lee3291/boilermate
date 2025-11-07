import { Controller, Get, Post, Put, Param, Body } from "@nestjs/common";
import { UserReportService } from "./user-report.service";
import { CreateUserReportDto } from "./dto/create-user-report.dto";
import { UpdateUserReportDto } from "./dto/update-user-report.dto";

@Controller("user-report")
export class UserReportController {
  constructor(private readonly svc: UserReportService) {}

  @Post()
  create(@Body() dto: CreateUserReportDto) {
    return this.svc.createUserReport(dto);
  }

  @Get()
  findAll() {
    return this.svc.getAllReports();
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserReportDto) {
    return this.svc.updateReport(id, dto);
  }
}

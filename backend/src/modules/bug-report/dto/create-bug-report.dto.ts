// src/modules/bug-report/dto/create-bug-report.dto.ts
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBugReportDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  steps: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

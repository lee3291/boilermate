// dto/update-bug-report.dto.ts
import { IsOptional, IsString, IsIn } from "class-validator";

export class UpdateBugReportDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() steps?: string;
  @IsOptional() @IsString() userId?: string;

  @IsOptional()
  @IsIn(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
  status?: string;

  @IsOptional()
  @IsIn(["HIGH", "MEDIUM", "LOW"])
  priority?: string;
}

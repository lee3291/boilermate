import { IsOptional, IsString } from "class-validator";

export class UpdateUserReportDto {
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() comments?: string;
  @IsOptional() @IsString() status?: string;
}

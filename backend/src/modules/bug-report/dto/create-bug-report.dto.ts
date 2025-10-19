import { IsString, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBugReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  stepsToReprod?: string;

  @IsIn(['open', 'in_progress', 'closed'])
  status?: string;
}
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  reporterId: number;

  @IsInt()
  reportedUserId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  comments: string;
}
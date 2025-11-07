import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserReportDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  reportedUserId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  comments: string;
}

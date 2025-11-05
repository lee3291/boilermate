import { IsString, IsNotEmpty, IsMimeType } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  @IsMimeType()
  contentType: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVerificationRequestDto {
  @IsString()
  @IsNotEmpty()
  idImageKey: string;
}

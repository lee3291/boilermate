import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@purdue\.edu$/, {
    message: 'Email must be a @purdue.edu address.',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

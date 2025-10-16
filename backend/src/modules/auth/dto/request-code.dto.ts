import { IsEmail, Matches } from 'class-validator';

export class RequestCodeDto {
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@purdue\.edu$/, {
    message: 'Email must be a @purdue.edu address.',
  })
  email: string;
}

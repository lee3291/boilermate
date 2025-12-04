// send-email.dto.ts
export class SendEmailDto {
  title: string;
  message: string;
  toEmail?: string;
  group?: 'ACTIVE' | 'SUSPENDED' | 'VERIFIED';
}

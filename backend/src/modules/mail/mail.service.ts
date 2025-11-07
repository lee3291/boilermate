import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Single email
  async sendEmail(to: string, subject: string, text: string, html?: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? `"BoilerMate Support" <no-reply@boilermate.app>`,
      to,
      subject,
      text,
      html: html ?? `<p>${text}</p>`,
    });
  }

  // Bulk email (for announcements)
  async sendBulkEmail(recipients: string[], subject: string, text: string, html?: string) {
    if (!recipients || recipients.length === 0) return;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? `"BoilerMate Support" <no-reply@boilermate.app>`,
      bcc: recipients.join(","), // use BCC for privacy
      subject,
      text,
      html: html ?? `<p>${text}</p>`,
    });
  }
}

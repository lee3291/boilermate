import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import Mail from 'nodemailer/lib/mailer';
import { SentMessageInfo } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';

@Injectable()
export class MailService {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const handlebarOptions: hbs.NodemailerExpressHandlebarsOptions = {
      viewEngine: {
        extname: '.hbs',
        partialsDir: path.resolve('./src/modules/mail/templates'),
        layoutsDir: path.resolve('./src/modules/mail/templates'),
        defaultLayout: undefined,
      },
      viewPath: path.resolve('./src/modules/mail/templates'),
      extName: '.hbs',
    };

    this.transporter.use('compile', (hbs as any).default(handlebarOptions));
  }

  // Single email
  async sendEmail(to: string, subject: string, text: string, html?: string) {
    await this.transporter.sendMail({
      from:
        process.env.MAIL_FROM ??
        `"BoilerMate Support" <no-reply@boilermate.app>`,
      to,
      subject,
      text,
      html: html ?? `<p>${text}</p>`,
    });
  }

  async sendTemplatedEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<SentMessageInfo> {
    const mailOptions: Mail.Options & { template: string; context: any } = {
      from:
        process.env.MAIL_FROM ??
        `"BoilerMate Support" <no-reply@boilermate.app>`,
      to,
      subject,
      template,
      context,
    };
    return this.transporter.sendMail(mailOptions);
  }

  // Bulk email (for announcements)
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    text: string,
    html?: string,
  ) {
    if (!recipients || recipients.length === 0) return;

    await this.transporter.sendMail({
      from:
        process.env.MAIL_FROM ??
        `"BoilerMate Support" <no-reply@boilermate.app>`,
      bcc: recipients.join(','), // use BCC for privacy
      subject,
      text,
      html: html ?? `<p>${text}</p>`,
    });
  }
}

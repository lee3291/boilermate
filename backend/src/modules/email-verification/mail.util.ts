import nodemailer from 'nodemailer';

/**
 * sendMail utility for sending emails using nodemailer (Gmail SMTP).
 *
 * Usage:
 *   await sendMail({
 *     to: 'user@example.com',
 *     subject: 'Your Subject',
 *     text: 'Email body text',
 *   });
 *
 * Environment Variables Required:
 *   - EMAIL_USER: Gmail address to send from (e.g. myapp@gmail.com)
 *   - EMAIL_PASS: App password for the Gmail account
 *
 * Test/Production Switch:
 *   - Use process.env.OTP_MODE === 'production' to send real emails.
 *   - In any other mode, log the code to the server for testing.
 *   - See email-verification.service.ts for example usage.
 *
 * Security:
 *   - Never commit real credentials to source control.
 *   - Use environment variables for secrets.
 */
export async function sendMail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: 'BoilerMate <no-reply@boilermate.com>',
    to,
    subject,
    text,
  });
}

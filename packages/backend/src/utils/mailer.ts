import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"TaskHub Pro" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`И-мэйл илгээгдлээ: ${to}`);
  } catch (error) {
    logger.error('И-мэйл илгээхэд алдаа гарлаа:', error);
  }
}

export function getTodoCreatedEmail(username: string, todoText: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">TaskHub Pro</h1>
      <p>Сайн уу, <b>${username}</b>!</p>
      <p>Та шинэ даалгавар нэмлээ:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 16px;"><b>${todoText}</b></p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Энэхүү и-мэйлийг TaskHub Pro-оос автоматаар илгээв.
      </p>
    </div>
  `;
}
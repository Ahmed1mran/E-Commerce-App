import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';

export const sendEmail = async (data: SendMailOptions) => {
  try {
    // Check if at least one recipient field is provided
    if (!data.to && !data.bcc && !data.cc) {
      throw new BadGatewayException('In-valid email destination');
    }

    if (!data.text && !data.html && !data.attachments?.length) {
      throw new BadGatewayException('In-valid email content');
    }

    const transporter: Transporter = createTransport({
      host: 'smtp.gmail.email',
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"nest 👻" <${process.env.EMAIL}>`,
      ...data,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    if (error instanceof BadGatewayException) {
      throw error;
    }
    throw new InternalServerErrorException(error);
  }
};

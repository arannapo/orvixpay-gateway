import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: (process.env.SMTP_HOST || 'smtp.ethereal.email').trim(),
  port: parseInt((process.env.SMTP_PORT || '587').trim(), 10),
  secure: (process.env.SMTP_PORT || '').trim() === '465',
  auth: {
    user: (process.env.SMTP_USER || 'tito66@ethereal.email').trim(),
    pass: (process.env.SMTP_PASS || 'xRKcRUE8cjR7mmpGRA').trim()
  }
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'CryptoSaaS'} Gateway" <${(process.env.SMTP_USER || 'tito66@ethereal.email').trim()}>`,
      to,
      subject,
      html
    });
    console.log('Email sent: %s', info.messageId);
    // If using Ethereal, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"DR SK BHATT" <noreply@vardaanclinic.com>',
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export function getBookingConfirmationEmail(data: {
  patientName: string;
  bookingId: string;
  date: string;
  time: string;
  type: string;
  fee: number;
}) {
  return {
    subject: `Booking Confirmation - ${data.bookingId} | DR SK BHATT`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #FAF8F5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #0D4F4F, #1A7A7A); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F0EDE8; }
          .detail-label { color: #6B7280; font-size: 14px; }
          .detail-value { color: #1A1A2E; font-weight: 600; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
          .badge-pending { background: #FFFBEB; color: #F59E0B; }
          .footer { background: #F0EDE8; padding: 20px; text-align: center; font-size: 13px; color: #6B7280; }
          .accent { color: #C9A96E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>♥ VARDAAN CLINIC</h1>
            <p>DR SK BHATT, MD (Cardiology)</p>
          </div>
          <div class="content">
            <h2 style="color: #0D4F4F; margin-top: 0;">Booking Confirmed! ✓</h2>
            <p>Dear ${data.patientName},</p>
            <p>Your appointment has been successfully booked. Here are the details:</p>
            
            <div style="background: #FAF8F5; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div class="detail-row">
                <span class="detail-label">Booking ID</span>
                <span class="detail-value accent">${data.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${data.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value">${data.type === 'online' ? '📹 Online Video Call' : '🏥 In-Clinic Visit'}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Fee</span>
                <span class="detail-value">₹${data.fee}</span>
              </div>
            </div>
            
            <p><span class="badge badge-pending">⏳ PENDING CONFIRMATION</span></p>
            <p style="font-size: 14px; color: #6B7280;">Your appointment is pending doctor's confirmation. You will receive another email once confirmed${data.type === 'online' ? ' along with the video call link' : ''}.</p>
            
            ${data.type === 'offline' ? `
            <div style="background: #ECFDF5; border-radius: 8px; padding: 16px; margin-top: 16px;">
              <strong style="color: #0D4F4F;">📍 Clinic Address</strong>
              <p style="margin: 8px 0 0; font-size: 14px; color: #4A4A5A;">302, Harmony Tower, Andheri West, Mumbai, Maharashtra 400058</p>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>VARDAAN CLINIC | DR SK BHATT</p>
            <p>📞 +91 98765 43210 | ✉ dr.skbhatt@vardaanclinic.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

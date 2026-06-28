import nodemailer from 'nodemailer'

function generateOTPEmailHTML(name: string, otpCode: string, message: string): string {
  return `
  <!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Aura Football Booking Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f7f9fa; padding-bottom: 40px; padding-top: 40px; }
        .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #eef2f4; }
        .header { background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 35px 20px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
        .content { padding: 40px 35px; background-color: #ffffff; }
        .welcome-text { font-size: 18px; color: #1c1e21; font-weight: 600; margin-top: 0; margin-bottom: 16px; }
        .desc-text { font-size: 15px; color: #566370; line-height: 1.6; margin-bottom: 30px; }
        .otp-container { text-align: center; margin: 32px 0; }
        .otp-box { background-color: #f1f8e9; color: #1b5e20; font-size: 36px; font-weight: 800; letter-spacing: 6px; padding: 18px 30px; border-radius: 12px; display: inline-block; border: 2px dashed #a5d6a7; text-align: center; min-width: 180px; }
        .note-text { font-size: 13px; color: #8a9aa8; line-height: 1.5; text-align: center; border-top: 1px solid #edf2f7; padding-top: 20px; margin-top: 30px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #a1b1c0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Aura Football</h1>
          </div>
          <div class="content">
            <p class="welcome-text">Xin chào ${name},</p>
            <p class="desc-text">${message}</p>
            <div class="otp-container">
              <div class="otp-box">${otpCode}</div>
            </div>
            <p class="desc-text" style="margin-bottom: 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
            <div class="note-text">
              Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>.<br />
              Vì lý do bảo mật, tuyệt đối không chia sẻ mã này cho bất kỳ ai.
            </div>
          </div>
        </div>
        <div class="footer">
          © 2026 Aura Football Pitch Booking System. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `
}

export async function sendOtpVerificationEmail(toEmail: string, name: string, otpCode: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  await transporter.sendMail({
    from: `"Aura Football" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[Aura Football] ${otpCode} là mã xác thực đăng ký tài khoản của bạn`,
    html: generateOTPEmailHTML(
      name,
      otpCode,
      'Cảm ơn bạn đã lựa chọn hệ thống đặt sân bóng Aura Football. Vui lòng nhập mã số OTP dưới đây vào ứng dụng di động để kích hoạt tài khoản của bạn:'
    )
  })
}

export async function sendForgotPasswordEmail(toEmail: string, name: string, otpCode: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  await transporter.sendMail({
    from: `"Aura Football" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[Aura Football] ${otpCode} là mã OTP đặt lại mật khẩu`,
    html: generateOTPEmailHTML(
      name,
      otpCode,
      'Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu từ bạn. Hãy sử dụng mã OTP dưới đây để tiến hành thiết lập lại mật khẩu mới trên ứng dụng:'
    )
  })
}

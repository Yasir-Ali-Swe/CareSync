export const verificationEmailTemplate = ({
  appName,
  name,
  verifyUrl,
  supportEmail,
}) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:22px 24px;color:#fff;font-size:22px;font-weight:700;">
                ${appName}
              </td>
            </tr>
            <tr>
              <td style="padding:26px;">
                <h2 style="margin:0 0 12px;font-size:22px;">Verify your email</h2>
                <p style="margin:0 0 14px;line-height:1.7;">Hi ${name}, welcome to ${appName}. Please verify your email address to activate your account.</p>
                <p style="text-align:center;margin:28px 0;">
                  <a href="${verifyUrl}" style="background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9px;display:inline-block;font-weight:600;">Verify Email</a>
                </p>
                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">If the button doesn’t work, use this link:</p>
                <p style="margin:0 0 16px;font-size:13px;word-break:break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>
                <p style="margin:0;color:#6b7280;font-size:13px;">Support: ${supportEmail}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

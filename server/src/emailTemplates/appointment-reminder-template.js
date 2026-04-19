export const appointmentReminderTemplate = ({
  appName,
  name,
  doctorName,
  date,
  time,
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
              <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:22px 24px;color:#fff;font-size:22px;font-weight:700;">
                ${appName}
              </td>
            </tr>
            <tr>
              <td style="padding:26px;">
                <h2 style="margin:0 0 12px;font-size:22px;">Appointment Reminder</h2>
                <p style="margin:0 0 14px;line-height:1.7;">Hi ${name}, this is a reminder for your upcoming appointment.</p>
                <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:14px;margin:16px 0;">
                  <p style="margin:0 0 6px;"><strong>Doctor:</strong> ${doctorName}</p>
                  <p style="margin:0 0 6px;"><strong>Date:</strong> ${date}</p>
                  <p style="margin:0;"><strong>Time:</strong> ${time}</p>
                </div>
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

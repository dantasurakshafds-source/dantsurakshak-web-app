import nodemailer from 'nodemailer';
import {
  EmailData,
  LesionEmailData,
  RegisterEmailData,
  RegisterVerificationEmailData,
} from './Types';

const HOST = 'https://dantsurakshak-web-app.vercel.app';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter
  .verify()
  .then(() => console.log('✅ Email transporter is ready'))
  .catch((err) => console.error('❌ Email transporter error', err));

/**
 * Renders a modern, responsive HTML email template using Dant Surakshak brand colors.
 * Brand Primary: #56235E (Deep Purple)
 * Brand Accent: #C1392D (Red)
 * Slate Dark Text: #1E293B
 * Card Background: #FFFFFF
 * Page Background: #F8FAFC
 */
const renderEmailTemplate = ({
  title,
  subtitle,
  bodyHtml,
}: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
}): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Header Bar with Brand Colors -->
          <tr>
            <td style="background: linear-gradient(135deg, #56235E 0%, #3D1743 100%); background-color: #56235E; padding: 26px 30px; text-align: center;">
              <div style="color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                DANT SURAKSHAK
              </div>
              <div style="color: rgba(255, 255, 255, 0.85); font-size: 12px; margin-top: 4px; font-weight: 500; letter-spacing: 0.5px;">
                Oral Health & Hygiene Platform
              </div>
            </td>
          </tr>

          <!-- Title & Subtitle Section -->
          <tr>
            <td style="padding: 28px 32px 12px 32px; background-color: #FFFFFF;">
              <h2 style="margin: 0; color: #1E293B; font-size: 20px; font-weight: 700; line-height: 1.3;">
                ${title}
              </h2>
              ${
                subtitle
                  ? `<p style="margin: 6px 0 0 0; color: #64748B; font-size: 13px; line-height: 1.4;">${subtitle}</p>`
                  : ''
              }
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 12px 32px 32px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 22px 32px; text-align: center; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569; font-size: 13px;">
                Dant Surakshak • Official Health Care Platform
              </p>
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                This is an automated system email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const sendApprovalEmail = async (
  data: EmailData,
  type:
    | 'register'
    | 'lesion'
    | 'questionnaire'
    | 'adminlesionfeedback'
    | 'adminQuestionaryfeedback'
    | 'registerverificationcode'
    | 'registerEmailOtp'
    | 'forgotPassword',
  token?: string,
  recipients?: string[]
): Promise<nodemailer.SentMessageInfo> => {
  let approvalLink = '';
  let rejectionLink = '';
  let subject = '';
  let htmlContent = '';

  // 1. FORGOT PASSWORD (OTP VERIFICATION CODE)
  if (type === 'forgotPassword') {
    subject = 'Password Reset Verification Code - Dant Surakshak';
    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello,</p>
      <p style="color: #475569; margin-bottom: 20px;">
        We received a request to reset the password for your <strong>Dant Surakshak</strong> account. Use the verification code below to set your new password:
      </p>

      <!-- OTP Highlight Box -->
      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background-color: rgba(86, 35, 94, 0.05); border: 2px dashed #56235E; border-radius: 10px; padding: 16px 36px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #56235E; letter-spacing: 8px;">
            ${token}
          </span>
        </div>
      </div>

      <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 12px; color: #92400E;">
        ⏱️ <strong>Note:</strong> This verification code is valid for 20 minutes. If you did not request a password reset, please ignore this email.
      </div>
    `;

    htmlContent = renderEmailTemplate({
      title: 'Reset Password Request',
      subtitle: 'Use the OTP code below to reset your account password',
      bodyHtml,
    });
  }

  // 2. REGISTER EMAIL OTP VERIFICATION
  else if (type === 'registerEmailOtp') {
    subject = 'Email Verification Code - Dant Surakshak';
    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello,</p>
      <p style="color: #475569; margin-bottom: 20px;">
        Thank you for joining <strong>Dant Surakshak</strong>. Use the verification code below to verify your email address and complete registration:
      </p>

      <!-- OTP Highlight Box -->
      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background-color: rgba(86, 35, 94, 0.05); border: 2px dashed #56235E; border-radius: 10px; padding: 16px 36px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #56235E; letter-spacing: 8px;">
            ${token}
          </span>
        </div>
      </div>

      <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 12px; color: #92400E;">
        ⏱️ <strong>Note:</strong> This verification code is valid for 5 minutes. If you did not initiate registration, please ignore this email.
      </div>
    `;

    htmlContent = renderEmailTemplate({
      title: 'Email Address Verification',
      subtitle: 'Verify your email address to complete registration',
      bodyHtml,
    });
  }

  // 2. REGISTER USER VERIFICATION LINK / CODE
  else if (type === 'registerverificationcode') {
    if (token) {
      approvalLink = `${HOST}/api/auth/register/verify/${token}?action=verify`;
    }
    const name = (data as RegisterVerificationEmailData).name || 'User';
    subject = 'Verify Your Email Address - Dant Surakshak';

    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello <strong>${name}</strong>,</p>
      <p style="color: #475569;">
        Thank you for registering on <strong>Dant Surakshak</strong>. Please verify your email address to complete your account setup and access the platform.
      </p>

      ${
        token
          ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${approvalLink}" target="_blank" style="display: inline-block; background-color: #56235E; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 10px rgba(86, 35, 94, 0.25);">
            Verify Email Address
          </a>
        </div>
      `
          : ''
      }

      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${approvalLink}" style="color: #56235E; word-break: break-all;">${approvalLink}</a>
      </p>
    `;

    htmlContent = renderEmailTemplate({
      title: 'Email Address Verification',
      subtitle: 'Complete your registration on Dant Surakshak',
      bodyHtml,
    });
  }

  // 3. NEW ADMIN / AMBASSADOR REGISTRATION (APPROVAL REQUEST FOR SUPER ADMIN)
  else if (type === 'register') {
    if (token) {
      approvalLink = `${HOST}/api/auth/verify/${token}?action=approve`;
      rejectionLink = `${HOST}/api/auth/verify/${token}?action=reject`;
    }
    const regData = data as RegisterEmailData;
    subject = `New ${regData.role || 'User'} Registration Review - Dant Surakshak`;

    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello Super Admin,</p>
      <p style="color: #475569;">
        A new user has registered as <strong style="color: #56235E;">${regData.role || 'User'}</strong> and requires your review and approval:
      </p>

      <!-- Details Grid Table -->
      <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin: 18px 0; font-size: 13px;">
        <tr>
          <td style="color: #64748B; width: 30%; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Full Name</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${regData.name}</td>
        </tr>
        <tr>
          <td style="color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Email Address</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0;">${regData.email}</td>
        </tr>
        <tr>
          <td style="color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Phone Number</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0;">${regData.phoneNumber || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Role Requested</td>
          <td style="color: #56235E; font-weight: 700;">${regData.role}</td>
        </tr>
      </table>

      ${
        token
          ? `
        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="${approvalLink}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 11px 24px; border-radius: 6px; margin-right: 10px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
            ✓ Approve User
          </a>
          <a href="${rejectionLink}" target="_blank" style="display: inline-block; background-color: #EF4444; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 11px 24px; border-radius: 6px; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);">
            ✗ Reject User
          </a>
        </div>
      `
          : ''
      }
    `;

    htmlContent = renderEmailTemplate({
      title: 'New Account Approval Request',
      subtitle: 'Review registration details for new team member',
      bodyHtml,
    });
  }

  // 4. NEW LESION SUBMISSION (APPROVAL REQUEST FOR SUPER ADMIN)
  else if (type === 'lesion') {
    if (token) {
      approvalLink = `${HOST}/api/lesion/verify/${token}?action=approve`;
      rejectionLink = `${HOST}/api/lesion/verify/${token}?action=reject`;
    }
    subject = 'New Lesion Record Submitted for Approval - Dant Surakshak';

    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello Super Admin,</p>
      <p style="color: #475569;">
        A new <strong>Oral Lesion Record</strong> has been submitted by a field officer/dantasurakshak and requires your approval.
      </p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-family: monospace; font-size: 12px; color: #334155; max-height: 220px; overflow-y: auto;">
        <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
      </div>

      ${
        token
          ? `
        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="${approvalLink}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 11px 24px; border-radius: 6px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
            ✓ Approve Lesion Record
          </a>
        </div>
      `
          : ''
      }
    `;

    htmlContent = renderEmailTemplate({
      title: 'Lesion Approval Request',
      subtitle: 'Review new clinical lesion record submission',
      bodyHtml,
    });
  }

  // 5. NEW QUESTIONNAIRE SUBMISSION (APPROVAL REQUEST FOR SUPER ADMIN)
  else if (type === 'questionnaire') {
    if (token) {
      approvalLink = `${HOST}/api/questionnaire/verify/${token}?action=approve`;
      rejectionLink = `${HOST}/api/questionnaire/verify/${token}?action=reject`;
    }
    subject = 'New Questionnaire Submitted for Approval - Dant Surakshak';

    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello Super Admin,</p>
      <p style="color: #475569;">
        A new <strong>Patient Health Questionnaire</strong> has been submitted and is pending review.
      </p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-family: monospace; font-size: 12px; color: #334155; max-height: 220px; overflow-y: auto;">
        <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
      </div>

      ${
        token
          ? `
        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="${approvalLink}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 11px 24px; border-radius: 6px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
            ✓ Approve Questionnaire
          </a>
        </div>
      `
          : ''
      }
    `;

    htmlContent = renderEmailTemplate({
      title: 'Questionnaire Approval Request',
      subtitle: 'Review patient health questionnaire submission',
      bodyHtml,
    });
  }

  // 6. ADMIN LESION FEEDBACK (NOTIFICATION FOR DANTA / USER)
  else if (type === 'adminlesionfeedback') {
    const lesion = data as LesionEmailData;
    subject = 'Admin Feedback Received on Your Lesion Record - Dant Surakshak';

    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello,</p>
      <p style="color: #475569;">
        Your submitted <strong>Oral Lesion Record</strong> (ID: <strong style="color: #56235E;">${lesion._id || 'N/A'}</strong>) has received new diagnostic feedback from the Admin team.
      </p>

      <!-- Feedback Details Grid Table -->
      <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin: 18px 0; font-size: 13px;">
        <tr>
          <td style="color: #64748B; width: 35%; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Lesion Type / Category</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${lesion.lesion_type || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Diagnosis Notes</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0;">${lesion.diagnosis_notes || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Recommended Actions</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0;">${lesion.recomanded_actions || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Additional Comments</td>
          <td style="color: #1E293B;">${lesion.comments_or_notes || 'N/A'}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #475569;">
        Please log in to your account on the web portal or mobile app to view complete record details.
      </p>
    `;

    htmlContent = renderEmailTemplate({
      title: 'Admin Feedback Update',
      subtitle: 'Review clinical diagnostic feedback on your lesion record',
      bodyHtml,
    });
  }

  // 7. ADMIN QUESTIONNAIRE FEEDBACK (NOTIFICATION FOR DANTA / USER)
  else if (type === 'adminQuestionaryfeedback') {
    const qData = data as LesionEmailData;
    subject = 'Admin Feedback Received on Your Questionnaire - Dant Surakshak';

    const bodyHtml = `
      <p style="margin-top: 0; color: #334155;">Hello,</p>
      <p style="color: #475569;">
        Your submitted <strong>Questionnaire Record</strong> (ID: <strong style="color: #56235E;">${qData._id || 'N/A'}</strong>) has received new feedback from the Admin team.
      </p>

      <!-- Feedback Details Grid Table -->
      <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin: 18px 0; font-size: 13px;">
        <tr>
          <td style="color: #64748B; width: 35%; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Questionnaire Category</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${qData.questionary_type || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Diagnosis Notes</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0;">${qData.diagnosis_notes || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Recommended Actions</td>
          <td style="color: #1E293B; border-bottom: 1px solid #E2E8F0;">${qData.recomanded_actions || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Additional Comments</td>
          <td style="color: #1E293B;">${qData.comments_or_notes || 'N/A'}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #475569;">
        Please log in to your account on the web portal or mobile app to view complete questionnaire feedback.
      </p>
    `;

    htmlContent = renderEmailTemplate({
      title: 'Admin Feedback Update',
      subtitle: 'Review feedback on your submitted health questionnaire',
      bodyHtml,
    });
  }

  const toEmails =
    type === 'registerverificationcode' || type === 'forgotPassword'
      ? (data as RegisterVerificationEmailData).email
      : recipients && recipients.length
      ? recipients.join(',')
      : process.env.SUPERADMIN_EMAIL!;

  if (!toEmails) {
    throw new Error('No recipients for email');
  }

  const info = await transporter.sendMail({
    from: `"Dant Surakshak" <${process.env.GMAIL}>`,
    to: toEmails,
    subject,
    html: htmlContent,
  });

  console.log('✉️ Email sent successfully:', info.messageId);
  return info;
};

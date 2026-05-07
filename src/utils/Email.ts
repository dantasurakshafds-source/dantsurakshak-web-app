
import nodemailer from 'nodemailer';
import {
  EmailData,
  LesionEmailData,
  RegisterEmailData,
  RegisterVerificationEmailData
} from './Types';

const HOST = 'https://o-h-app.vercel.app';
// const HOST = 'http://localhost:3000';

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


transporter.verify()
  .then(() => console.log('✅ Email transporter is ready'))
  .catch(err => console.error('❌ Email transporter error', err));

export const sendApprovalEmail = async (
  data: EmailData,
  type:
    | 'register'
    | 'lesion'
    | 'questionnaire'
    | 'adminlesionfeedback'
    | 'adminQuestionaryfeedback'
    | 'registerverificationcode'
    | 'forgotPassword',
  token?: string,
  recipients?: string[]
): Promise<nodemailer.SentMessageInfo> => {
  let approvalLink = '';
  let rejectionLink = '';
  let subject = '';
  let htmlContent = '';

  if (type === 'forgotPassword') {
    subject = 'Your Password Reset Code';
    htmlContent = `
      <html><body style="font-family:sans-serif;line-height:1.4">
        <h2>Password Reset Requested</h2>
        <p>Your one-time code is: <b>${token}</b></p>
      </body></html>
    `;
  }
  else if (type === 'register') {
    if (token) {
      approvalLink = `${HOST}/api/auth/verify/${token}?action=approve`;
      rejectionLink = `${HOST}/api/auth/verify/${token}?action=reject`;
    }
    subject = 'Approve or Reject New Admin/Ambassador Registration';
    htmlContent = `
      <html><body>
        <h1>Hi Super Admin,</h1>
        <p>A new user registered as <b>${(data as RegisterEmailData).role}</b>. Please review:</p>
        <ul>
          <li>Name: ${(data as RegisterEmailData).name}</li>
          <li>Email: ${(data as RegisterEmailData).email}</li>
          <li>Phone: ${(data as RegisterEmailData).phoneNumber}</li>
        </ul>
        <p>
          ${token
        ? `<a href="${approvalLink}" style="background:#2ecc71;color:#fff;padding:8px 12px;text-decoration:none">Approve</a>
               <a href="${rejectionLink}" style="background:#e74c3c;color:#fff;padding:8px 12px;text-decoration:none;margin-left:8px">Reject</a>`
        : ''}
        </p>
      </body></html>
    `;
  }
  else if (type === 'registerverificationcode') {
    if (token) {
      approvalLink = `${HOST}/api/auth/register/verify/${token}?action=verify`;
    }
    subject = 'Verify Your Email Address';
    htmlContent = `
      <html><body>
        <h1>Email Verification</h1>
        <p>Hello ${(data as RegisterVerificationEmailData).name},</p>
        <p>
          ${token
        ? `<a href="${approvalLink}" style="background:#2ecc71;color:#fff;padding:8px 12px;text-decoration:none">Verify</a>`
        : ''}
        </p>
      </body></html>
    `;
  }
  else if (type === 'lesion') {
    if (token) {
      approvalLink = `${HOST}/api/lesion/verify/${token}?action=approve`;
      rejectionLink = `${HOST}/api/lesion/verify/${token}?action=reject`;
    }
    subject = 'New Lesion Record Submitted for Approval';
    htmlContent = `
      <html><body style="font-family:sans-serif">
        <h1>Lesion Approval Request</h1>
        <p>Details submitted:</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p>
          ${token
        ? `<a href="${approvalLink}" style="background:#2ecc71;color:#fff;padding:8px 12px;text-decoration:none">Approve</a>`
        : ''}
        </p>
      </body></html>
    `;
  }
  else if (type === 'questionnaire') {
    if (token) {
      approvalLink = `${HOST}/api/questionnaire/verify/${token}?action=approve`;
      rejectionLink = `${HOST}/api/questionnaire/verify/${token}?action=reject`;
    }
    subject = 'New Questionnaire Submitted for Approval';
    htmlContent = `
      <html><body>
        <h1>Questionnaire Approval Request</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p>
          ${token
        ? `<a href="${approvalLink}" style="background:#2ecc71;color:#fff;padding:8px 12px;text-decoration:none">Approve</a>`
        : ''}
        </p>
      </body></html>
    `;
  }
  else if (type === 'adminlesionfeedback') {
    subject = 'Your Lesion Record Has Received Admin Feedback';
    htmlContent = `
      <html><body>
        <h1>Admin Feedback Received</h1>
        <p>Your lesion record (ID: ${(data as LesionEmailData)._id}) has new feedback:</p>
        <ul>
          <li>Type: ${(data as LesionEmailData).lesion_type || 'N/A'}</li>
          <li>Notes: ${(data as LesionEmailData).diagnosis_notes || 'N/A'}</li>
          <li>Actions: ${(data as LesionEmailData).recomanded_actions || 'N/A'}</li>
          <li>Comments: ${(data as LesionEmailData).comments_or_notes || 'N/A'}</li>
        </ul>
        <p>Please log in for full details.</p>
      </body></html>
    `;
  }
  else if (type === 'adminQuestionaryfeedback') {
    subject = 'Your Questionnaire Record Has Received Admin Feedback';
    htmlContent = `
      <html><body>
        <h1>Admin Feedback Received</h1>
        <p>Your questionnaire (ID: ${(data as LesionEmailData)._id}) has new feedback:</p>
        <ul>
          <li>Type: ${(data as LesionEmailData).questionary_type || 'N/A'}</li>
          <li>Notes: ${(data as LesionEmailData).diagnosis_notes || 'N/A'}</li>
          <li>Actions: ${(data as LesionEmailData).recomanded_actions || 'N/A'}</li>
          <li>Comments: ${(data as LesionEmailData).comments_or_notes || 'N/A'}</li>
        </ul>
        <p>Please log in for full details.</p>
      </body></html>
    `;
  }

  const toEmails =
    (type === 'registerverificationcode' || type === 'forgotPassword')
      ? (data as RegisterVerificationEmailData).email
      : (recipients && recipients.length)
        ? recipients.join(',')
        : process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL!;

  if (!toEmails) {
    throw new Error('No recipients for email');
  }

  const info = await transporter.sendMail({
    from: process.env.GMAIL,
    to: toEmails,
    subject,
    html: htmlContent,
  });

  console.log('✉️ Email sent:', info.messageId);
  return info;
};

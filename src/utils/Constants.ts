import User from "@/models/User"
import VerificationToken from "@/models/VerificationToken";
import crypto from 'crypto';
import { ConfirmationPageParams } from "./Types";

import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import path from 'path';
import fs from 'fs';
import LesionVerificationTokens from "@/models/LesionVerificationTokens";
import QuestionnaireVerificationTokens from "@/models/QuestionnaireVerificationTokens";

export const PAGE_PER_PAGE_LIMIT = 10
export const LESION_CREATE = "lesion-created"

export const EN = 'en'
export const KN = 'kn'

export const CLOUD_NAME = 'do6qy56kf'
export const API_KEY = '888443219665931'
export const API_SECRET = 'YJE-bgUxrpRLrGcVqNICTqq_otA'
export const CLOUD_APP_NAME = "o_h_app"

export const VERIFIABLE_ROLES = ['admin', 'dantasurakshaks'];


export function parseValue(key: string, value: string) {
    const numericFields = ['age', 'income'];
    if (numericFields.includes(key)) {
        const num = Number(value);
        return isNaN(num) ? value : num;
    }
    return value;
}

export async function getAdminsEmails(adminIds: string[]): Promise<string[]> {
    const admins = await User.find({ _id: { $in: adminIds } });
    return admins.map((admin) => admin.email);
}


// random verification tokens

export const createVerificationToken = async (userId: string): Promise<string> => {
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
        userId,
        token,
        createdAt: new Date(),
    });
    return token;
};


 
// lessions
export async function createLesionVerificationToken(
  lesionId: string,
  adminId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await LesionVerificationTokens.create({ lesionId, adminId, token });
  return token;
}

// questionaries
export async function createQuestionnaireVerificationToken(
  questionnaireId: string,
  adminId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await QuestionnaireVerificationTokens.create({ questionnaireId, adminId, token });
  return token;
}





export function renderConfirmationPage({
    recordType,
    action,
    id,
    redirectUrl
}: ConfirmationPageParams): string {

    const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

    return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${recordType} ${capitalizedAction}d Successfully</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: auto; text-align: center; }
        a { background-color: #2ecc71; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${recordType} ${capitalizedAction}d Successfully!</h1>
        <p>The ${recordType} record with ID <strong>${id}</strong>  has been ${action}d successfully.</p>
        <p><a href="${redirectUrl}">Go Back</a></p>
      </div>
    </body>
  </html>`;
}


export const generatePDFBase64 = async (data: Record<string, unknown>): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const fontPath = path.join(
        process.cwd(),
        'public',
        'fonts',
        'rubik',
        'rubik.ttf'
      );

      if (!fs.existsSync(fontPath)) {
        throw new Error(`Font file not found at: ${fontPath}`);
      }

      doc.registerFont('Rubik', fontPath);
      doc.addPage();
      doc.font('Rubik');

      const chunks: Buffer[] = [];
      const stream = new PassThrough();
      doc.pipe(stream);
      doc.fontSize(16).text('Questionnaire Data', { underline: true });
      doc.moveDown();

      for (const [key, value] of Object.entries(data)) {
        doc.fontSize(12).text(`${key}: ${value}`);
        doc.moveDown(0.5);
      }
      doc.end();
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer.toString('base64'));
      });
      stream.on('error', reject);
    } catch (error) {
      console.error('Error in PDF generation:', error);
      reject(error);
    }
  });
};




 
export async function initiateOtp(phoneNumber: string, channels = ['SMS'], otpLength = 6, expiry = 7200) {
  const { NEXT_PUBLIC_OTPLESS_URL, NEXT_PUBLIC_OTPLESS_C_ID, NEXT_PUBLIC_OTPLESS_C_SEC } = process.env;
  if (!NEXT_PUBLIC_OTPLESS_URL || !NEXT_PUBLIC_OTPLESS_C_ID || !NEXT_PUBLIC_OTPLESS_C_SEC) {
    throw new Error('Missing OTPless config');
  }
  const res = await fetch(`${NEXT_PUBLIC_OTPLESS_URL}/auth/v1/initiate/otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      clientId: NEXT_PUBLIC_OTPLESS_C_ID,
      clientSecret: NEXT_PUBLIC_OTPLESS_C_SEC,
    },
    body: JSON.stringify({ phoneNumber, channels, otpLength, expiry }),
  });
  return res.json();
}

export async function verifyOtp(requestId: string, otp: string) {
  const { NEXT_PUBLIC_OTPLESS_URL, NEXT_PUBLIC_OTPLESS_C_ID, NEXT_PUBLIC_OTPLESS_C_SEC } = process.env;
  if (!NEXT_PUBLIC_OTPLESS_URL || !NEXT_PUBLIC_OTPLESS_C_ID || !NEXT_PUBLIC_OTPLESS_C_SEC) {
    throw new Error('Missing OTPless config');
  }
  const res = await fetch(`${NEXT_PUBLIC_OTPLESS_URL}/auth/v1/verify/otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      clientId: NEXT_PUBLIC_OTPLESS_C_ID,
      clientSecret: NEXT_PUBLIC_OTPLESS_C_SEC,
    },
    body: JSON.stringify({ requestId, otp }),
  });
  return res.json();
}






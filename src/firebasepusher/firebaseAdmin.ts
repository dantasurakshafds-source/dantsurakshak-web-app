import * as admin from 'firebase-admin';
if (!admin.apps.length) {
  try {
    const rawAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (rawAccount) {
      const serviceAccount = typeof rawAccount === 'string' ? JSON.parse(rawAccount) : rawAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization skipped or failed:', error);
  }
}
export default admin;


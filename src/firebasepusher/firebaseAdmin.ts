import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let rawAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (rawAccount) {
      if (typeof rawAccount === 'string') {
        rawAccount = rawAccount.trim();
        if (
          (rawAccount.startsWith("'") && rawAccount.endsWith("'")) ||
          (rawAccount.startsWith('"') && rawAccount.endsWith('"'))
        ) {
          rawAccount = rawAccount.slice(1, -1);
        }
      }

      const serviceAccount =
        typeof rawAccount === 'string' ? JSON.parse(rawAccount) : rawAccount;

      if (
        serviceAccount &&
        serviceAccount.private_key &&
        typeof serviceAccount.private_key === 'string'
      ) {
        serviceAccount.private_key = serviceAccount.private_key.replace(
          /\\n/g,
          '\n'
        );
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization skipped or failed:', error);
  }
}

export default admin;



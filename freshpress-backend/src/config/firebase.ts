import admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

const hasFirebaseCreds =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL;

if (hasFirebaseCreds && !admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri:
        process.env.FIREBASE_AUTH_URI ||
        'https://accounts.google.com/o/oauth2/auth',
      tokenUri:
        process.env.FIREBASE_TOKEN_URI ||
        'https://oauth2.googleapis.com/token',
      authProviderX509CertUrl:
        process.env.FIREBASE_AUTH_CERT_URL ||
        'https://www.googleapis.com/oauth2/v1/certs',
      clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(
        serviceAccount as admin.ServiceAccount
      ),
    });
  } catch {
    console.warn(
      '[Firebase] Initialization failed'
    );
  }
} else if (!hasFirebaseCreds) {
  console.log(
    '[Firebase] No credentials provided'
  );
}

export default firebaseApp;
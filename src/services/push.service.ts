import admin from "firebase-admin";

if (!admin.apps.length) {
  console.log("Project Id", process.env.FIREBASE_PROJECT_ID);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendPushNotification(
  token: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });
  } catch (err) {
    console.error("Push failed:", err);
  }
}

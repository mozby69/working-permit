import * as webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

export const isWebPushConfigured = Boolean(
  publicKey && privateKey && subject
);

if (publicKey && privateKey && subject) {
  webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey
  );

  console.log("[WEB PUSH] VAPID configured successfully");
} else {
  console.warn("[WEB PUSH] VAPID configuration missing");
}

export const webPushConfig = {
  publicKey: publicKey ?? "",
  enabled: isWebPushConfigured,
};

export default webpush;
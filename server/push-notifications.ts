/**
 * OPERIS Push Notifications — Web Push API com VAPID
 */
import webpush from "web-push";
import mysql from "mysql2/promise";

// Chaves VAPID (geradas uma única vez para este projeto)
const VAPID_PUBLIC_KEY = "BME3SjfvQsyGduOieZG5NYzlpxqFCCJadhA0qUHEO_g23zbF9-0dAOtGJsA80kj-kUvtv1BdUEPPouZx2bLFiQI";
const VAPID_PRIVATE_KEY = "jJP-VRzjUTjUD5l_28on3ibIV3vtqcOaMtaIRV14CKs";
const VAPID_SUBJECT = "mailto:co2contraincendio@gmail.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

async function getConn() {
  return mysql.createConnection(process.env.DATABASE_URL!);
}

export async function savePushSubscription(
  userId: number,
  companyId: number | null,
  sub: PushSubscriptionPayload
) {
  const conn = await getConn();
  try {
    await conn.execute(
      `INSERT INTO push_subscriptions (user_id, company_id, endpoint, p256dh, auth, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), company_id = VALUES(company_id)`,
      [userId, companyId, sub.endpoint, sub.keys.p256dh, sub.keys.auth, Date.now()]
    );
  } finally {
    await conn.end();
  }
}

export async function removePushSubscription(endpoint: string) {
  const conn = await getConn();
  try {
    await conn.execute(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [endpoint]);
  } finally {
    await conn.end();
  }
}

export async function getSubscriptionsByCompany(companyId: number): Promise<PushSubscriptionPayload[]> {
  const conn = await getConn();
  try {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE company_id = ?`,
      [companyId]
    );
    return rows.map(r => ({
      endpoint: r.endpoint as string,
      keys: { p256dh: r.p256dh as string, auth: r.auth as string },
    }));
  } finally {
    await conn.end();
  }
}

export async function getAllSubscriptions(): Promise<PushSubscriptionPayload[]> {
  const conn = await getConn();
  try {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions`
    );
    return rows.map(r => ({
      endpoint: r.endpoint as string,
      keys: { p256dh: r.p256dh as string, auth: r.auth as string },
    }));
  } finally {
    await conn.end();
  }
}

export async function sendPushNotification(
  sub: PushSubscriptionPayload,
  payload: { title: string; body: string; icon?: string; data?: Record<string, unknown> }
): Promise<boolean> {
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return true;
  } catch (error: any) {
    if (error.statusCode === 410) {
      await removePushSubscription(sub.endpoint);
    }
    return false;
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

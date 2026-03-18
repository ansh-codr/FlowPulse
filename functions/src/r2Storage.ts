import * as functions from "firebase-functions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl?: string;
}

interface UploadRequest {
  path: string;
  contentType?: string;
  expiresSeconds?: number;
}

function getR2Config(): R2Config {
  const cfg = functions.config();
  const accountId = cfg?.r2?.account_id as string | undefined;
  const accessKeyId = cfg?.r2?.access_key_id as string | undefined;
  const secretAccessKey = cfg?.r2?.secret_access_key as string | undefined;
  const bucket = cfg?.r2?.bucket as string | undefined;
  const publicBaseUrl = cfg?.r2?.public_base_url as string | undefined;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "R2 is not configured. Set functions config: r2.account_id, r2.access_key_id, r2.secret_access_key, r2.bucket"
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

function normalizePath(input: string): string {
  const trimmed = input.trim().replace(/^\/+/, "");
  if (!trimmed) {
    throw new functions.https.HttpsError("invalid-argument", "path is required");
  }
  if (trimmed.includes("..")) {
    throw new functions.https.HttpsError("invalid-argument", "path cannot contain '..'");
  }
  return trimmed;
}

function sanitizeExpiresSeconds(raw: number | undefined): number {
  if (!raw) return 900;
  return Math.max(60, Math.min(3600, Math.floor(raw)));
}

export const createR2UploadUrl = functions.https.onCall(async (data: UploadRequest, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication is required");
  }

  const requestedPath = normalizePath(data?.path ?? "");
  const contentType = data?.contentType?.trim() || "application/octet-stream";
  const expiresIn = sanitizeExpiresSeconds(data?.expiresSeconds);
  const uid = context.auth.uid;

  const r2 = getR2Config();
  const objectKey = `users/${uid}/${requestedPath}`;
  const endpoint = `https://${r2.accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    },
  });

  const command = new PutObjectCommand({
    Bucket: r2.bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = r2.publicBaseUrl
    ? `${r2.publicBaseUrl.replace(/\/$/, "")}/${objectKey}`
    : undefined;

  return {
    uploadUrl,
    method: "PUT",
    objectKey,
    bucket: r2.bucket,
    expiresIn,
    publicUrl,
  };
});

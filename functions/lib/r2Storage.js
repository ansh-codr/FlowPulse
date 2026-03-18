"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createR2UploadUrl = void 0;
const functions = __importStar(require("firebase-functions"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
function getR2Config() {
    const cfg = functions.config();
    const accountId = cfg?.r2?.account_id;
    const accessKeyId = cfg?.r2?.access_key_id;
    const secretAccessKey = cfg?.r2?.secret_access_key;
    const bucket = cfg?.r2?.bucket;
    const publicBaseUrl = cfg?.r2?.public_base_url;
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
        throw new functions.https.HttpsError("failed-precondition", "R2 is not configured. Set functions config: r2.account_id, r2.access_key_id, r2.secret_access_key, r2.bucket");
    }
    return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}
function normalizePath(input) {
    const trimmed = input.trim().replace(/^\/+/, "");
    if (!trimmed) {
        throw new functions.https.HttpsError("invalid-argument", "path is required");
    }
    if (trimmed.includes("..")) {
        throw new functions.https.HttpsError("invalid-argument", "path cannot contain '..'");
    }
    return trimmed;
}
function sanitizeExpiresSeconds(raw) {
    if (!raw)
        return 900;
    return Math.max(60, Math.min(3600, Math.floor(raw)));
}
exports.createR2UploadUrl = functions.https.onCall(async (data, context) => {
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
    const client = new client_s3_1.S3Client({
        region: "auto",
        endpoint,
        credentials: {
            accessKeyId: r2.accessKeyId,
            secretAccessKey: r2.secretAccessKey,
        },
    });
    const command = new client_s3_1.PutObjectCommand({
        Bucket: r2.bucket,
        Key: objectKey,
        ContentType: contentType,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn });
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
//# sourceMappingURL=r2Storage.js.map
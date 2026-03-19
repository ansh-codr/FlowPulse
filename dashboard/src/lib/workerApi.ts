const WORKER_BASE_URL = import.meta.env.VITE_WORKER_BASE_URL || "";
const FIREBASE_HOSTED_EXTENSION_ZIP = "/flowpulse-extension.zip";

export interface WorkerConfigResponse {
  version: string;
  downloadUrl: string;
  installNotes: string[];
}

export function getWorkerDownloadUrl() {
  if (!WORKER_BASE_URL) return FIREBASE_HOSTED_EXTENSION_ZIP;
  return `${WORKER_BASE_URL}/download-extension`;
}

function normalizeDownloadUrl(url?: string) {
  if (!WORKER_BASE_URL) return FIREBASE_HOSTED_EXTENSION_ZIP;
  if (!url) return getWorkerDownloadUrl();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${WORKER_BASE_URL}${normalizedPath}`;
}

export async function fetchWorkerConfig(): Promise<WorkerConfigResponse> {
  if (!WORKER_BASE_URL) {
    return {
      version: "firebase-hosted",
      downloadUrl: FIREBASE_HOSTED_EXTENSION_ZIP,
      installNotes: [
        "Download extension package",
        "Extract zip",
        "Load unpacked in chrome://extensions",
      ],
    };
  }

  const response = await fetch(`${WORKER_BASE_URL}/config`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Worker config request failed (${response.status})`);
  }

  const payload = (await response.json()) as WorkerConfigResponse;
  return {
    ...payload,
    downloadUrl: normalizeDownloadUrl(payload.downloadUrl),
  };
}

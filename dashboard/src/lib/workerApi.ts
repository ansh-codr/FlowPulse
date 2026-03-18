const WORKER_BASE_URL = "https://flowpulse-assets.dodgehellcatansh.workers.dev";

export interface WorkerConfigResponse {
  version: string;
  downloadUrl: string;
  installNotes: string[];
}

export function getWorkerDownloadUrl() {
  return `${WORKER_BASE_URL}/download-extension`;
}

function normalizeDownloadUrl(url?: string) {
  if (!url) return getWorkerDownloadUrl();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${WORKER_BASE_URL}${normalizedPath}`;
}

export async function fetchWorkerConfig(): Promise<WorkerConfigResponse> {
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

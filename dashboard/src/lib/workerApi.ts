const WORKER_BASE_URL = "https://flowpulse-assets.example.workers.dev";

export interface WorkerConfigResponse {
  version: string;
  downloadUrl: string;
  installNotes: string[];
}

export function getWorkerDownloadUrl() {
  return `${WORKER_BASE_URL}/download-extension`;
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

  return (await response.json()) as WorkerConfigResponse;
}

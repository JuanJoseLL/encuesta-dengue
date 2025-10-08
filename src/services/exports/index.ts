import { ApiClient, defaultApiClient } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";

export class ExportService {
  constructor(private readonly api: ApiClient = defaultApiClient) {}

  async downloadCsv(surveyId: string): Promise<Blob> {
    const baseUrl = this.api.getBaseUrl();
    const response = await fetch(`${baseUrl}${apiRoutes.exportCsv(surveyId)}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Export error ${response.status}: ${details}`);
    }

    return await response.blob();
  }
}

export const exportService = new ExportService();

import { ApiClient, defaultApiClient } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import { Indicator } from "@/domain/models";

export interface IndicatorsResponse {
  indicators: Indicator[];
  total: number;
}

export class IndicatorService {
  constructor(private readonly api: ApiClient = defaultApiClient) {}

  async getIndicators(params?: {
    domain?: string;
    search?: string;
    active?: boolean;
  }): Promise<IndicatorsResponse> {
    return this.api.request<IndicatorsResponse>(
      apiRoutes.indicatorsGet(params),
      "GET"
    );
  }

  async searchIndicators(query: string, source: Indicator[]): Promise<Indicator[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return source;
    }
    return source.filter((indicator) =>
      indicator.name.toLowerCase().includes(q)
    );
  }
}

export const indicatorService = new IndicatorService();

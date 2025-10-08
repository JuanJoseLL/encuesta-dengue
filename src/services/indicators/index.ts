import { Indicator } from "@/domain/models";

// Placeholder until API endpoints are wired. Keeps the shape of dependency injection ready.
export class IndicatorService {
  async searchIndicators(_query: string, source: Indicator[]): Promise<Indicator[]> {
    const q = _query.trim().toLowerCase();
    if (!q) {
      return source;
    }
    return source.filter((indicator) => indicator.name.toLowerCase().includes(q));
  }
}

export const indicatorService = new IndicatorService();

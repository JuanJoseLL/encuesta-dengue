export interface Indicator {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  active?: boolean;
}

export interface IndicatorCategory {
  id: string;
  name: string;
  description?: string;
  indicatorIds: string[];
}

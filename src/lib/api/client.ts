import { HttpMethod } from "./types";

interface ApiClientOptions {
  baseUrl?: string;
  getAuthToken?: () => string | undefined;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAuthToken?: () => string | undefined;

  constructor({ baseUrl = "/api", getAuthToken }: ApiClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.getAuthToken = getAuthToken;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getAuthToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`API error ${response.status}: ${details}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export const defaultApiClient = new ApiClient();

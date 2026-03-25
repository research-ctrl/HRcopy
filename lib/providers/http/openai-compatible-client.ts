interface OpenAiCompatibleClientOptions {
  baseUrl: string;
  apiKey: string;
  headers?: Record<string, string>;
}

export class OpenAiCompatibleClient {
  constructor(private readonly options: OpenAiCompatibleClientOptions) {}

  async post<T>(pathname: string, body: unknown): Promise<T> {
    const response = await fetch(new URL(pathname, this.options.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.apiKey}`,
        ...this.options.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Provider request failed (${response.status}): ${text}`);
    }

    return (await response.json()) as T;
  }
}

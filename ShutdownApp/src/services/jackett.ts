export interface JackettResult {
  title: string;
  size: string;
  seeders: number;
  peers: number;
  link: string;
  description?: string;
}

export class JackettService {
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = process.env.JACKETT_URL || "http://127.0.0.1:9117";
    this.apiKey = process.env.JACKETT_API_KEY || "";
  }

  async search(query: string, category?: string): Promise<JackettResult[]> {
    const url = process.env.JACKETT_URL || "http://127.0.0.1:9117";
    const apiKey = process.env.JACKETT_API_KEY || "";

    if (!apiKey) {
      console.error("Jackett Search Error: API Key is missing from process.env");
      throw new Error("Jackett API Key is not configured");
    }

    const searchUrl = `${url}/api/v2.0/indexers/all/results?apikey=${apiKey}&Query=${encodeURIComponent(query)}&format=json`;
    console.log("Jackett Search URL:", searchUrl.replace(apiKey, "HIDDEN"));
    
    try {
      const response = await fetch(searchUrl);
      console.log("Jackett Response Status:", response.status, response.statusText);
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Jackett Error Response:", text);
        throw new Error(`Jackett error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const results = data.Results || [];

      return results
        .map((item: any) => ({
          title: item.Title,
          size: this.formatBytes(item.Size),
          seeders: item.Seeders || 0,
          peers: item.Peers || 0,
          link: item.MagnetUri || item.Link || item.Guid,
          description: item.CategoryDesc ? `[${item.CategoryDesc}]` : undefined,
          source: item.Indexer || item.IndexerId || "Unknown",
          uploader: item.Poster || item.Author || null,
        }))
        .sort((a: JackettResult, b: JackettResult) => b.seeders - a.seeders);
    } catch (error) {
      console.error("Jackett Search Error:", error);
      throw error;
    }
  }

  private formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}

export const jackettService = new JackettService();

export class QBittorrentService {
  private cookie: string | null = null;

  private get config() {
    return {
      url: process.env.QBITTORRENT_URL || "http://127.0.0.1:8080",
      username: process.env.QBITTORRENT_USERNAME || "admin",
      password: process.env.QBITTORRENT_PASSWORD || "adminadmin",
    };
  }

  async login(): Promise<boolean> {
    const { url, username, password } = this.config;
    try {
      const response = await fetch(`${url}/api/v2/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
// ... rest of method

      if (response.ok) {
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
          this.cookie = setCookie.split(";")[0];
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("qBittorrent Login Error:", error);
      return false;
    }
  }

  async addTorrent(link: string, category: string): Promise<boolean> {
    if (!this.cookie) {
      const loggedIn = await this.login();
      if (!loggedIn) return false;
    }

    const { url } = this.config;
    const savePath = this.getSavePath(category);

    console.log(`[qBittorrent] Adding torrent: ${link.substring(0, 50)}...`);
    console.log(`[qBittorrent] Category: ${category}, SavePath: ${savePath}`);

    // qBittorrent expects multipart/form-data for torrents/add
    const formData = new FormData();
    formData.append("urls", link);
    formData.append("savepath", savePath);
    formData.append("category", category);
    formData.append("autoTMM", "false"); // Disable Automatic Torrent Management to respect savepath

    try {
      const response = await fetch(`${url}/api/v2/torrents/add`, {
        method: "POST",
        headers: { 
          "Cookie": this.cookie!,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log(`[qBittorrent] Response (${response.status}):`, responseText);

      return response.ok;
    } catch (error) {
      console.error("[qBittorrent] Add Torrent Error:", error);
      return false;
    }
  }


  private getSavePath(category: string): string {
    switch (category.toLowerCase()) {
      case "movies":
        return process.env.DOWNLOAD_PATH_MOVIES || "C:\\Downloads\\Movies";
      case "tvshows":
        return process.env.DOWNLOAD_PATH_TV || "C:\\Downloads\\TV Shows";
      default:
        return process.env.DOWNLOAD_PATH_OTHER || "C:\\Downloads\\Other";
    }
  }
}

export const qBittorrentService = new QBittorrentService();

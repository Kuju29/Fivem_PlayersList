const fetch = require("node-fetch");

class ApiFiveM {
  constructor(ip) {
    if (!ip) throw Error('Please put "IP:Port"');
    this.ip = ip;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchWithTimeout(url, options = {}, timeout = 5000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  }

  async checkOnlineStatus(maxRetries = 3) {
    const endpoints = ["/dynamic.json", "/players.json", "/info.json"];

    for (const endpoint of endpoints) {
      let retryCount = 0;
      while (retryCount < maxRetries) {
        try {
          const online = await this.fetchWithTimeout(
            `http://${this.ip}${endpoint}`
          );
          if (online.status >= 200 && online.status < 300) {
            return true;
          }
        } catch (err) {
          if (err.message !== "Request timed out") {
            console.error(err);
          }
        }
        retryCount++;
        await this.sleep(2 ** retryCount * 100 + Math.random() * 100);
      }
    }
    return false;
  }

  async getDynamic() {
    return await this.fetchData("/dynamic.json");
  }

  async getPlayers() {
    return await this.fetchData("/players.json");
  }

  async getInfo() {
    return await this.fetchData("/info.json");
  }

  async fetchData(endpoint, maxRetries = 3) {
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        const res = await this.fetchWithTimeout(`http://${this.ip}${endpoint}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        if (err.message !== "Request timed out") {
          console.error(err);
        }
      }
      retryCount++;
      await this.sleep(2 ** retryCount * 100 + Math.random() * 100);
    }
    return null;
  }
}

module.exports.ApiFiveM = ApiFiveM;

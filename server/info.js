const fetch = require('node-fetch');

class ApiFiveM {
  constructor(ip) {
    if (!ip) throw Error('Please put "IP:Port"');
    this.ip = ip;
  }

  async checkOnlineStatus() {
    const endpoints = ['/dynamic.json', '/players.json', '/info.json'];

    for (const endpoint of endpoints) {
      try {
        const online = await fetch(`http://${this.ip}${endpoint}`);
        if (online.status >= 200 && online.status < 300) {
          return true;
        }
      } catch (err) {
      }
    }
    return false;
  }

  async getDynamic() {
    return await this.fetchData('/dynamic.json');
  }

  async getPlayers() {
    return await this.fetchData('/players.json');
  }

  async getInfo() {
    return await this.fetchData('/info.json');
  }

  async fetchData(endpoint) {
    const res = await fetch(`http://${this.ip}${endpoint}`);
    return res.ok ? await res.json() : null;
  }
}

module.exports.ApiFiveM = ApiFiveM;

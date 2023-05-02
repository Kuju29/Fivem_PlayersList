const fetch = require('node-fetch');

async function tryFetchEndpoints(ip, endpoints) {
  for (const endpoint of endpoints) {
    try {
      const online = await fetch(`http://${ip}${endpoint}`);
      if (online.status >= 200 && online.status < 300) {
        return true;
      }
    } catch (err) {
    }
  }
  return false;
}

class ApiFiveM {
  constructor(ip) {
    if (!ip) throw Error('Please put "IP:Port"');
    this.ip = ip;
  }
  
  async checkOnlineStatus(ip) {
    const endpoints = ['/dynamic.json', '/players.json', '/info.json'];
    const isOnline = await tryFetchEndpoints(this.ip, endpoints);
    return isOnline;
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

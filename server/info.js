const fetch = require('node-fetch');

async function tryFetchEndpoints(ip, endpoints) {
  const fetchPromises = endpoints.map(endpoint => {
    return fetch(`http://${ip}${endpoint}`).then(response => {
      return response.status >= 200 && response.status < 300;
    }).catch(() => false);
  });

  const results = await Promise.allSettled(fetchPromises);
  return results.some(result => result.value);
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

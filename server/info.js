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

async function getServerInfo(url) {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
  };
  const edit_url = "https://servers-frontend.fivem.net/api/servers/single/" + url.match(/join\/(.+)/)[1];
  const res = await fetch(edit_url, { headers });
  return res.ok ? await res.json() : false;
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

module.exports = {
  ApiFiveM,
  getServerInfo,
};

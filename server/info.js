const fetch = require('node-fetch');

class ApiFiveM {
  constructor(ip) {
    if (!ip) throw Error('Please put "IP:Port"');
    this.ip = ip;
  }

  async checkOnlineStatus() {
    const endpoints = ['/dynamic.json', '/players.json', '/info.json'];
    const fetchPromises = endpoints.map(endpoint => {
      return fetch(`http://${this.ip}${endpoint}`).then(response => {
        return response.status >= 200 && response.status < 300;
      }).catch(() => false);
    });
  
    const results = await Promise.allSettled(fetchPromises);
    return results.some(result => result.value);
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
class Guild {
  async getServerInfo(url) {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    };
    const edit_url = "https://servers-frontend.fivem.net/api/servers/single/" + url.match(/join\/(.+)/)[1];
    const res = await fetch(edit_url, { headers });
    return res.status >= 200 && res.status < 300 ? await res.json() : false;
  }

  async domainAddress(url) {
    if (/^(?:\d{1,3}\.){3}\d{1,3}:\d+$/.test(url)) {
      return url;
    } else {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      const res = await fetch(`http://ip-api.com/json/${domain}`);
      return res.ok ? await res.json() : null;
    }
  }  

  async ipAddress(ip) {
    const parts = ip.split(':')[0];
    const res = await fetch(`http://ip-api.com/json/${parts}`);
    return res.ok ? await res.json() : null;
  }

  async validateIpAndPort(input) {
    var parts = input.split(":");
    var ip = parts[0].split(".");
    var port = parts[1];
    return ip.length === 4 && ip.every((segment) => this.validateNum(segment, 0, 255)) && this.validateNum(port, 1, 65535);
  }

  async get_icon(nameserver, keyicon) {
    const icon =  `https://servers-live.fivem.net/servers/icon/${nameserver}/${keyicon}.png`
    return icon
  }
  
  async validateNum(input, min, max) {
    var num = +input;
    return num >= min && num <= max && input === num.toString();
  }
  
  async chunkArray(arr, size) {
    const result = [];
    while (arr.length) {
      result.push(arr.splice(0, size));
    }
    return result;
  }
  
  async checkMessage(message) {
    return message.includes("https://cfx.re/join/") || message.includes("cfx.re/join/");
  }
}


module.exports = {
  ApiFiveM,
  Guild,
};

// const fetch = require('@vercel/fetch')(require('node-fetch'));
const fetch = require('node-fetch');

class ApiFiveM {
  constructor(ip) {
    if (!ip) throw Error('Please put "IP:Port"');
    this.ip = ip;
  }

  async checkOnlineStatus() {

    try {
      const online = await fetch(`http://${this.ip}/dynamic.json`);
      return online.status >= 200 && online.status < 300;
    } catch (err) {
      return false;
    }
  };

  async getDynamic() {

    const res = await fetch(`http://${this.ip}/dynamic.json`);
    const data = await res.json();

    if (res.ok) {
      return data;
    } else {
      return null;
    }
  };

  async getDynamicOnline() {

    const res = await fetch(`http://${this.ip}/dynamic.json`);
    const data = await res.json();

    if (res.ok) {
      return data.clients;
    } else {
      return null;
    }
  };

  async getDynamicMax() {

    const res = await fetch(`http://${this.ip}/dynamic.json`);
    const data = await res.json();

    if (res.ok) {
      return data.sv_maxclients;
    } else {
      return null;
    }
  };

  async getDynamicHost() {

    const res = await fetch(`http://${this.ip}/dynamic.json`);
    const data = await res.json();

    if (res.ok) {
      return data.hostname;
    } else {
      return null;
    }
  };

  async getPlayers() {

    const res = await fetch(`http://${this.ip}/players.json`);
    const data = await res.json();

    if (res.ok) {
      return data;
    } else {
      return null;
    }
  };

  async getInfo() {

    const res = await fetch(`http://${this.ip}/info.json`);
    const data = await res.json();

    if (res.ok) {
      return data;
    } else {
      return null;
    }
  };
};

module.exports.ApiFiveM = ApiFiveM;

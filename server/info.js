  const config = require('../config.json');
  const fetch = require('@vercel/fetch')(require('node-fetch'));

  const URL_SERVER = 'http://' + config.URL_SERVER;
  const URL_DYNAMIC = new URL('/dynamic.json', URL_SERVER).toString();
  const URL_PLAYERS = new URL('/players.json', URL_SERVER).toString();

  async function checkOnlineStatus() {

    try {
        const online = await fetch(URL_DYNAMIC);
        return online.status >= 200 && online.status < 300;
      } catch (err) {
        return false;
      }
  };

  async function getDynamic() {

    const res = await fetch(URL_DYNAMIC);
    const data = await res.json();

    if (res.ok) {
        return data;
      } else {
        return null;
      }
  };

  async function getPlayers() {

    const res = await fetch(URL_PLAYERS);
    const data = await res.json();
  
    if (res.ok) {
        return data;
      } else {
        return null;
      }
  };


  module.exports.checkOnlineStatus = checkOnlineStatus;
  module.exports.getDynamic = getDynamic;
  module.exports.getPlayers = getPlayers;
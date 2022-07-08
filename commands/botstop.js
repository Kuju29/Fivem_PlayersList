const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'botstop',
  description: `Used if your bot server doesn't have a manual stop system`,
  execute: async (message, args) => {
    console.log(`${config.PREFIX}stopbot - the bot has been stopped.....`)
    process.exit(0);
  },
};
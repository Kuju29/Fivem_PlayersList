const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'help',
  description: 'Bot commands list',
  execute: async (message, args) => {
    if (config.NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setDescription(`Completed \`${config.PREFIX}help\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {

          msg.delete();
          console.log(`Delete notification message ${config.PREFIX}help`);

        }, 5000);
      });
    }
    let embed = new Discord.MessageEmbed()
      .setTitle(`Bot commands list`)
      .setDescription(`\`\`\`fix
> ${config.PREFIX}s <name players> - Search players by name.
> ${config.PREFIX}id <number id>   - Search players by number.
> ${config.PREFIX}all              - Show all players.
> ${config.PREFIX}ip <ip:port>     - Shows status of a given server.
> ${config.PREFIX}start            - Send status server to channel.
> ${config.PREFIX}stop             - Stop send status server to channel.
> ${config.PREFIX}clear <number>   - Clear all message from bots
> ${config.PREFIX}botstop          - Used if your bot server doesn't have a manual stop system.\`\`\``)
      .setTimestamp()
      .setColor(config.COLORBOX)
      .setFooter({
        text: `Github: Kuju29/fivem-bots-discord`
      })
    message.reply({
      embeds: [embed]
    }).then((msg) => {
      console.log(`Completed ${config.PREFIX}help`);
      setTimeout(() => {
        if (config.AUTODELETE) {
          msg.delete();
          console.log(`Auto delete message ${config.PREFIX}help`);
        }
      }, 10000);
    });
  },
};
const Discord = require('discord.js');
const config = require('../config.json');
const fivem = require('../server/info.js');

const inFo = new fivem.ApiFiveM(config.URL_SERVER);

module.exports = {
  name: 'id',
  description: 'Search players by number',
  execute: async (message, args) => {
    if (config.NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setDescription(`Completed \`${config.PREFIX}id\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {

          msg.delete();
          console.log(`Delete notification message ${config.PREFIX}id`);

        }, 5000);
      });
    }
    inFo.getPlayers().then(async (players) => {
      let num = message.content.match(/[0-9]/g).join('').valueOf();
      let playerdata = players.filter(players => players.id == num);
      let result1 = [];
      let index = 1;
      for (let player of playerdata) {
        result1.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      const result = result1.join("\n").toString();
      let embed = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setTitle(`Search player | ${config.SERVER_NAME}`)
        .setDescription(result.length > 0 ? result : 'No Players')
        .setTimestamp();
      message.reply({
        embeds: [embed]
      }).then((msg) => {
        console.log(`Completed ${config.PREFIX}id ${num}`);
        setTimeout(() => {
          if (config.AUTODELETE) {
            msg.delete();
            console.log(`Auto delete message ${config.PREFIX}id ${num}`);
          }
        }, 10000);
      });
    }).catch((err) => {
      console.log(`Catch ERROR or Offline: ` + err);
    });
  },
};
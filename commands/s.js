const Discord = require('discord.js');
const config = require('../config.json');
const fivem = require('../server/info.js');

const inFo = new fivem.ApiFiveM(config.URL_SERVER);

module.exports = {
  name: 's',
  description: 'Search players by name',
  execute: async (message, args) => {
    inFo.getPlayers().then(async (players) => {
      if (config.NCOMMAND) {
        let embedss = new Discord.MessageEmbed()
          .setColor(config.COLORBOX)
          .setDescription(`Completed \`${config.PREFIX}s\``)
        message.reply({
          embeds: [embedss]
        }).then((msg) => {
          setTimeout(() => {

            msg.delete();
            console.log(`Delete notification message ${config.PREFIX}s`);

          }, 5000);
        });
      }
      let text = message.content.toLowerCase().substr(3, 20);
      let playerdata = players.filter(function (person) {
        return person.name.toLowerCase().includes(`${text}`)
      });
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
        console.log(`Completed ${config.PREFIX}s ${text}`);
        setTimeout(() => {
          if (config.AUTODELETE) {
            msg.delete();
            console.log(`Auto delete message ${config.PREFIX}s ${text}`);
          }
        }, 10000);
      });

    }).catch((err) => {
      console.log(`Catch ERROR or Offline: ` + err);
    });
  },
};
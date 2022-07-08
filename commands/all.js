const Discord = require('discord.js');
const config = require('../config.json');
const fivem = require('../server/info.js');
const {
  Pagination
} = require("discordjs-button-embed-pagination");

const inFo = new fivem.ApiFiveM(config.URL_SERVER);

function splitChunks(sourceArray, chunkSize) {
  let result = [];
  for (var i = 0; i < sourceArray.length; i += chunkSize) {
    result[i / chunkSize] = sourceArray.slice(i, i + chunkSize);
  }
  return result;
};

module.exports = {
  name: 'all',
  description: 'Show all players',
  execute: async (message, args) => {
    if (config.NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setDescription(`Completed \`${config.PREFIX}all\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {

          msg.delete();
          console.log(`Delete notification message ${config.PREFIX}all`);

        }, 5000);
      });
    }
    inFo.getPlayers().then(async (players) => {
      let result = [];
      let index = 1;
      for (let player of players) {
        result.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      if (message.member.permissions.has('MANAGE_MESSAGES')) {
        let chunks = splitChunks(result.join("\n").toString(), 2000);
        // let chunks = Discord.Util.splitMessage(result.join("\n"))
        let embed = new Discord.MessageEmbed().setTitle(`All_players | ${config.SERVER_NAME}`);
        if (result.length > 1) {
          const embeds = chunks.map((chunk) => {
            return new Discord.MessageEmbed()
              .setColor(config.COLORBOX)
              .setDescription(chunk)
          });
          await new Pagination(message.channel, embeds, "Part").paginate();
          console.log(`Completed !all`);
        } else {
          embed.setColor(config.COLORBOX)
            .setDescription(result.length > 0 ? result : 'No Players')
          message.reply({
            embeds: [embed]
          }).then((msg) => {
            console.log(`Completed ${config.PREFIX}all No Players`);
            setTimeout(() => {
              if (config.AUTODELETE) {
                msg.delete();
                console.log(`Auto delete message ${config.PREFIX}all No Players`);
              }
            }, 10000);
          });
        }
      } else {
        let embed = new Discord.MessageEmbed()
          .setColor(config.COLORBOX)
          .setTitle(`Search player | Error`)
          .setDescription(`❌ You do not have the ${'MANAGE_MESSAGES'}, therefor you cannot run this command!`)
          .setTimestamp(new Date());
        message.reply({
          embeds: [embed]
        }).then((msg) => {
          console.log(`Error ${config.PREFIX}all`);
          setTimeout(() => {
            if (config.AUTODELETE) {
              msg.delete();
              console.log(`Auto delete message Error ${config.PREFIX}all`);
            }
          }, 10000);
        });
      }
    }).catch((err) => {
      console.log(`Catch ERROR or Offline: ` + err);
    });
  },
};
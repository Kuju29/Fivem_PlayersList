const Discord = require('discord.js');
const config = require('../config.json');
const fivem = require('../server/info.js');

function validateIpAndPort(input) {
  var parts = input.split(":");
  var ip = parts[0].split(".");
  var port = parts[1];
  return validateNum(port, 1, 65535) && ip.length == 4 && ip.every(function (segment) {
    return validateNum(segment, 0, 255);
  });
}

function validateNum(input, min, max) {
  var num = +input;
  return num >= min && num <= max && input === num.toString();
}

module.exports = {
  name: 'ip',
  description: 'Shows status of a given server',
  execute: async (message, args) => {
    if (config.NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setDescription(`Completed \`${config.PREFIX}ip\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {

          msg.delete();
          console.log(`Delete notification message ${config.PREFIX}ip`);

        }, 5000);
      });
    }
    let text = message.content.toLowerCase().substr(4, 24);
    let testip = validateIpAndPort(text);
    const iNfo = new fivem.ApiFiveM(text);
    if (testip) {
      iNfo.checkOnlineStatus().then(async (server) => {
        if (server) {
          let infoplayers = (await iNfo.getDynamic());
          let embed = new Discord.MessageEmbed()
            .setColor(config.COLORBOX)
            .setTitle(`Server: \`${text}\``)
            .addField('**Server Status**', `\`\`\`✅Online\`\`\``, true)
            .addField('**Online Players**', `\`\`\`${infoplayers.clients}/${infoplayers.sv_maxclients}\`\`\``, true)
            .setTimestamp(new Date());
          message.reply({
            embeds: [embed]
          }).then((msg) => {
            console.log(`Completed ${config.PREFIX}ip ${text} online`);
            setTimeout(() => {
              if (config.AUTODELETE) {
                msg.delete();
                console.log(`Auto delete message ${config.PREFIX}ip ${text} online`);
              }
            }, 10000);
          });
        } else {
          let embed = new Discord.MessageEmbed()
            .setColor(config.COLORBOX)
            .setTitle(`Server: \`${text}\``)
            .addField('**Server Status**', `\`\`\`❌Offline or Invalid IP\`\`\``, true)
            .addField('**Online Players**', `\`\`\`-/-\`\`\``, true)
            .setTimestamp(new Date());
          message.reply({
            embeds: [embed]
          }).then((msg) => {
            console.log(`Completed ${config.PREFIX}ip ${text} offline`);
            setTimeout(() => {
              if (config.AUTODELETE) {
                msg.delete();
                console.log(`Auto delete message ${config.PREFIX}ip ${text} offline`);
              }
            }, 10000);
          });
        }
      }).catch((err) => {
        console.log(`Catch ERROR or Offline: ` + err);
      });
    } else {
      let embed = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .addField(`**Are you sure the IP is correct?**`, `\`${text}\``, true)
        .setTimestamp(new Date());
      message.reply({
        embeds: [embed]
      }).then((msg) => {
        console.log(`Completed ${config.PREFIX}ip Check IP: ${text}`);
        setTimeout(() => {
          if (config.AUTODELETE) {
            msg.delete();
            console.log(`Auto delete message ${config.PREFIX}ip Are you sure the IP is correct? ${text}`);
          }
        }, 10000);
      });
    };
  },
};
const Discord = require('discord.js');
const bot = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGES]
});
bot.commands = new Discord.Collection();
const {
  Pagination
} = require("discordjs-button-embed-pagination");

const config = require('./config.json');
const fivem = require('./server/info.js');
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

var IPPP;
var Iname;

console.logCopy = console.log.bind(console);
console.log = function (data) {
  var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  var currentDate = '|' + new Date().toLocaleString({
    timeZone: timezone
  }).slice(11, -3) + '|';
  this.logCopy(currentDate, data);
};

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

function splitChunks(sourceArray, chunkSize) {
  let result = [];
  for (var i = 0; i < sourceArray.length; i += chunkSize) {
    result[i / chunkSize] = sourceArray.slice(i, i + chunkSize);
  }
  return result;
};


const activity = async () => {

  if (IPPP !== undefined) {
    inFo = new fivem.ApiFiveM(IPPP);
  } else {
    inFo = new fivem.ApiFiveM(config.URL_SERVER);
  }

  if (Iname !== undefined) {
    namename = Iname;
  } else {
    namename = config.NAMELIST;
  }

  inFo.checkOnlineStatus().then(async (server) => {
    if (server) {
      let players = (await inFo.getPlayers());
      let playersonline = (await inFo.getDynamic()).clients;
      let maxplayers = (await inFo.getDynamic()).sv_maxclients;
      let namef = players.filter(function (person) {
        return person.name.toLowerCase().includes(namename);
      });

      if (playersonline === 0) {
        bot.user.setActivity(`⚠ Wait for Connect`, {
          'type': 'WATCHING'
        });
        console.log(`Wait for Connect update at activity`);
      } else if (playersonline >= 1) {
        if (namef.length === 0) {
          bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 🌎 ${(await inFo.getDynamic()).hostname}`, {
            'type': 'WATCHING'
          });
          console.log(`Update ${playersonline} at activity`);
        } else {
          bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length} 🌎 ${(await inFo.getDynamic()).hostname}`, {
            'type': 'WATCHING'
          });
          console.log(`Update ${playersonline} at activity`);
        }
      }

    } else {
      bot.user.setActivity(`🔴 Offline`, {
        'type': 'WATCHING'
      });
      console.log(`Offline at activity`);
    }

  }).catch((err) => {
    console.log(`Catch ERROR` + err);
  });

};

//  -------------------------

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.tag}`);
  setInterval(async () => {
    activity();
  }, config.UPDATE_TIME);
});

//  -------------------------

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.on('messageCreate', async (message) => {
  if (!message.content.startsWith(config.PREFIX) || message.author.bot) return
  const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) return
  try {
    bot.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
  }

});

bot.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  let args = message.content.toLowerCase().split(" ");
  let command = args.shift()

  if (IPPP !== undefined) {
    inFo = new fivem.ApiFiveM(IPPP);
  } else {
    inFo = new fivem.ApiFiveM(config.URL_SERVER);
  }

  if (command == config.PREFIX + 'set') {
    let text = message.content.toLowerCase().substr(5, 20);
    if (validateIpAndPort(text)) {
      IPPP = text;
      console.log(`${config.PREFIX}set IP ${text}`)
    } else {
      let embedss = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setDescription(`\`${config.PREFIX}set\` **IP incorrect**`)
      message.reply({
        embeds: [embedss]
      })
      console.log(`${config.PREFIX}set IP incorrect`)
    }
  }

  if (command == config.PREFIX + 'name') {
    let text = message.content.toLowerCase().substr(6, 20);
    Iname = text;
    console.log(`${config.PREFIX}name ${text}`)
  }

  if (command == config.PREFIX + 'all') {
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
  }

  if (command == config.PREFIX + 'id') {
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
  }

  if (command == config.PREFIX + 'ip') {
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
  }

  if (command == config.PREFIX + 's') {
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
  }

});

bot.login(config.BOT_TOKEN).then(null).catch(() => {
  console.log('The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!');
  console.error();
  process.exit(1);
});

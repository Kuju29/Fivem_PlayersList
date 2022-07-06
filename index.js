const Discord = require('discord.js');
const bot = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGES]
});

const config = require('./config.json');
const fivem = require('./server/info.js');
const {
  Pagination
} = require("discordjs-button-embed-pagination");

const SERVER_NAME = config.SERVER_NAME;
const BOT_TOKEN = config.BOT_TOKEN;
const SERVER_LOGO = config.SERVER_LOGO;
const COLORBOX = config.COLORBOX;
const NAMELIST = config.NAMELIST;
const NAMELISTENABLE = config.NAMELISTENABLE;
const AUTODELETE = config.AUTODELETE;
const NCOMMAND = config.NCOMMAND;
const VfetchOrNfetch = config.VfetchOrNfetch;
const UPDATE_TIME = config.UPDATE_TIME;
const PREFIX = config.PREFIX;

const inFo = new fivem.ApiFiveM(config.URL_SERVER);

var STATUS;

console.logCopy = console.log.bind(console);
console.log = function (data) {
  var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  var currentDate = '|' + new Date().toLocaleString({
    timeZone: timezone
  }).slice(10, -3) + '|';
  this.logCopy(currentDate, data);
};

const activity = async () => {
  inFo.checkOnlineStatus().then(async (server) => {
    if (server !== false) {
      let players = (await inFo.getPlayers());
      let playersonline = (await inFo.getDynamic()).clients;
      let maxplayers = (await inFo.getDynamic()).sv_maxclients;
      let namef = players.filter(function (person) {
        return person.name.toLowerCase().includes(NAMELIST);
      });

      if (playersonline === 0) {
        bot.user.setActivity(`⚠ Wait for Connect`, {
          'type': 'WATCHING'
        });
        console.log(`Wait for Connect update at activity`);
      } else if (playersonline >= 1) {
        if (NAMELISTENABLE) {
          bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length}`, {
            'type': 'WATCHING'
          });
          console.log(`Update ${playersonline} at activity`);
        } else {
          bot.user.setActivity(`💨 ${playersonline}/${maxplayers}`, {
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

function splitChunks(sourceArray, chunkSize) {
  let result = [];
  for (var i = 0; i < sourceArray.length; i += chunkSize) {
    result[i / chunkSize] = sourceArray.slice(i, i + chunkSize);
  }
  return result;
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

//  -------------------------

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.tag}`);
  setInterval(async () => {
    activity();
  }, UPDATE_TIME);
});

//  -------------------------

bot.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  let args = message.content.toLowerCase().split(" ");
  let command = args.shift()

  if (command == PREFIX + 'help') {
    if (NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setDescription(`Completed \`${PREFIX}help\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
          console.log(`Delete notification message ${PREFIX}help`);
        }, 5000);
      });
    }
    let embed = new Discord.MessageEmbed()
      .setTitle(`Bot commands list`)
      .setDescription(`\`\`\`fix
> ${PREFIX}s <name players> - Search players by name.
> ${PREFIX}id <number id>   - Search players by number.
> ${PREFIX}all              - Show all players.
> ${PREFIX}ip <ip:port>     - Shows status of a given server.
> ${PREFIX}start            - Send status server to channel.
> ${PREFIX}stop             - Stop send status server to channel.
> ${PREFIX}clear <number>   - Clear all message from bots
> ${PREFIX}botstop          - Manual stop system.\`\`\``)
      .setTimestamp()
      .setColor(COLORBOX)
      .setFooter({
        text: `Github: Kuju29/fivem-bots-discord`
      })
    message.reply({
      embeds: [embed]
    }).then((msg) => {
      console.log(`Completed ${PREFIX}help`);
      setTimeout(() => {
        if (AUTODELETE) {
          msg.delete();
          console.log(`Auto delete message ${PREFIX}help`);
        }
      }, 10000);
    });
  }

  //  -------------------------

  if (command == PREFIX + 'start') {
    console.log(`Completed ${PREFIX}start`);
    if (NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setDescription(`Completed \`${PREFIX}start\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {
          if (AUTODELETE) {
            msg.delete();
            console.log(`Delete notification message ${PREFIX}start`);
          }
        }, 5000);
      });
    }
    sTart = setInterval(async function () {
      inFo.checkOnlineStatus().then(async (server) => {
        if (server !== false) {
          setTimeout(() => {
            let embed = new Discord.MessageEmbed()
              .setColor(COLORBOX)
              .setThumbnail(SERVER_LOGO)
              .setTitle(SERVER_NAME)
              .setDescription(`Server Status : **Online** 🟢\nTag : `)
              .setTimestamp(new Date());
            if (STATUS !== "Online") return message.channel.send({
              embeds: [embed]
            }).then((message) => {
              STATUS = "Online";
              console.log('Send Online message done');
            }).catch((err) => {
              clearInterval(sTart);
              console.log('catch error stop !start' + err);
            });
          }, 2000);
        } else {
          setTimeout(() => {
            let embed = new Discord.MessageEmbed()
              .setColor(COLORBOX)
              .setThumbnail(SERVER_LOGO)
              .setTitle(SERVER_NAME)
              .setDescription(`Server Status : **Offline** 🔴\nTag : `)
              .setTimestamp(new Date());
            if (STATUS !== null) return message.channel.send({
              embeds: [embed]
            }).then(async (message) => {
              STATUS = null;
              console.log('Send Offline message done');
            });
          }, 2000);
        }
      }).catch((err) => {
        setTimeout(() => {
          let embed = new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setThumbnail(SERVER_LOGO)
            .setTitle(SERVER_NAME)
            .setDescription(`Server Status : **Offline** 🔴\nTag : `)
            .setTimestamp(new Date());
          if (STATUS !== null) return message.channel.send({
            embeds: [embed]
          }).then(async (message) => {
            STATUS = null;
            console.log('Send Offline message done');
          });
        }, 2000);
      });
    }, UPDATE_TIME);
  }

  if (command == PREFIX + 'stop') {
    clearInterval(sTart);
    console.log(`Completed ${PREFIX}stop`);
    if (NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setDescription(`Completed \`${PREFIX}stop\``)
      if (NCOMMAND) return message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
          console.log(`Delete notification message ${PREFIX}stop`);
        }, 5000);
      });
    }
  }

  //  -------------------------

  inFo.getPlayers().then(async (players) => {

    if (command == PREFIX + 's') {
      if (NCOMMAND) {
        let embedss = new Discord.MessageEmbed()
          .setColor(COLORBOX)
          .setDescription(`Completed \`${PREFIX}s\``)
        message.reply({
          embeds: [embedss]
        }).then((msg) => {
          setTimeout(() => {
            msg.delete();
            console.log(`Delete notification message ${PREFIX}s`);
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
        .setColor(COLORBOX)
        .setTitle(`Search player | ${SERVER_NAME}`)
        .setDescription(result.length > 0 ? result : 'No Players')
        .setTimestamp();
      message.reply({
        embeds: [embed]
      }).then((msg) => {
        console.log(`Completed ${PREFIX}s ${text}`);
        setTimeout(() => {
          if (AUTODELETE) {
            msg.delete();
            console.log(`Auto delete message ${PREFIX}s ${text}`);
          }
        }, 10000);
      });
    }

    if (command == PREFIX + 'id') {
      if (NCOMMAND) {
        let embedss = new Discord.MessageEmbed()
          .setColor(COLORBOX)
          .setDescription(`Completed \`${PREFIX}id\``)
        message.reply({
          embeds: [embedss]
        }).then((msg) => {
          setTimeout(() => {
            msg.delete();
            console.log(`Delete notification message ${PREFIX}id`);
          }, 5000);
        });
      }
      let num = message.content.match(/[0-9]/g).join('').valueOf();
      let playerdata = players.filter(players => players.id == num);
      let result1 = [];
      let index = 1;
      for (let player of playerdata) {
        result1.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      const result = result1.join("\n").toString();
      let embed = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setTitle(`Search player | ${SERVER_NAME}`)
        .setDescription(result.length > 0 ? result : 'No Players')
        .setTimestamp();
      message.reply({
        embeds: [embed]
      }).then((msg) => {
        console.log(`Completed ${PREFIX}id ${num}`);
        setTimeout(() => {
          if (AUTODELETE) {
            msg.delete();
            console.log(`Auto delete message ${PREFIX}id ${num}`);
          }
        }, 10000);
      });
    }

    if (command == PREFIX + 'all') {
      if (NCOMMAND) {
        let embedss = new Discord.MessageEmbed()
          .setColor(COLORBOX)
          .setDescription(`Completed \`${PREFIX}all\``)
        message.reply({
          embeds: [embedss]
        }).then((msg) => {
          setTimeout(() => {
            msg.delete();
            console.log(`Delete notification message ${PREFIX}all`);
          }, 5000);
        });
      }
      let result = [];
      let index = 1;
      for (let player of players) {
        result.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      let chunks = splitChunks(result.join("\n").toString(), 2000);
      // let chunks = Discord.Util.splitMessage(result.join("\n"))
      let embed = new Discord.MessageEmbed().setTitle(`All_players | ${SERVER_NAME}`);
      if (result.length > 1) {
        const embeds = chunks.map((chunk) => {
          return new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setDescription(chunk)
        });
        await new Pagination(message.channel, embeds, "Part").paginate();
        console.log(`Completed !all`);
      } else {
        embed.setColor(COLORBOX)
          .setDescription(result.length > 0 ? result : 'No Players')
        message.reply({
          embeds: [embed]
        }).then((msg) => {
          console.log(`Completed ${PREFIX}all No Players`);
          setTimeout(() => {
            if (AUTODELETE) {
              msg.delete();
              console.log(`Auto delete message ${PREFIX}all No Players`);
            }
          }, 10000);
        });
      }
    }

  }).catch((err) => {
    console.log(`Catch ERROR` + err);
  });

  //  -------------------------

  if (command == PREFIX + 'clear') {
    if (NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setDescription(`Completed \`${PREFIX}clear\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
          console.log(`Delete notification message ${PREFIX}clear`);
        }, 5000);
      });
    }
    let num = message.content.match(/[0-9]/g).join('').valueOf();
    const Channel = message.channel;
    const Messages = await Channel.messages.fetch({
      limit: num
    });
    Messages.forEach(message => {
      if (message.author.bot) message.delete()
    });
    console.log(`Completed ${PREFIX}Clear ${num}`);
  }

  if (command == PREFIX + 'ip') {
    if (NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setDescription(`Completed \`${PREFIX}ip\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
          console.log(`Delete notification message ${PREFIX}ip`);
        }, 5000);
      });
    }
    let text = message.content.toLowerCase().substr(4, 24);
    let testip = validateIpAndPort(text);
    const iNfo = new fivem.ApiFiveM(text);
    if (testip) {
      iNfo.checkOnlineStatus().then(async (server) => {
        if (server !== false) {
          let infoplayers = (await iNfo.getDynamic());
          let embed = new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setTitle(`Server: \`${text}\``)
            .addField('**Server Status**', `\`\`\`✅Online\`\`\``, true)
            .addField('**Online Players**', `\`\`\`${infoplayers.clients}/${infoplayers.sv_maxclients}\`\`\``, true)
            .setTimestamp(new Date());
          message.reply({
            embeds: [embed]
          }).then((msg) => {
            console.log(`Completed ${PREFIX}ip ${text} online`);
            setTimeout(() => {
              if (AUTODELETE) {
                msg.delete();
                console.log(`Auto delete message ${PREFIX}ip ${text} online`);
              }
            }, 10000);
          });
        } else {
          let embed = new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setTitle(`Server: \`${text}\``)
            .addField('**Server Status**', `\`\`\`❌Offline or Invalid IP\`\`\``, true)
            .addField('**Online Players**', `\`\`\`-/-\`\`\``, true)
            .setTimestamp(new Date());
          message.reply({
            embeds: [embed]
          }).then((msg) => {
            console.log(`Completed ${PREFIX}ip ${text} offline`);
            setTimeout(() => {
              if (AUTODELETE) {
                msg.delete();
                console.log(`Auto delete message ${PREFIX}ip ${text} offline`);
              }
            }, 10000);
          });
        }
      }).catch((err) => {
        console.log(`Catch ERROR or Offline: ` + err);
      });
    } else {
      let embed = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .addField(`**Are you sure the IP is correct?**`, `\`${text}\``, true)
        .setTimestamp(new Date());
      message.reply({
        embeds: [embed]
      }).then((msg) => {
        console.log(`Completed ${PREFIX}ip Check IP: ${text}`);
        setTimeout(() => {
          if (AUTODELETE) {
            msg.delete();
            console.log(`Auto delete message ${PREFIX}ip Are you sure the IP is correct? ${text}`);
          }
        }, 10000);
      });
    };
  }

  if (command == PREFIX + 'botstop') {
    console.log(`${PREFIX}stopbot - the bot has been stopped.....`);
    process.exit(0);
  }

});

//  -------------------------

bot.login(BOT_TOKEN).then(null).catch(() => {
  console.log('The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!');
  console.error();
  process.exit(1);
});

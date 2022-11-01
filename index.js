const Discord = require('discord.js');
const bot = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGES]
});
bot.commands = new Discord.Collection();

const config = require('./config.json');
const fivem = require('./server/info.js');
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

var IPPP;

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

const activity = async () => {
  if (IPPP !== undefined) {
    const inFo = new fivem.ApiFiveM(IPPP);
    inFo.checkOnlineStatus().then(async (server) => {
      if (server) {
        let players = (await inFo.getPlayers());
        let playersonline = (await inFo.getDynamic()).clients;
        let maxplayers = (await inFo.getDynamic()).sv_maxclients;
        let namef = players.filter(function (person) {
          return person.name.toLowerCase().includes(config.NAMELIST);
        });
        console.log(namef.length)

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
          } else if (config.NAMELISTENABLE) {
            bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length} 🌎 ${(await inFo.getDynamic()).hostname}`, {
              'type': 'WATCHING'
            });
            console.log(`Update ${playersonline} at activity`);
          } else {
            bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 🌎 ${(await inFo.getDynamic()).hostname}`, {
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
  } else {
    const inFo = new fivem.ApiFiveM(config.URL_SERVER);
    inFo.checkOnlineStatus().then(async (server) => {
      if (server) {
        let players = (await inFo.getPlayers());
        let playersonline = (await inFo.getDynamic()).clients;
        let maxplayers = (await inFo.getDynamic()).sv_maxclients;
        let namef = players.filter(function (person) {
          return person.name.toLowerCase().includes(config.NAMELIST);
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
          } else if (config.NAMELISTENABLE) {
            bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length} 🌎 ${(await inFo.getDynamic()).hostname}`, {
              'type': 'WATCHING'
            });
            console.log(`Update ${playersonline} at activity`);
          } else {
            bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 🌎 ${(await inFo.getDynamic()).hostname}`, {
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
  }
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

});

bot.login(config.BOT_TOKEN).then(null).catch(() => {
  console.log('The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!');
  console.error();
  process.exit(1);
});

const Discord = require('discord.js');
const bot = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGES]
});
bot.commands = new Discord.Collection();

const config = require('./config.json');
const fivem = require('./server/info.js');
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

const PREFIX = config.PREFIX;
const COLORBOX = config.COLORBOX;
const NAMELIST = config.NAMELIST;
const NAMELISTENABLE = config.NAMELISTENABLE;
const SERVER_NAME = config.SERVER_NAME;
const BOT_TOKEN = config.BOT_TOKEN;
const UPDATE_TIME = config.UPDATE_TIME;
const SERVER_LOGO = config.SERVER_LOGO;
const AUTODELETE = config.AUTODELETE;

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
    if (server) {
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

//  -------------------------

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.tag}`);
  setInterval(async () => {
    activity();
  }, UPDATE_TIME);
});

//  -------------------------

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) return
  try {
    bot.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
  }

});

//  -------------------------

bot.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  let args = message.content.toLowerCase().split(" ");
  let command = args.shift()

  if (command == PREFIX + 'start') {
    console.log(`Completed ${PREFIX}start`);
    if (config.NCOMMAND) {
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
        if (server) {
          let embed = new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setThumbnail(SERVER_LOGO)
            .setTitle(SERVER_NAME)
            .setDescription(`Server Status : **Online** 🟢\nTag : `)
            .setTimestamp(new Date());
          setTimeout(() => {
            if (STATUS !== "Online") return message.channel.send({
              embeds: [embed]
            }).then((message) => {
              STATUS = "Online";
              console.log('Send Online message done');
            }).catch((err) => {
              clearInterval(sTart);
              console.log('catch error stop !start' + err);
            });
          }, 1500);

        } else {
          let embed = new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setThumbnail(SERVER_LOGO)
            .setTitle(SERVER_NAME)
            .setDescription(`Server Status : **Offline** 🔴\nTag : `)
            .setTimestamp(new Date());
          setTimeout(() => {
            if (STATUS !== null) return message.channel.send({
              embeds: [embed]
            }).then(async (message) => {
              STATUS = null;
              console.log('Send Offline message done');
            }).catch((err) => {
              clearInterval(sTart);
              console.log('catch error stop !start' + err);
            });
          }, 1500);
        }

      }).catch((err) => {
        let embed = new Discord.MessageEmbed()
          .setColor(COLORBOX)
          .setThumbnail(SERVER_LOGO)
          .setTitle(SERVER_NAME)
          .setDescription(`Server Status : **Offline** 🔴\nTag : `)
          .setTimestamp(new Date());
        setTimeout(() => {
          if (STATUS !== null) return message.channel.send({
            embeds: [embed]
          }).then(async (message) => {
            STATUS = null;
            console.log('Send Offline message done');
          }).catch((err) => {
            clearInterval(sTart);
            console.log('catch error stop !start' + err);
          });
        }, 1500);
      });
    }, UPDATE_TIME);
  }

  if (command == PREFIX + 'stop') {
    clearInterval(sTart);
    console.log(`Completed ${PREFIX}stop`);
    if (config.NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(COLORBOX)
        .setDescription(`Completed \`${PREFIX}stop\``)
      if (config.NCOMMAND) return message.reply({
        embeds: [embedss]
      }).then((msg) => {

        setTimeout(() => {

          msg.delete();
          console.log(`Delete notification message ${PREFIX}stop`);

        }, 5000);
      });
    }
  }

});

//  -------------------------

bot.login(BOT_TOKEN).then(null).catch(() => {
  console.log('The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!');
  console.error();
  process.exit(1);
});

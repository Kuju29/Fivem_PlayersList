  const config = require('./config.json');
  const Discord = require("discord.js");
  const bot = new Discord.Client({
   intents : [
     Discord.Intents.FLAGS.GUILDS ,
     Discord.Intents.FLAGS.GUILD_MEMBERS ,
     Discord.Intents.FLAGS.GUILD_BANS ,
     Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS ,
     Discord.Intents.FLAGS.GUILD_INTEGRATIONS ,
     Discord.Intents.FLAGS.GUILD_WEBHOOKS ,
     Discord.Intents.FLAGS.GUILD_INVITES ,
     Discord.Intents.FLAGS.GUILD_VOICE_STATES ,
     Discord.Intents.FLAGS.GUILD_PRESENCES ,
     Discord.Intents.FLAGS.GUILD_MESSAGES ,
     Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS ,
     Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING ,
     Discord.Intents.FLAGS.DIRECT_MESSAGES , 
     Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS ,
     Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING ,
    ],
    allowedMentions: {
        parse: ["everyone", "roles", "users"],
        repliedUser: true
    },
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]

  });

//  -------------------------

  const fetch = require('@vercel/fetch')(require('node-fetch'));

//  -------------------------

  const prefix = config.PREFIX;
  const PERMISSION = config.PERMISSION;
  const SERVER_NAME = config.SERVER_NAME;
  const BOT_TOKEN = config.BOT_TOKEN;
  const URL_SERVER = 'http://' + config.URL_SERVER;
  const URL_DYNAMIC = new URL('/dynamic.json', URL_SERVER).toString();
  const URL_PLAYERS = new URL('/players.json', URL_SERVER).toString();
  const UPDATE_TIME = config.UPDATE_TIME;

//  -------------------------

  async function checkOnlineStatus() {

    try {
        const online = await fetch(URL_DYNAMIC);
        return online.status >= 200 && online.status < 300;
      } catch (err) {
        return false;
      }
  };

  async function getDynamic() {

    const res = await fetch(URL_DYNAMIC);
    const data = await res.json();

    if (res.ok) {
        return data;
      } else {
        return null;
      }
  };

  async function getPlayers() {

    const res = await fetch(URL_PLAYERS);
    const data = await res.json();
  
    if (res.ok) {
        return data;
      } else {
        return null;
      }
  };

//  -------------------------

  console.logCopy = console.log.bind(console);

  console.log = function(data)
    {
        var currentDate = new Date().toISOString().slice(11,-5);
        this.logCopy(currentDate, data);
    };

  const activity = async () => {
    checkOnlineStatus().then(async(server) => {
      if (server) {
        let players = (await getPlayers());
        let playersonline = (await getDynamic()).clients;
        let maxplayers = (await getDynamic()).sv_maxclients;
        let namef = players.filter(function(person) {
        return person.name.toLowerCase().includes("police");
        });
                
        if (playersonline === 0) {
          bot.user.setActivity(`⚠ Wait for Connect`,{'type':'WATCHING'});
          console.log(`Wait for Connect update at actiVity`);
        } else if (playersonline >= 1) {
          bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length}`,{'type':'WATCHING'});
          console.log(`${playersonline} update at actiVity`);
        }
      } else {
        bot.user.setActivity(`🔴 Offline`,{'type':'WATCHING'});
        console.log(`offline at actiVity`);
      }
    }).catch ((err) =>{
        console.log(`Catch ERROR`+ err);
    });
  };


//  -------------------------

  bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.tag}`);
    setInterval(async() => {
        activity();
      }, UPDATE_TIME);
  });

//  -------------------------

  bot.on("messageCreate", async(message) =>{
  if (message.author.bot || !message.guild) return;
    let args = message.content.toLowerCase().split(" ");
    let command = args.shift()

  if (command == prefix + `help`) {
      let embed = new Discord.MessageEmbed()
        .setTitle(`Bot commands list`)
        .setDescription(`> \`${prefix}s\` - name players
    > \`${prefix}id\` - number id
    > \`${prefix}all\` - all players
    > \`${prefix}clear\` - clear all message from bots`)
        .setTimestamp()
        .setColor(0x5865F2)
        .setFooter(`Bot by Kuju29`)
      message.reply({ embeds: [embed]})
      console.log(`Completed ${prefix}help`);
  }

  if (command == prefix + 's') {
    getPlayers().then(async(players) => {
      let text = message.content.toLowerCase().substr(3,20);
      let playerdata = players.filter(function(person) { return person.name.toLowerCase().includes(`${text}`) });
      let result  = [];
      let index = 1;
      for (let player of playerdata) {
        result.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      if (message.member.permissions.has(PERMISSION)) {
          let search1 = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle(`Search player | ${SERVER_NAME}`)
            .setDescription((result.length > 0 ? result : 'No Players').join("\n"))
            .setTimestamp();
          message.reply({ embeds: [search1] })
          console.log(`Completed ${prefix}s ${text}`);
      } else {
          let noPerms1 =  new Discord.MessageEmbed()
            .setColor(0x2894C2)
            .setTitle(`Search player | Error`)
            .setDescription(`❌ You do not have the ${PERMISSION}, therefor you cannot run this command!`)
            .setTimestamp(new Date());
          message.reply({ embeds: [noPerms1] })
          console.log(`Error ${prefix}s message`);
      }  
    });
  }

  if (command == prefix + 'id') {
    getPlayers().then(async(players) => {
      let num = message.content.match(/[0-9]/g).join('').valueOf();
      let playerdata = players.filter(players => players.id == num);
      let result  = [];
      let index = 1;
      for (let player of playerdata) {
        result.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      if (message.member.permissions.has(PERMISSION)) {
          let id2 = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle(`Search player | ${SERVER_NAME}`)
            .setDescription((result.length > 0 ? result : 'No Players').join("\n"))
            .setTimestamp();
          message.reply({ embeds: [id2] })
          console.log(`Completed ${prefix}id ${num}`);
      } else {
          let noPerms2 =  new Discord.MessageEmbed()
            .setColor(0x2894C2)
            .setTitle(`Search player | Error`)
            .setDescription(`❌ You do not have the ${PERMISSION}, therefor you cannot run this command!`)
            .setTimestamp(new Date());
          message.reply({ embeds: [noPerms2] })
          console.log(`Error ${prefix}id message`);
      }  
    });
  }

  if (command == prefix + 'all') {
    getPlayers().then(async(players) => {
      let result  = [];
      let index = 1;
      for (let player of players) {
        result.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      let chunks = Discord.Util.splitMessage(result.join(""))
      if (message.member.permissions.has(PERMISSION)) {
        if (result.length > 1) {
        let embed = new Discord.MessageEmbed();
           chunks.map((chunk, i) => {
              embed.setTitle(`All_players | ${SERVER_NAME}`)
              embed.setDescription(chunk)
              embed.setFooter(`Part ${i + 1} / ${chunks.length}`)
              message.channel.send({ embeds: [embed] })
              console.log(`Completed !all Part ${i + 1} / ${chunks.length}`);
            });
         } else {
            message.reply({ content: embed.setDescription(result.length > 0 ? result: 'No Players') });  
            console.log(`Completed ${prefix}all No Players`);
         }
      } else {
          let noPerms2 = new Discord.MessageEmbed()
            .setColor(0x2894C2)
            .setTitle(`Search player | Error`)
            .setDescription(`❌ You do not have the ${PERMISSION}, therefor you cannot run this command!`)
            .setTimestamp(new Date());
          message.reply({ embeds: [noPerms2] })
          console.log(`Error ${prefix}all`);
    }  
    });
  }

  if (command == prefix + 'clear') {
      let num = message.content.match(/[0-9]/g).join('').valueOf();
        const Channel = message.channel;
        const Messages = await Channel.messages.fetch({limit: num});

        Messages.forEach(message => {
            if (message.author.bot) message.delete()
        });
        console.log(`Completed ${prefix}Clear ${num}`);
  }

  });
  
//  -------------------------

  bot.login(BOT_TOKEN).then(null).catch(() => {
    console.log('The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!');
    console.error(e);
    process.exit(1);
  });

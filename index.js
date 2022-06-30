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

  const config = require('./config.json');
  const inFo = require('./server/info.js');

  const prefix = config.PREFIX;
  const PERMISSION = config.PERMISSION;
  const COLORBOX = config.COLORBOX;
  const NAMELIST = config.NAMELIST;
  const NAMELISTENABLE = config.NAMELISTENABLE;
  const AUTODELETE = config.AUTODELETE;
  const SERVER_NAME = config.SERVER_NAME;
  const BOT_TOKEN = config.BOT_TOKEN;
  const UPDATE_TIME = config.UPDATE_TIME;

  console.logCopy = console.log.bind(console)
  console.log = function(data)
    {
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var currentDate = '|' + new Date().toLocaleString({  timeZone: timezone }).slice(11,-3) + '|';
        this.logCopy(currentDate, data);
    };

  const activity = async () => {
    inFo.checkOnlineStatus().then(async(server) => {
      if (server) {
        let players = (await inFo.getPlayers());
        let playersonline = (await inFo.getDynamic()).clients;
        let maxplayers = (await inFo.getDynamic()).sv_maxclients;
        let namef = players.filter(function(person) {
        return person.name.toLowerCase().includes(NAMELIST);
        });
                
        if (playersonline === 0) {
          bot.user.setActivity(`⚠ Wait for Connect`,{'type':'WATCHING'});
          console.log(`Wait for Connect update at activity`);
        } else if (playersonline >= 1) {
            if (NAMELISTENABLE) {
              bot.user.setActivity(`💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length}`,{'type':'WATCHING'});
              console.log(`Update ${playersonline} at activity`);
            } else {
              bot.user.setActivity(`💨 ${playersonline}/${maxplayers}`,{'type':'WATCHING'});
              console.log(`Update ${playersonline} at activity`);
            }
        }
      } else {
        bot.user.setActivity(`🔴 Offline`,{'type':'WATCHING'});
        console.log(`Offline at activity`);
      }
    }).catch ((err) =>{
        console.log(`Catch ERROR`+ err);
    });
  };

function splitChunks(sourceArray, chunkSize) {
  let result = [];
  for (var i = 0; i < sourceArray.length; i += chunkSize) {
    result[i / chunkSize] = sourceArray.slice(i, i + chunkSize);
  }
  return result;
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
    if (!message.author.bot) {
    inFo.getPlayers().then(async(players) => {
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
        .setColor(COLORBOX)
        .setFooter({ text: `by Kuju29` })
      message.reply({ embeds: [embed]}).then((msg) =>{
          console.log(`Completed ${prefix}help`);
            setTimeout(() =>{
              if (AUTODELETE){
              msg.delete();
              console.log(`Auto delete message ${prefix}help`);
              }
            },10000);
          });
  }

  if (command == prefix + 's') {
      let text = message.content.toLowerCase().substr(3,20);
      let playerdata = players.filter(function(person) { return person.name.toLowerCase().includes(`${text}`) });
      let result1 = [];
      let index = 1;
      for (let player of playerdata) {
        result1.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      const result = result1.join("\n").toString();
      let embed = new Discord.MessageEmbed().setTimestamp();
      if (message.member.permissions.has(PERMISSION)) {
            embed.setColor(COLORBOX)
                 .setTitle(`Search player | ${SERVER_NAME}`)
                 .setDescription(result.length > 0 ? result : 'No Players')
          message.reply({ embeds: [embed] }).then((msg) =>{
          console.log(`Completed ${prefix}s ${text}`);
            setTimeout(() =>{
              if (AUTODELETE){
              msg.delete();
              console.log(`Auto delete message ${prefix}s ${text}`);
              }
            },10000);
          });
      } else {
            embed.setColor(COLORBOX)
                 .setTitle(`Search player | Error`)
                 .setDescription(`❌ You do not have the ${PERMISSION}, therefor you cannot run this command!`)
          message.reply({ embeds: [embed] }).then((msg) =>{
          console.log(`Error ${prefix}s message`);
            setTimeout(() =>{
              if (AUTODELETE){
              msg.delete();
              console.log(`Auto delete Error message ${prefix}s message`);
              }
            },10000);
          });
      }  
  }

  if (command == prefix + 'id') {
      let num = message.content.match(/[0-9]/g).join('').valueOf();
      let playerdata = players.filter(players => players.id == num);
      let result1 = [];
      let index = 1;
      for (let player of playerdata) {
        result1.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      const result = result1.join("\n").toString();
      let embed = new Discord.MessageEmbed().setTimestamp();
      if (message.member.permissions.has(PERMISSION)) {
            embed.setColor(COLORBOX)
                 .setTitle(`Search player | ${SERVER_NAME}`)
                 .setDescription(result.length > 0 ? result : 'No Players')
          message.reply({ embeds: [embed] }).then((msg) =>{
          console.log(`Completed ${prefix}id ${num}`);
            setTimeout(() =>{
              if (AUTODELETE){
              msg.delete();
              console.log(`Auto delete message ${prefix}id ${num}`);
              }
            },10000);
          });
      } else {
            embed.setColor(COLORBOX)
                 .setTitle(`Search player | Error`)
                 .setDescription(`❌ You do not have the ${PERMISSION}, therefor you cannot run this command!`)
          message.reply({ embeds: [embed] }).then((msg) =>{
          console.log(`Error ${prefix}id message`);
            setTimeout(() =>{
              if (AUTODELETE){
              msg.delete();
              console.log(`Auto delete message Error ${prefix}id message`);
              }
            },10000);
          });
      }  
  }

  if (command == prefix + 'all') {
      let result = [];
      let index = 1;
      for (let player of players) {
        result.push(`${index++}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
      };
      if (message.member.permissions.has(PERMISSION)) {
        let chunks = splitChunks(result.join("\n").toString(), 2000);
        // let chunks = Discord.Util.splitMessage(result.join("\n"))
        let embed = new Discord.MessageEmbed().setTitle(`All_players | ${SERVER_NAME}`);
        if (result.length > 1) {
            chunks.map((chunk, i) => {
              embed.setColor(COLORBOX)
                   .setDescription(chunk)
                   .setFooter({ text: `Part ${i + 1} / ${chunks.length}` })
              message.channel.send({ embeds: [embed] }).then((msg) =>{
                  console.log(`Completed !all Part ${i + 1} / ${chunks.length}`);
                  setTimeout(() =>{
                      if (AUTODELETE){
                          msg.delete();
                          console.log(`Auto delete message !all Part ${i + 1} / ${chunks.length}`);
                      }
                      },50000);
              });
            });
         } else {
            embed.setColor(COLORBOX)
                 .setDescription(result.length > 0 ? result: 'No Players')
            message.reply({ embeds: [embed] }).then((msg) =>{
            console.log(`Completed ${prefix}all No Players`);
              setTimeout(() =>{
                if (AUTODELETE){
                msg.delete();
                console.log(`Auto delete message ${prefix}all No Players`);
                }
              },10000);
            }); 
         }
      } else {
          let embed = new Discord.MessageEmbed()
            .setColor(COLORBOX)
            .setTitle(`Search player | Error`)
            .setDescription(`❌ You do not have the ${PERMISSION}, therefor you cannot run this command!`)
            .setTimestamp(new Date());
          message.reply({ embeds: [embed] }).then((msg) =>{
          console.log(`Error ${prefix}all`);
            setTimeout(() =>{
              if (AUTODELETE){
              msg.delete();
              console.log(`Auto delete message Error ${prefix}all`);
              }
            },10000);
          });
    }  
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
  }).catch ((err) =>{
    console.log(`Catch ERROR or Offline: `+ err);
  });
  }
  });
  
//  -------------------------

  bot.login(BOT_TOKEN).then(null).catch(() => {
    console.log('The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!');
    console.error();
    process.exit(1);
  });

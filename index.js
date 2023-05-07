const { Client, IntentsBitField, Events, Collection, EmbedBuilder } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Pagination } = require("discordjs-button-embed-pagination");
const path = require("node:path");
const fs = require("node:fs");

const config = require("./config.js");
const { ApiFiveM, getServerInfo } = require("./server/info.js");
const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

const intents = new IntentsBitField();
intents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds);
const client = new Client({
  intents: intents,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

var IPPP, Iname;

console.logCopy = console.log.bind(console);
console.log = function (data) {
  this.logCopy(
    `|${new Date().toLocaleString(config.Timezone, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}|`,
    data
  );
};

//  -------------------------

function validateIpAndPort(input) {
  var parts = input.split(":");
  var ip = parts[0].split(".");
  var port = parts[1];
  return ip.length === 4 && ip.every((segment) => validateNum(segment, 0, 255)) && validateNum(port, 1, 65535);
}

function validateNum(input, min, max) {
  var num = +input;
  return num >= min && num <= max && input === num.toString();
}

function chunkArray(arr, size) {
  const result = [];
  while (arr.length) {
    result.push(arr.splice(0, size));
  }
  return result;
}

function getCheckCFXIP() {
  return config.URL_CFX ? config.URL_CFX : IPPP ?? config.URL_SERVER;
}

//  -------------------------

async function deployCommands() {
  const commands = fs.readdirSync("./commands").filter((file) => file.endsWith(".js")).map((file) => require(`./commands/${file}`).data.toJSON());
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}

//  -------------------------

async function DaTa(ip) {
  const fivem = new ApiFiveM(ip);
  const server = config.URL_CFX ? await getServerInfo(ip) : await fivem.checkOnlineStatus();
  if (server) {
    const [players, { clients: playersonline, sv_maxclients: maxplayers, hostname: hostnametext }] = config.URL_CFX ? [server.Data.players, server.Data] : await Promise.all([fivem.getPlayers(), fivem.getDynamic()]);
    const hostname = hostnametext.replace(/[^a-zA-Z]+/g, " ");
    return { server, players, playersonline, maxplayers, hostname };
  } else {
    return { server };
  }
}

const activity = async () => {
    const { server, players, playersonline, maxplayers, hostname } =  await DaTa(getCheckCFXIP());
    let status;
    if (server) {
      let namef = players.filter((player) => player.name.normalize().toLowerCase().includes((Iname ?? config.NAMELIST).normalize().toLowerCase()));
      status = playersonline > 0 ? `💨 ${playersonline}/${maxplayers} ${namef.length ? `👮‍ ${namef.length} ` : ""}🌎 ${hostname}` : "⚠ Wait for Connect";
    } else {
      status = "🔴 Offline";
    }

    client.user.setPresence({ activities: [{ name: status }] });
    if (config.Log_update) console.log(status);
}

//  -------------------------

let counter = 0;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: config.STATUS,
  });

  deployCommands();

  const loop = async () => {
    if (counter >= 20) {
      if (config.Log_update) console.log("wait 1 min");
      await new Promise((resolve) => setTimeout(resolve, 60000));
      counter = 0;
    }
    activity();
    counter++;
    setTimeout(loop, config.UPDATE_TIME);
  };

  loop();
});

//  -------------------------

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  let commandName = interaction.commandName;
  let command = client.commands.get(commandName);
  if (!command) return;

  try {
    if (commandName === "set-count") {
      const text = interaction.options.data[0].value;
      Iname = text;
      console.log(`${commandName}: ${text} completed`);
      const message = await interaction.reply({ content: `${commandName}: to ${text}`, fetchReply: true });
      message.react("👌");
    }
    

    if (commandName === "set-ip") {
      const text = interaction.options.data[0].value;
      if (validateIpAndPort(text)) {
        IPPP = text;
        const message = await interaction.reply({ content: `${commandName}: to ${text}`, fetchReply: true });
        message.react("👌");
        console.log(`${commandName}: ${text} completed`);
      } else {
        const message = await interaction.reply({ content: `IP ${text} incorrect`, fetchReply: true });
        message.react("❌");
        console.log(`${commandName}: ${text} incorrect`);
      }
    }    

    if (commandName === "all") {
      await interaction.deferReply();
      const { players } = await DaTa(getCheckCFXIP());
      const result = players.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
  
      const chunksArr = chunkArray(result, 50);
      const embeds = chunksArr.map((chunk) => new EmbedBuilder()
          .setColor(config.COLORBOX)
          .setTitle(`All_players | ${config.SERVER_NAME}`)
          .setDescription(chunk.join("\n"))
      );
  
      await new Pagination(interaction.channel, embeds, "Part").paginate();
  
      await interaction.editReply({ content: 'All players list has been generated.', ephemeral: false });
      console.log(`${commandName}: completed`);
  }

    if (commandName === "search-id") {
      const { players } = await DaTa(getCheckCFXIP());
      const text = interaction.options.data[0].value;
      const num = text.match(/[0-9]/g).join("").valueOf();
      const playerdata = players.filter(player => player.id == num);

      const result = playerdata.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`).join("\n");
      
      const embed = new EmbedBuilder()
          .setColor(config.COLORBOX)
          .setTitle(`Search player | ${config.SERVER_NAME}`)
          .setDescription(result.length > 0 ? result : "No Players")
          .setTimestamp();
      
      interaction.reply({ embeds: [embed] });
      console.log(`${commandName}: completed`);
  }

    if (commandName === "search-ip") {
      const text = interaction.options.data[0].value;
      const iNfo = new ApiFiveM(text);
      const embed = new EmbedBuilder();
    
      if (validateIpAndPort(text)) {
        iNfo.checkOnlineStatus()
          .then(async (server) => {
            const infoplayers = server ? await iNfo.getDynamic() : null;
            const fields = server ? [
              { name: "**Server Status**", value: `\`\`\`✅Online\`\`\`` },
              { name: "**Online Players**", value: `\`\`\`${infoplayers.clients}/${infoplayers.sv_maxclients}\`\`\`` },
            ] : [
              { name: "**Server Status**", value: `\`\`\`❌Offline or Invalid IP\`\`\`` },
              { name: "**Online Players**", value: `\`\`\`-/-\`\`\`` },
            ];
    
            embed.setColor(config.COLORBOX)
              .setTitle(`Server: \`${text}\``)
              .addFields(fields)
              .setTimestamp();
    
            interaction.reply({ embeds: [embed] });
            console.log(`${commandName}: ${text} ${server ? "online" : "offline"}`);
          })
          .catch((err) => console.log(err));
      } else {
        embed.setColor(config.COLORBOX)
          .addFields([{ name: "**Are you sure the IP is correct?**", value: `\`${text}\`` }])
          .setTimestamp();
    
        interaction.reply({ embeds: [embed] });
        console.log(`${commandName}: ${text} incorrect`);
      }
  }
    
    if (commandName === "search-name") {
      const { players } = await DaTa(getCheckCFXIP());
      const text = interaction.options.data[0].value.normalize().toLowerCase();
      const playerdata = players.filter(person => person.name.normalize().toLowerCase().includes(text));
      const result = playerdata.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`).join('');
  
      const embed = new EmbedBuilder()
          .setColor(config.COLORBOX)
          .setTitle(`Search player | ${config.SERVER_NAME}`)
          .setDescription(result.length > 0 ? result : "No Players")
          .setTimestamp();
  
      interaction.reply({ embeds: [embed] });
      console.log(`${commandName}: ${text} completed`);
  }
    
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

//  -------------------------

client
  .login(config.BOT_TOKEN)
  .then(null)
  .catch(() => {
    console.log(
      "The token you provided is invalided. Please make sure you are using the correct one from https://discord.com/developers/applications!"
    );
    console.error();
    process.exit(1);
  });

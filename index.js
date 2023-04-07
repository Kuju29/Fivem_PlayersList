const { Client, IntentsBitField, Events, Collection, EmbedBuilder } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Pagination } = require("discordjs-button-embed-pagination");
const path = require("node:path");
const fs = require("node:fs");

const config = require("./config.js");
const fivem = require("./server/info.js");
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

async function DaTa(ip, retries = 5, maxRetries = 5) {
  const Fatch = new fivem.ApiFiveM(ip);
  try {
    const server = await Fatch.checkOnlineStatus();
    const players = await Fatch.getPlayers();
    const { clients: playersonline, sv_maxclients: maxplayers, hostname: hostnametext } = await Fatch.getDynamic();
    const hostname = hostnametext.replace(/[^a-zA-Z]+/g, " ");

    return { server, players, playersonline, maxplayers, hostname };
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await DaTa(ip, retries - 1, maxRetries);
    }
    if (config.Log_update && err.code !== 'ETIMEDOUT') console.log(err);
  }
}

const activity = async () => {
  try {
    let { server, players, playersonline, maxplayers, hostname } = (await DaTa(IPPP ?? config.URL_SERVER));
    let namef = players.filter((player) => player.name.toLowerCase().includes(Iname ?? config.NAMELIST));
    let status = server ? (playersonline > 0 ? `💨 ${playersonline}/${maxplayers} ${namef.length ? `👮‍ ${namef.length} ` : ""}🌎 ${hostname}` : "⚠ Wait for Connect") : "🔴 Offline";
    client.user.setPresence({ activities: [{ name: status }] });
    if (config.Log_update) console.log(status);
  } catch (err) {
    if (config.Log_update && err.code !== 'ETIMEDOUT') console.log(err);
  }
};

//  -------------------------

let counter = 0;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

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
      const api = new fivem.ApiFiveM(IPPP ?? config.URL_SERVER);
      api.getPlayers()
        .then(async (players) => {
          const result = players.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
          
          const chunksArr = chunkArray(result, 50);
          const embeds = chunksArr.map((chunk) => new EmbedBuilder()
            .setColor(config.COLORBOX)
            .setTitle(`All_players | ${config.SERVER_NAME}`)
            .setDescription(chunk.join("\n"))
          );
          
          await new Pagination(interaction.channel, embeds, "Part").paginate();
          console.log(`${commandName}: completed`);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (commandName === "search-id") {
      const api = new fivem.ApiFiveM(IPPP ?? config.URL_SERVER);
      api.getPlayers()
        .then(async (players) => {
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
        })
        .catch((err) => {
          console.log(err);
        });
    }
    
    if (commandName === "search-ip") {
      const text = interaction.options.data[0].value;
      const iNfo = new fivem.ApiFiveM(text);
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
      new fivem.ApiFiveM(IPPP ?? config.URL_SERVER)
        .getPlayers()
        .then(async (players) => {
          const text = interaction.options.data[0].value;
          const playerdata = players.filter(person => person.name.toLowerCase().includes(text));
          const result = playerdata.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`).join('');
    
          const embed = new EmbedBuilder()
            .setColor(config.COLORBOX)
            .setTitle(`Search player | ${config.SERVER_NAME}`)
            .setDescription(result.length > 0 ? result : "No Players")
            .setTimestamp();
    
          interaction.reply({ embeds: [embed] });
          console.log(`${commandName}: ${text} completed`);
        })
        .catch((err) => console.log(err));
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

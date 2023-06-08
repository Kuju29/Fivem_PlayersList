const { Client, IntentsBitField, Events, Collection, EmbedBuilder } = require("discord.js");
const { Pagination } = require("discordjs-button-embed-pagination");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const path = require("node:path");
const fs = require("node:fs");

const config = require("./config.js");
const { ApiFiveM, Guild } = require("./server/info.js");

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

function split_data(data) {
  const identifiers = {};
  data.identifiers.forEach(identifier => {
    const [key, value] = identifier.split(':');
    identifiers[key] = value;
  });
  return identifiers;
}

function getCheckCFXIP() {
  return config.URL_CFX ? config.URL_CFX : IPPP ?? config.URL_SERVER;
}

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

let cachedData = null;

async function DaTa(ip) {
  const server = config.URL_CFX ? await new Guild().getServerInfo(ip) : await new ApiFiveM(ip).checkOnlineStatus();
  if (server == false) {
    return { server };
  } else if (server) {
    const [players, dynamic] = await Promise.all([
      config.URL_CFX ? server.Data.players : await new ApiFiveM(ip).getPlayers(),
      config.URL_CFX ? server.Data : await new ApiFiveM(ip).getDynamic()
    ]);
    const { clients: playersonline, sv_maxclients: maxplayers, hostname: hostnametext } = dynamic;
    const hostname = hostnametext.replace(/[^a-zA-Z]+/g, " ").substring(0, 40);
    cachedData = { server, players, playersonline, maxplayers, hostname };
    return { server, players, playersonline, maxplayers, hostname };
  } else {
    return cachedData;
  }
}

const activity = async () => {
  const { server, players, playersonline, maxplayers, hostname } = await DaTa(getCheckCFXIP());
  let status;
  if (server) {
    let namef = players && players.filter((player) => player.name.normalize().toLowerCase().includes((Iname ?? config.NAMELIST).normalize().toLowerCase()));
    status = playersonline > 0 ? `💨 ${playersonline}/${maxplayers} ${namef && namef.length ? `👮‍ ${namef.length} ` : ""}🌎 ${hostname}` : "⚠ Wait for Connect";
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
    if (counter >= 10) {
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
      if (config.URL_CFX) {
        const message = await interaction.reply({ content: `You use Cfx url need to set \`"URL_CFX": ""\``, fetchReply: true });
        message.react("❌");
        console.log(`${commandName}: You use Cfx url need to set "URL_CFX": ""`);
      } else if (await new Guild().validateIpAndPort(text)) {
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
      const result = players && players.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Ping : ${player.ping}\n`);
    
      const chunksArr = await new Guild().chunkArray(result, 50);
      
      if (chunksArr) {
        const embeds = chunksArr.map((chunk) => new EmbedBuilder()
          .setColor(config.COLORBOX)
          .setTitle(`All_players | ${config.SERVER_NAME}`)
          .setDescription(chunk.join("\n"))
        );
    
        await new Pagination(interaction.channel, embeds, "Part").paginate();
        await interaction.editReply({ content: 'All players list has been generated.', ephemeral: false });
      } else {
        await interaction.reply({ content: `❌Offline`, fetchReply: true });
      }
    
      console.log(`${commandName}: completed`);
    }

    if (commandName === "search-id") {
      const { players } = await DaTa(getCheckCFXIP());
      const text = interaction.options.data[0].value;
      const num = text.match(/[0-9]/g).join("").valueOf();
      const playerdata = players.filter(player => player.id == num);
    
      const promises = playerdata.map(async player => {
        const { discord } = split_data(player);
        const user = await client.users.fetch(discord);
        const username = user ? user.username : 'Unknown';
    
        return `\`\`\`${player.name}\`\`\` \`\`\`ID: ${player.id}\nPing: ${player.ping}\nDiscord:\n  UserID: ${discord}\n  Username: ${username}\`\`\``;
      });
    
      const results = await Promise.all(promises);
      const result = results.join("\n");
      const embed = new EmbedBuilder()
        .setColor(config.COLORBOX)
        .setTitle(`Search player | ${config.SERVER_NAME}`)
        .setDescription(result.length > 0 ? result : "No Players")
        .setTimestamp();
    
      await interaction.reply({ embeds: [embed] });
      console.log(`${commandName}: completed`);
    }
    

    if (commandName === "search-info") {
      const text = interaction.options.data[0].value;
      const embed = new EmbedBuilder();
    
      if (await new Guild().validateIpAndPort(text)) {
        await new ApiFiveM(text).checkOnlineStatus()
          .then(async (server) => {
            const infoplayers = server ? await new ApiFiveM(text).getDynamic() : null;
            const iport = await new Guild().ipAddress(text);
            const fields = server ? [
              { name: "**Server Status**", value: `\`\`\`✅Online\`\`\`` },
              { name: "**Server Name**", value: `\`\`\`${(infoplayers.hostname).replace(/[^a-zA-Z]+/g, " ")}\`\`\`` },
              { name: "**Languages**", value: `\`\`\`${iport.timezone}\`\`\`` },
              { name: "**Online Players**", value: `\`\`\`${infoplayers.clients}/${infoplayers.sv_maxclients}\`\`\`` },
            ] : [
              { name: "**Server Status**", value: `\`\`\`❌Offline or Invalid IP\`\`\`` },
              { name: "**Online Players**", value: `\`\`\`-/-\`\`\`` },
            ];
    
            embed.setColor(config.COLORBOX)
              .setTitle(`search-info: \`${text}\``)
              .addFields(fields)
              .setTimestamp();
    
            await interaction.reply({ embeds: [embed] });
            console.log(`${commandName}: ${text} ${server ? "online" : "offline"}`);
          })
          .catch((err) => console.log(err));
      } else if (await new Guild().checkMessage(text)) {
        await new Guild().getServerInfo(text).then(async (server) => {
          const iport = await new Guild().domainAddress(server.Data.connectEndPoints);
          const icon = await new Guild().get_icon(server.EndPoint, server.Data.iconVersion)
          const fields = server ? [
          { name: "**Server Status**", value: `\`\`\`✅Online\`\`\`` },
          { name: "**Server Name**", value: `\`\`\`${(server.Data.vars.sv_projectName).replace(/[^a-zA-Z]+/g, " ")}\`\`\`` },
          { name: "**IP:Port**", value: `\`\`\`${iport.status == "success" ? `${iport.query}:${iport.zip}` : server.Data.connectEndPoints}\`\`\`` },
          { name: "**Owner Name**", value: `[${server.Data.ownerName}](${server.Data.ownerProfile})` },
          { name: "**Server Connect**", value: `https://cfx.re/join/${server.EndPoint}` },
          { name: "**Private**", value: `\`\`\`${server.Data.private}\`\`\`` },
          { name: "**Online Players**", value: `\`\`\`${server.Data.clients} / ${server.Data.sv_maxclients}\`\`\`` },
          { name: "**Languages**", value: `\`\`\`${iport.timezone}\`\`\`` },
          { name: "**Last Update**", value: `\`\`\`${server.Data.lastSeen}\`\`\`` },
        ] : [
          { name: "**Server Status**", value: `\`\`\`❌Offline or Invalid IP\`\`\`` },
          { name: "**Online Players**", value: `\`\`\`-/-\`\`\`` },
        ];

        embed.setColor(config.COLORBOX)
          .setTitle(`search-info: \`${text}\``)
          .setThumbnail(icon)
          .addFields(fields)
          .setTimestamp()
          .setFooter({ text: server.Data.server, iconURL: icon });

          await interaction.reply({ embeds: [embed] });
        console.log(`${commandName}: ${text} ${server ? "online" : "offline"}`);
      })
      .catch((err) => console.log(err));
      } else {
        embed.setColor(config.COLORBOX)
          .addFields([{ name: "**Invalid input IP:Port or cfx.re/join/xxxxx**", value: `\`${text}\`` }])
          .setTimestamp();
    
          await interaction.reply({ embeds: [embed] });
        console.log(`${commandName}: ${text} incorrect`);
      }
  }
    
  if (commandName === "search-name") {
    const { players } = await DaTa(getCheckCFXIP());
    const text = interaction.options.data[0].value.normalize().toLowerCase();
    const playerdata = players.filter(person => person.name.normalize().toLowerCase().includes(text));
    const result = playerdata.map((player, index) => `${index + 1}. ${player.name} | ID : ${player.id} | Discord : ${split_data(player).discord} | Ping : ${player.ping}\n`).join('');

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

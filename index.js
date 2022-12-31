const { Client, IntentsBitField, Events, Collection, EmbedBuilder, } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Pagination } = require("discordjs-button-embed-pagination");
const path = require("node:path");
const fs = require("node:fs");

const intents = new IntentsBitField();
intents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds);
const client = new Client({
  intents: intents,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const config = require("./config.json");
const fivem = require("./server/info.js");
const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

var IPPP;
var Iname;

console.logCopy = console.log.bind(console);
console.log = function (data) {
  var currentDate = new Date().toLocaleString(config.Timezone, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  this.logCopy(`|${currentDate}|`, data);
};

//  -------------------------

function validateIpAndPort(input) {
  var parts = input.split(":");
  var ip = parts[0].split(".");
  var port = parts[1];
  return (
    validateNum(port, 1, 65535) &&
    ip.length == 4 &&
    ip.every(function (segment) {
      return validateNum(segment, 0, 255);
    })
  );
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
}

//  -------------------------

function deployCommands() {
  const commands = [];
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  (async () => {
    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );
      const data = await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      console.error(error);
    }
  })();
}

//  -------------------------

function ipSet() {
  if (IPPP !== undefined) {
    return IPPP;
  } else {
    return config.URL_SERVER;
  }
}

function nameSet() {
  if (Iname !== undefined) {
    return Iname;
  } else {
    return config.NAMELIST;
  }
}

//  -------------------------

async function DaTa(ip) {
  const Fatch = new fivem.ApiFiveM(ip);
  try {
    let server = await Fatch.checkOnlineStatus();
    let players = await Fatch.getPlayers();
    let playersonline = await Fatch.getDynamicOnline();
    let maxplayers = await Fatch.getDynamicMax();
    let hostname = await Fatch.getDynamicHost();
    return { server, players, playersonline, maxplayers, hostname };
  } catch (err) {
    console.log(err);
  }
}

const activity = async () => {
  try {
    let { server, players, playersonline, maxplayers, hostname } = await DaTa(
      ipSet()
    );

    if (server) {
      let namef = players.filter(function (person) {
        return person.name.toLowerCase().includes(nameSet());
      });
      if (playersonline === 0) {
        client.user.setPresence({
          activities: [{ name: `⚠ Wait for Connect` }],
        });
        console.log(`Wait for Connect update at activity`);
      } else if (playersonline >= 1) {
        if (namef.length === 0) {
          client.user.setPresence({
            activities: [
              {
                name: `💨 ${playersonline}/${maxplayers} 🌎 ${hostname}`,
              },
            ],
          });
          console.log(`Update ${playersonline} at activity`);
        } else {
          client.user.setPresence({
            activities: [
              {
                name: `💨 ${playersonline}/${maxplayers} 👮‍ ${namef.length} 🌎 ${hostname}`,
              },
            ],
          });
          console.log(`Update ${playersonline} at activity`);
        }
      }
    } else {
      client.user.setPresence({ activities: [{ name: `🔴 Offline` }] });
      console.log(`Offline at activity`);
    }
  } catch (err) {
    console.log(err);
  }
};

//  -------------------------

let counter = 0;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  deployCommands();

  const loop = async () => {
    if (counter >= 20) {
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
      let text = interaction.options.data[0].value;
      Iname = text.toString();
      console.log(`${commandName}: ${text} completed`);
      let message = await interaction.reply({
        content: `${commandName}: to ${text} `,
        fetchReply: true,
      });
      message.react("👌");
    }

    if (commandName === "set-ip") {
      let text = interaction.options.data[0].value;
      if (validateIpAndPort(text)) {
        IPPP = text.toString();
        let message = await interaction.reply({
          content: `${commandName}: to ${text}`,
          fetchReply: true,
        });
        message.react("👌");
        console.log(`${commandName}: ${text} completed`);
      } else {
        let message = await interaction.reply({
          content: `IP ${text} incorrect`,
          fetchReply: true,
        });
        message.react("❌");
        console.log(`${commandName}: ${text} incorrect`);
      }
    }

    if (commandName === "all") {
      new fivem.ApiFiveM(ipSet())
        .getPlayers()
        .then(async (players) => {
          let result = [];
          let index = 1;
          for (let player of players) {
            result.push(
              `${index++}. ${player.name} | ID : ${player.id} | Ping : ${
                player.ping
              }\n`
            );
          }

          let chunks = splitChunks(result.join("\n").toString(), 2000);
          let embed = new EmbedBuilder();
          if (result.length > 1) {
            let embeds = chunks.map((chunk) => {
              return new EmbedBuilder()
                .setColor(config.COLORBOX)
                .setTitle(`All_players | ${config.SERVER_NAME}`)
                .setDescription(chunk);
            });
            await new Pagination(
              interaction.channel,
              embeds,
              "Part"
            ).paginate();
            console.log(`${commandName}: completed`);
          } else {
            embed
              .setColor(config.COLORBOX)
              .setTitle(`All_players | ${config.SERVER_NAME}`)
              .setDescription(result.length > 0 ? result : "No Players");
            interaction.reply({
              embeds: [embed],
            });
            console.log(`${commandName}: completed`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (commandName === "search-id") {
      new fivem.ApiFiveM(ipSet())
        .getPlayers()
        .then(async (players) => {
          let text = interaction.options.data[0].value;
          let num = text.match(/[0-9]/g).join("").valueOf();
          let playerdata = players.filter((players) => players.id == num);
          let result1 = [];
          let index = 1;
          for (let player of playerdata) {
            result1.push(
              `${index++}. ${player.name} | ID : ${player.id} | Ping : ${
                player.ping
              }\n`
            );
          }
          let result = result1.join("\n").toString();
          let embed = new EmbedBuilder()
            .setColor(config.COLORBOX)
            .setTitle(`Search player | ${config.SERVER_NAME}`)
            .setDescription(result.length > 0 ? result : "No Players")
            .setTimestamp();
          interaction.reply({
            embeds: [embed],
          });
          console.log(`${commandName}: completed`);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (commandName === "search-ip") {
      let text = interaction.options.data[0].value;
      let iNfo = new fivem.ApiFiveM(text);
      let embed = new EmbedBuilder();
      if (validateIpAndPort(text)) {
        iNfo
          .checkOnlineStatus()
          .then(async (server) => {
            if (server) {
              let infoplayers = await iNfo.getDynamic();

              embed
                .setColor(config.COLORBOX)
                .setTitle(`Server: \`${text}\``)
                .addFields([
                  { name: "**Server Status**", value: `\`\`\`✅Online\`\`\`` },
                  {
                    name: "**Online Players**",
                    value: `\`\`\`${infoplayers.clients}/${infoplayers.sv_maxclients}\`\`\``,
                  },
                ])
                .setTimestamp();
              interaction.reply({
                embeds: [embed],
              });
              console.log(`${commandName}: ${text} online`);
            } else {
              embed
                .setColor(config.COLORBOX)
                .setTitle(`Server: \`${text}\``)
                .addFields([
                  {
                    name: "**Server Status**",
                    value: `\`\`\`❌Offline or Invalid IP\`\`\``,
                  },
                  { name: "**Online Players**", value: `\`\`\`-/-\`\`\`` },
                ])
                .setTimestamp();
              interaction.reply({
                embeds: [embed],
              });
              console.log(`${commandName}: ${text} offline`);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        embed
          .setColor(config.COLORBOX)
          .addFields([
            {
              name: "**Are you sure the IP is correct?**",
              value: `\`${text}\``,
            },
          ])
          .setTimestamp();
        interaction.reply({
          embeds: [embed],
        });
        console.log(`${commandName}: ${text} incorrect`);
      }
    }

    if (commandName === "search-name") {
      new fivem.ApiFiveM(ipSet())
        .getPlayers()
        .then(async (players) => {
          let text = interaction.options.data[0].value;
          let playerdata = players.filter(function (person) {
            return person.name.toLowerCase().includes(`${text}`);
          });
          let result1 = [];
          let index = 1;
          for (let player of playerdata) {
            result1.push(
              `${index++}. ${player.name} | ID : ${player.id} | Ping : ${
                player.ping
              }\n`
            );
          }
          const result = result1.join("\n").toString();
          let embed = new EmbedBuilder()
            .setColor(config.COLORBOX)
            .setTitle(`Search player | ${config.SERVER_NAME}`)
            .setDescription(result.length > 0 ? result : "No Players")
            .setTimestamp();
          interaction.reply({
            embeds: [embed],
          });
          console.log(`${commandName}: ${text} completed`);
        })
        .catch((err) => {
          console.log(err);
        });
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

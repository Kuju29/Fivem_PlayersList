const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search-name")
    .setDescription("Search by player name on your server")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Enter name player")
        .setRequired(true)
    ),
};

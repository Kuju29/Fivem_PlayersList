const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search-id")
    .setDescription("Search for a list of players by ID.")
    .addStringOption((option) =>
      option
        .setName("number")
        .setDescription("Enter your id players")
        .setRequired(true)
        .setMaxLength(6)
    ),
};

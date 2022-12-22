const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search-id")
    .setDescription("Search by ID players for a list of players (name, id, ping)")
    .addStringOption((option) =>
      option
        .setName("number")
        .setDescription("Enter your id players")
        .setRequired(true)
        .setMaxLength(6)
    ),
};

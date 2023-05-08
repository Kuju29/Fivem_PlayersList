const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search-info")
    .setDescription(
      "Find server information from IP:PORT or URL: https://cfx.re/join/xxxxx"
    )
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Enter your IP address: 157.41.134.254:30120 or URL: https://cfx.re/join/xxxxx")
        .setRequired(true)
        .setMinLength(15)
        .setMaxLength(26)
    ),
};

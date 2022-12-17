const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search-ip")
    .setDescription(
      "show the number of players and information on the server of the IP."
    )
    .addStringOption((option) =>
      option
        .setName("ipaddress")
        .setDescription("Enter your IP address e.g.: 157.41.134.254:30120")
        .setRequired(true)
        .setMinLength(15)
        .setMaxLength(25)
    ),
};

const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-ip")
    .setDescription("change ip address (work with activities only)")
    .addStringOption((option) =>
      option
        .setName("ipaddress")
        .setDescription("Enter your IP address e.g.: 157.41.134.254:30120")
        .setRequired(true)
        .setMinLength(15)
        .setMaxLength(25)
    ),
};

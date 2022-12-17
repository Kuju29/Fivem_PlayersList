const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-count")
    .setDescription(
      "Count similar player names e.g.: gang names, team names, police names. (work with activities only)"
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription(
          "Check the list of names with the -all- command. These names come from the stream names."
        )
        .setRequired(true)
    ),
};

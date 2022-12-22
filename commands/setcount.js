const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-count")
    .setDescription(
      "set name players for count on activity function (gang names, team names, police names)"
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

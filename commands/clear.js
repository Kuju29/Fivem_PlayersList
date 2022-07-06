const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'clear',
  description: 'Clear all message from bots',
  execute: async (message, args) => {
    if (config.NCOMMAND) {
      let embedss = new Discord.MessageEmbed()
        .setColor(config.COLORBOX)
        .setDescription(`Completed \`${config.PREFIX}clear\``)
      message.reply({
        embeds: [embedss]
      }).then((msg) => {
        setTimeout(() => {

          msg.delete();
          console.log(`Delete notification message ${config.PREFIX}clear`);

        }, 5000);
      });
    }
    let num = message.content.match(/[0-9]/g).join('').valueOf();
    const Channel = message.channel;
    const Messages = await Channel.messages.fetch({
      limit: num
    });
    Messages.forEach(message => {
      if (message.author.bot) message.delete()
    });
    console.log(`Completed ${config.PREFIX}Clear ${num}`);
  },
};
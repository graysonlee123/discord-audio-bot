const { MessageEmbed } = require('discord.js');
const {
  getQueue,
  addToQueue,
  checkForServer,
  addServer,
} = require('../functions');
const { client } = require('../index');

module.exports = {
  name: 'queue',
  description: 'Show what is going to play next.',
  voiceConnected: true,
  guildOnly: true,
  aliases: ['q'],
  execute(message, args) {
    let queue = getQueue(message);

    // Make sure server exists
    if (!checkForServer(message.guild.id)) {
      addServer(message.guild.id);
    }

    switch (args[0]) {
      case 'add':
        args.shift(); // Remove the 'add' value
        addToQueue(message, args);
        break;
      case 'list':
      default:
        if (!queue || queue.length < 1) {
          return message.reply(`there seems to be nothing in the queue!`);
        }

        const embedQueue = queue.map((string, i) => ({
          name: i + 1,
          value: string,
        }));

        const embed = new MessageEmbed()
          .setTitle(`The Queue`)
          .setDescription(`This is the order the songs are going to play in.`)
          .addFields(embedQueue);

        message.channel.send(embed);
        break;
    }
  },
};

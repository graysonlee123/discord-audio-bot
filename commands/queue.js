const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'queue',
  aliases: ['q', 'list'],
  description: 'List the songs in the queue',
  voiceConnected: true,
  guildOnly: true,
  execute(message, args, serverQueue) {
    if (!serverQueue || serverQueue.length < 1) {
      return message.reply(`there seems to be no queue!`);
    }

    const embedFields = serverQueue.songs.map(({ title }, i) => {
      console.log(title);
      return {
        name: i + 1,
        value: title,
      };
    });

    message.channel.send(
      new MessageEmbed().setTitle(`The Queue`).addFields(embedFields)
    );
  },
};

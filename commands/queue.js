const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'queue',
  aliases: ['q', 'list'],
  description: 'List the songs in the queue.',
  voiceConnected: true,
  guildOnly: true,
  execute(message, args, serverQueue) {
    if (!serverQueue || serverQueue.length < 1) {
      return message.reply('there seems to be no queue!');
    }

    const embedFields = serverQueue.songs.map(({ title, video_url, authorName }, i) => ({
      name: `${video_url}`,
      value: `**${i + 1}.** ${title}\nby ${authorName}`,
    }));

    message.channel.send(
      new MessageEmbed()
        .setTitle(`Audio Queue`)
        .addFields(embedFields)
        .setColor([255, 0, 0])
        .setFooter('To remove a song from the queue, use the remove command')
    );
  },
};

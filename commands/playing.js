const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');

function truncateString(str, num) {
  if (str.length <= num) return str;

  return str.slice(0, num) + '...';
}

module.exports = {
  name: 'playing',
  description: 'See what is currently playing.',
  voiceConnected: true,
  guildOnly: true,
  async execute(message, args, serverQueue) {
    if (!serverQueue || !serverQueue.songs) {
      return message.channel.send(`There seems to be nothing in the queue.`);
    }

    const {
      title,
      author,
      likes,
      length_seconds,
      video_url,
      description,
    } = await ytdl.getInfo(serverQueue.songs[0].url);
    // console.log(info);

    const embed = new MessageEmbed()
      .setColor([255, 0, 0])
      .setDescription(`**${title}**`)
      .setThumbnail(author.avatar)
      .addFields([
        { name: 'Author', value: author.name || 'N/A' },
        { name: 'Likes', value: likes || 'N/A', inline: true },
        { name: 'Length', value: length_seconds || 'N/A', inline: true },
        { name: 'Link', value: video_url || 'N/A' },
        { name: 'Description', value: truncateString(description, 400) || 'N/A' },
      ]);

    message.channel.send(embed);
  },
};

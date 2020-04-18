const ytdl = require('ytdl-core-discord');
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
        { name: 'Author', value: author.name },
        { name: 'Likes', value: likes, inline: true },
        { name: 'Length', value: length_seconds, inline: true },
        { name: 'Link', value: video_url },
        { name: 'Description', value: truncateString(description, 400) },
      ]);

    message.channel.send(embed);
  },
};

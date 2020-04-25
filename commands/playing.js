const ytdl = require("ytdl-core");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

function truncateString(str, num) {
  if (str.length <= num) return str;

  return str.slice(0, num) + "...";
}

module.exports = {
  name: "playing",
  description: "See what is currently playing.",
  voiceConnected: true,
  guildOnly: true,
  async execute(message, args, serverQueue) {
    if (!serverQueue || !serverQueue.songs) {
      return message.channel.send(`There seems to be nothing in the queue.`);
    }

    const {
      title,
      video_url,
      likes,
      description,
      length_seconds,
      authorName,
      authorAvatar
    } = serverQueue.songs[0];

    const duration = moment.duration(length_seconds * 1000);
    const hours = duration.hours() === 0 ? "" : `${duration.hours()}h`;
    const minutes = duration.minutes() === 0 ? "" : `${duration.minutes()}m`;
    const seconds = duration.seconds() === 0 ? "" : `${duration.seconds()}s`;

    const embed = new MessageEmbed()
      .setColor([255, 0, 0])
      .setDescription(`**${title}**`)
      .setThumbnail(authorAvatar)
      .addFields([
        { name: "Author", value: authorName || "N/A" },
        { name: "Likes", value: likes || "N/A", inline: true },
        {
          name: "Length",
          value: `${hours} ${minutes} ${seconds}`,
          inline: true,
        },
        { name: "Link", value: video_url || "N/A" },
        {
          name: "Description",
          value: truncateString(description, 400) || "N/A",
        },
      ]);

    message.channel.send(embed);
  },
};

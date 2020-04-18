const { queue } = require('../index');
const ytdl = require('ytdl-core');

module.exports = {
  name: 'skip',
  aliases: ['next'],
  description: 'Skip to the next song in the queue.',
  async execute(message, args) {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      return message.channel.send(`There is no song that I could skip!`);
    }

    serverQueue.connection.dispatcher.end();
  },
};

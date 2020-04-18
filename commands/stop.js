const { queue } = require('../index');

module.exports = {
  name: 'stop',
  aliases: ['end'],
  guildOnly: true,
  voiceConnected: true,
  description: 'Remove the queue and disconnect me from the voice chat.',
  async execute(message, args) {
    const serverQueue = queue.get(message.guild.id);

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  },
};

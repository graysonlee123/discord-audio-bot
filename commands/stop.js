const { queue } = require('../index');

module.exports = {
  name: 'stop',
  aliases: ['end', 'leave', 'disconnect'],
  guildOnly: true,
  voiceConnected: true,
  description: 'Remove the queue and disconnect me from the voice chat.',
  async execute(message, args, serverQueue) {
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  },
};

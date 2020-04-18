module.exports = {
  name: 'stop',
  aliases: ['end', 'leave', 'disconnect'],
  guildOnly: true,
  voiceConnected: true,
  description: 'Remove the queue and disconnect me from the voice chat.',
  async execute(message, args, serverQueue) {
    if (!serverQueue) return message.channel.send(`I'm not playing anything!`);

    serverQueue.songs = [];

    if (serverQueue.connection.dispatcher) {
      serverQueue.connection.dispatcher.end();
    }
  },
};

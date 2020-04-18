module.exports = {
  name: 'skip',
  aliases: ['next'],
  guildOnly: true,
  voiceConnected: true,
  description: 'Skip to the next song in the queue.',
  async execute(message, args, serverQueue) {
    if (!serverQueue) {
      return message.channel.send(`There is no song that I could skip!`);
    }

    serverQueue.connection.dispatcher.end();
  },
};

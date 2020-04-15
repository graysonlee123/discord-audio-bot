const { getServerObj } = require('../functions');

module.exports = {
  name: 'skip',
  description: 'Skip a song in the queue.',
  guildOnly: true,
  voiceConnected: true,
  async execute(message, args) {
    const server = getServerObj(message.guild.id);
    if (server.dispatcher) server.dispatcher.end();
  },
};

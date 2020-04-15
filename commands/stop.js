module.exports = {
  name: 'stop',
  guildOnly: true,
  voiceConnected: true,
  aliases: ['quit', 'silence'],
  async execute(message, args) {
    const { connection } = require('./play.js');
    connection.disconnect();
  },
};

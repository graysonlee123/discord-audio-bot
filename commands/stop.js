const { getServerObj } = require('../functions');

module.exports = {
  name: 'stop',
  description: 'Stops all music and disconnect me.',
  guildOnly: true,
  voiceConnected: true,
  async execute(message, args) {
    const server = getServerObj(message.guild.id);
    message.member.voice.channel.leave();
  },
};
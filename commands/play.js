const {
  checkForServer,
  addServer,
  addToQueue,
  play,
  getQueue,
} = require('../functions');

module.exports = {
  name: 'play',
  aliases: ['go', 'start'],
  description: 'Link a YouTube video to play.',
  guildOnly: true,
  voiceConnected: true,
  async execute(message, args) {
    if (!checkForServer(message.guild.id) || getQueue(message).length < 1)
      return message.reply(`you need to add something to the queue!`);

    const connection = await message.member.voice.channel.join();
    await play(connection, message);
  },
};

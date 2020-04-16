const { checkForServer, addServer, addToQueue, play } = require('../functions');

module.exports = {
  name: 'play',
  aliases: ['add'],
  description: 'Link a YouTube video to play.',
  guildOnly: true,
  voiceConnected: true,
  args: true,
  async execute(message, args) {
    if (!checkForServer(message.guild.id)) {
      addServer(message.guild.id);
    }

    console.log(message.guild.voice);

    // TODO: Need to check if already in a channel

    await addToQueue(message, args);
    if (!message.guild.voice) {
      const connection = await message.member.voice.channel.join();
      play(connection, message);
    }
  },
};

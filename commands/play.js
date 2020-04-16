const ytdl = require('ytdl-core');
const axios = require('axios');
const { youtubeApiKey } = require('../config.json');
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

    const connection = await message.member.voice.channel.join();
    addToQueue(message, args);
    play(connection, message);
  },
};

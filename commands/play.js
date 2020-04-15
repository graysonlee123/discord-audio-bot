const ytdl = require('ytdl-core');
const axios = require('axios');
const { youtubeApiKey } = require('../config.json');
const { checkForServer, addServer, addToQueue } = require('../functions');

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

    addToQueue(message, args);
    const connection = await message.member.voice.channel.join();

    // play(connection, message, options);

    // if (regex.test(query)) {
    //   // Is a url
    //   try {
    //     await ytdl.getBasicInfo(query);

    //     // If no error is thrown, it will play the video
    //     connection.play(ytdl(query), options);
    //   } catch (err) {
    //     return message.channel.send(
    //       `That video URL was not valid, ${message.author}! \nError: ${err.message}`
    //     );
    //   }
    // } else {
    //   // Not a URL, query search youtube
    //   const baseurl = `https://www.googleapis.com/youtube/v3/search`;
    //   const params = `?part=snippet&q=${query}&key=${youtubeApiKey}&maxResults=1&type=video`;

    //   message.channel.send(`Searching youtube for "${query}"...`);

    //   try {
    //     const res = await axios.get(`${baseurl}${params}`);
    //     const videoId = res.data.items[0].id.videoId;
    //     const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

    //     await ytdl.validateID(videoId);

    //     message.channel.send(`This is what YouTube gave me:\n${youtubeLink}`);
    //     connection.play(ytdl(youtubeLink), options);
    //   } catch (err) {
    //     return message.channel.send(
    //       `There was an error with that YouTube search, ${message.author}.\nError: ${err.message}`
    //     );
    //   }
    // }
  },
};

const ytdl = require('ytdl-core');
const axios = require('axios');
const { youtubeApiKey } = require('../config.json');

module.exports = {
  name: 'play',
  aliases: ['sing'],
  description: 'Link a YouTube video to play.',
  guildOnly: true,
  voiceConnected: true,
  async execute(message, args) {
    const connection = await message.member.voice.channel.join();
    const search = args.join(' ');
    const regex = RegExp('^(http||https)://.+');
    const options = {
      quality: 'highestaudio',
    };

    if (regex.test(search)) {
      // Is a url
      try {
        await ytdl.getBasicInfo(search);

        connection.play(ytdl(search), options);
      } catch (err) {
        return message.channel.send(
          `That video URL was not valid, ${message.author}! \nError: ${err.message}`
        );
      }
    } else {
      // Search youtube
      const baseurl = `https://www.googleapis.com/youtube/v3/search`;
      const query = `?part=snippet&q=${search}&key=${youtubeApiKey}&maxResults=1`;

      console.log(baseurl, query);

      message.channel.send(`Searching youtube for "${search}"`);
      try {
        const res = await axios.get(`${baseurl}${query}`);
        const videoId = res.data.items[0].id.videoId;

        await ytdl.validateID(videoId);

        const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

        message.channel.send(`This is what I found: ${youtubeLink}`);

        connection.play(ytdl(youtubeLink), options);
      } catch (err) {
        return message.channel.send(
          `There was an error with that YouTube search, ${message.author}. \nError: ${err.message}`
        );
      }
    }
  },
};

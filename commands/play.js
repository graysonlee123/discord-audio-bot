module.exports = {
  name: 'play',
  aliases: ['sing'],
  description: 'Link a YouTube video to play.',
  guildOnly: true,
  async execute(message, args) {
    const ytdl = require('ytdl-core');

    if (!message.member.voice.channel) {
      return message.channel.send(
        `You must be in a voice channel, ${message.author}!`
      );
    }

    const connection = await message.member.voice.channel.join();
    const search = args[0];
    const regex = RegExp('^(http||https)://.+');

    if (regex.test(search)) {
      // Is a url
      try {
        const videoData = await ytdl.getInfo(search);
        console.log(videoData);

        connection.play(ytdl(search), {
          quality: 'highestaudio',
        });
      } catch (err) {
        return message.channel.send(
          `That video URL was not valid, ${message.author}! \nError: ${err.message}`
        );
      }
    } else {
      // Search youtube
      message.channel.send(`Searching youtube... (need to make)`);
    }
  },
};

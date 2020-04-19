const ytdl = require('ytdl-core');
const axios = require('axios');
const { queue } = require('../index');
const { youtubeApiKey } = require('../config.json');

const chalk = require('chalk');
const error = chalk.bold.red;

async function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(
      await ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' })
    )
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', (err) => {
      (err) => console.log(error('Error with dispatcher:', err));
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Now playing: **${song.title}**`);
}

async function getYouTubeURL(message, args) {
  const regex = RegExp('^(http||https)://.+');
  const song = {
    title: null,
    url: null,
  };

  if (regex.test(args[0])) {
    const { title, video_url } = await ytdl.getInfo(args[0]);

    song.title = title;
    song.url = video_url;
  } else {
    const baseURL = `https://www.googleapis.com/youtube/v3/search?`;
    const query = args.join(' ');
    const params = [
      `part=snippet`,
      `q=${query}`,
      `key=${youtubeApiKey}`,
      `maxResults=1`,
      `type=video`,
    ];

    message.channel.send(`Searching YouTube API for **${query}**`);

    try {
      const res = await axios.get(`${baseURL}${params.join('&')}`);

      const youTubeLink = `https://youtube.com/watch?v=${res.data.items[0].id.videoId}`;
      const { title, video_url } = await ytdl.getInfo(youTubeLink);

      song.title = title;
      song.url = video_url;
    } catch (err) {
      message.channel.send(
        `There was an error with that YouTube search! Try a different search.`
      );
    }
  }

  return song;
}

module.exports = {
  name: 'play',
  description:
    "Play a YouTube video's audio, or search for something on YouTube.",
  args: true,
  guildOnly: true,
  voiceConnected: true,
  usage: '<link_or_search_term>',
  async execute(message, args, serverQueue) {
    const voiceChannel = message.member.voice.channel;

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.channel.send(`
        You must grand me permissions to join and speak in your voice channel!`);
    }

    const song = await getYouTubeURL(message, args);

    if (!song.title || !song.url) return;

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      queue.set(message.guild.id, queueConstruct);

      queueConstruct.songs.push(song);

      try {
        const connection = await voiceChannel.join();
        queueConstruct.connection = connection;

        await play(message.guild, queueConstruct.songs[0]);
      } catch (err) {
        queue.delete(message.guild.id);
        return message.channel.send(`Error: ${err}`);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(
        `**${song.title}** has been added to the queue!`
      );
    }
  },
};

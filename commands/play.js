const ytdl = require("ytdl-core-discord");
const axios = require("axios");
const { queue } = require("../index");
const { youtubeApiKey } = require("../config.json");

// ytdl.getInfo('https://www.youtube.com/watch?v=aiRn3Zlw3Rw', (err, info) => {
//   console.log(info);
// })

async function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song || !song.video_url) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  await ytdl.getInfo(song.video_url);

  console.log(song.video_url, typeof song.video_url);

  const dispatcher = serverQueue.connection
    .play(
      await ytdl(song.video_url, {
        filter: "audioonly"
      }), { type: 'opus' }
    )
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", err => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
      console.error('Error in playing a song:', err);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(
    `Now playing: **${song.title}** by ${song.authorName}`
  );
}

async function getYouTubeURL(message, args) {
  const regex = RegExp("^(http||https)://.+");
  let songInfo = null;

  if (regex.test(args[0])) {
    songInfo = await ytdl.getInfo(args[0]);
  } else {
    const youtubeURL = new URL("https://www.googleapis.com/youtube/v3/search");

    youtubeURL.searchParams.append("part", "snippet");
    youtubeURL.searchParams.append("q", args.join(" "));
    youtubeURL.searchParams.append("key", youtubeApiKey);
    youtubeURL.searchParams.append("maxResults", 1);
    youtubeURL.searchParams.append("type", "video");

    message.channel.send(`Searching YouTube API for **${args.join(" ")}**`);

    try {
      const res = await axios.get(youtubeURL.href);
      const youTubeLink = `https://youtube.com/watch?v=${res.data.items[0].id.videoId}`;

      songInfo = await ytdl.getInfo(youTubeLink);
    } catch (err) {
      message.channel.send(
        `There was an error with that YouTube search! Try a different search.`
      );
    }
  }

  const {
    title,
    video_url,
    likes,
    dislikes,
    published,
    description,
    length_seconds,
    author: {
      id: authorId,
      name: authorName,
      avatar: authorAvatar,
      user,
      channel_url,
      user_url,
      subscriber_count
    },
    media: { category }
  } = songInfo;

  return {
    title,
    video_url,
    likes,
    dislikes,
    published,
    description,
    length_seconds,
    authorId,
    authorName,
    authorAvatar,
    user,
    channel_url,
    user_url,
    subscriber_count,
    category
  };
}

module.exports = {
  name: "play",
  description:
    "Play a YouTube video's audio, or search for something on YouTube.",
  args: true,
  guildOnly: true,
  voiceConnected: true,
  usage: "query",
  async execute(message, args, serverQueue) {
    const voiceChannel = message.member.voice.channel;

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(`
        You must grand me permissions to join and speak in your voice channel!`);
    }

    const song = await getYouTubeURL(message, args);

    if (!song.title || !song.video_url)
      return message.reply(`couldn't find that in YouTube!`);

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
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
  }
};

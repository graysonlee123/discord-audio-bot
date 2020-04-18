const ytdl = require('ytdl-core');
const { queue } = require('../index');

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', (err) => console.log(error('Error with dispatcher:', err)));

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

module.exports = {
  name: 'play',
  description: "Play a YouTube video's audio.",
  args: true,
  usage: '<query || YouTube link>',
  async execute(message, args, serverQueue) {
    const voiceChannel = message.member.voice.channel;

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.channel.send(`
        You must grand me permissions to join and speak in your voice channel!`);
    }

    const { title, video_url } = await ytdl.getInfo(args[0]);
    const song = {
      title: title,
      url: video_url,
    };

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

        play(message.guild, queueConstruct.songs[0]);
      } catch (err) {
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  },
};

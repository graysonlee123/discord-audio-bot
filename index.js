const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require('ytdl-core');
const chalk = require('chalk');

const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const good = chalk.bgGreenBright.black;

const client = new Discord.Client();

const queue = new Map();

client.once('ready', () => {
  console.log(good('Online and Logged In!'));
});

client.once('reconnecting', () => {
  console.log(warning('Reconnecting'));
});

client.once('disconnect', () => {
  console.log(warning('Disconnect'));
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send(`You need to enter a valid command!`);
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(' ');

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      `You must be connected to a voice channel to play music!`
    );
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send(`
    You must grand me permissions to join and speak in your voice channel!`);
  }

  const { title, video_url } = await ytdl.getInfo(args[1]);
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
      console.log(error('Error trying to play song:', err));
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel) {
    return message.channel.send(
      `You have to be in a voice channel to stop the music!`
    );
  }

  if (!serverQueue) {
    return message.channel.send(`There is no song that I could skip!`);
  }

  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel) {
    return message.channel.send(
      `You have to be in a voice channel to stop the music!`
    );
  }

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

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

process.on('uncaughtException', (err) => {
  console.log(error('Uncaugh excepction:', err));
});

process.on('unhandledRejection', (err) => {
  console.log(error('Uncaugh excepction:', err));
});

client.login(token);

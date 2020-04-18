const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require('ytdl-core');
const chalk = require('chalk');
const fs = require('fs');

const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const good = chalk.bgGreenBright.black;

const client = new Discord.Client();

// @details         Make a new colleciton, a map with extended functionality
// @documentation   https://discord.js.org/#/docs/collection/master/class/Collection
client.commands = new Discord.Collection();

// Returns an array of each file name, and requires each command
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

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
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (commandObj) => commandObj.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      `Don't try to slide into my DM's. (That command is guild only.)`
    );
  }

  // Remember that I ran args.shift()
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: '${prefix}${commandName} ${command.usage}`;
    }

    return message.channel.send(reply);
  }

  // * Try to execute the command
  try {
    command.execute(message, args);
  } catch (err) {
    console.log(
      error(`There was an error executing the command ${command.name}`)
    );
    message.reply(
      `there was an error trying to execute that command! Go yell at Grayson.`
    );
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

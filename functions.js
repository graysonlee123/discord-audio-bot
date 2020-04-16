const ytdl = require('ytdl-core');
const axios = require('axios');
const { youtubeApiKey } = require('./config.json');

// Server Logic for Queues
const servers = {};

exports.checkForServer = function (guildId) {
  let server = servers[guildId.toString()];
  console.log(
    `Checking for server with guild id: ${guildId}. Result: ${server}`
  );
  return server ? true : false;
};

exports.addServer = function (guildId) {
  // console.log('Adding server: ', guildId);
  servers[guildId] = { queue: [] };
};

exports.getServerObj = function (guildId) {
  return servers[guildId];
};

exports.parseArgsToUrl = async function (message, args) {
  const regex = RegExp('^(http||https)://.+');

  if (regex.test(args[0])) {
    // Is a link
    return args[0];
  } else {
    const baseURL = `https://www.googleapis.com/youtube/v3/search?`;
    const string = args.join(' ');
    const params = [
      `part=snippet`,
      `q=${string}`,
      `key=${youtubeApiKey}`,
      `maxResults=1`,
      `type=video`,
    ];

    message.channel.send(`Searching YouTube for "${string}"...`);

    try {
      const res = await axios.get(`${baseURL}${params.join('&')}`);
      const videoId = res.data.items[0].id.videoId;
      const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

      await ytdl.validateID(videoId);

      message.channel.send(`This is what YouTube found:\n${youtubeLink}`);

      return youtubeLink;
    } catch (err) {
      return message.channel.send(
        `There was an error with that YouTube search, ${message.author}.\nError: ${err.message}`
      );
    }
  }
};

exports.addToQueue = async function (message, args) {
  let server = servers[message.guild.id];
  let url = await exports.parseArgsToUrl(message, args);

  console.log(`Adding "${url}" to queue...`);

  server.queue.push(url);

  console.log(`New queue:`, server.queue);
};

exports.getQueue = function (message) {
  if (!message)
    return console.error('getQueue() needs to be passed the message!');
  let server = servers[message.guild.id];

  if (!server) return false;
  else return server.queue;
};

exports.play = function (connection, message) {
  const server = exports.getServerObj(message.guild.id);
  const options = {
    quality: 'highestaudio',
    filter: 'audioonly',
  };

  console.log(`Attempting to play from queue...`, server.queue);

  server.dispatcher = connection.play(ytdl(server.queue[0]), options);

  server.queue.shift();

  server.dispatcher.on('finish', function () {
    console.log('Next in queue...');
    if (server.queue[0]) exports.play(connection, message);
    else connection.disconnect();
  });
};

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
  console.log('Adding server: ', guildId);
  servers[guildId] = { queue: [] };
  console.log(servers);
};

exports.getServerObj = function (guildId) {
  return servers[guildId];
};

exports.parseArgs = function (args) {
  const regex = RegExp('^(http||https)://.+');
  let query = { type: null, string: null };

  if (regex.test(args[0])) {
    query.type = 'link';
    query.string = args[0];
  } else {
    (query.type = 'search'), (query.string = args.join(' '));
  }

  return query;
};

exports.addToQueue = function (message, args) {
  let server = servers[message.guild.id];
  let query = exports.parseArgs(args);

  server.queue.push(query);
  console.log(`Added to queue. New queue: ${server.queue}`);
};

exports.getQueue = function (message) {
  let server = servers[message.guild.id];

  if (!server) return false;
  else return server.queue;
};

exports.play = async function (connection, message) {
  let server = exports.getServerObj(message.guild.id);
  const options = {
    quality: 'highestaudio',
  };
  const { type, string } = server.queue[0];
  let youtubeLink;

  console.log(`Trying to play this queue:`, server.queue);

  switch (type) {
    case 'search':
    default:
      const baseURL = `https://www.googleapis.com/youtube/v3/search?`;
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
        youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

        await ytdl.validateID(videoId);
        message.channel.send(`This is what YouTube found:\n${youtubeLink}`);
      } catch (err) {
        return message.channel.send(
          `There was an error with that YouTube search, ${message.author}.\nError: ${err.message}`
        );
      }
      break;
    case 'link':
      youtubeLink = string;
      break;
  }

  server.dispatcher = connection.play(ytdl(youtubeLink), options);
  server.queue.shift();
  server.dispatcher.on('end', function () {
    if (server.queue[0]) exports.play(connection, message);
    else connection.disconnect();
  });
};

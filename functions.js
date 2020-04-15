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

exports.play = async function (connection, message, query) {
  let server = getServerObj(message.guild.id);
  const options = {
    quality: 'highestaudio',
  };

  server.queue.push(args[1]);

  console.log('Queue: ', server);

  server.dispatcher = connection.play(ytdl(server.queue[0]), options);
  server.queue.shift();
  server.dispatcher.on('end', function () {
    if (server.queue[0]) play(connection, message);
    else connection.disconnect();
  });

  if (regex.test(args[0])) {
    // Is a URL
    const link = args[0];

    try {
      await ytdl.getBasicInfo(link);

      play(connection, message);
    } catch (err) {
      return message.channel.send(
        `That video URL was not valid, ${message.author}! \nError: ${err.message}`
      );
    }
  } else {
    // Not a URL
    const query = args.join(' ');
    const baseURL = `https://www.googleapis.com/youtube/v3/search?`;
    const params = [
      `part=snippet`,
      `q=${query}`,
      `key=${youtubeApiKey}`,
      `maxResults=1`,
      `type=video`,
    ];
    const url = `${baseURL}${params.join('&')}`;

    message.channel.send(`Searching YouTube for "${query}"...`);

    try {
      const res = await axios.get(url);
      const videoId = res.data.items[0].id.videoId;
      const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

      await ytdl.validateID(videoId);

      message.channel.send(`This is what YouTube found:\n${youtubeLink}`);

      play(connection, message);
    } catch (err) {
      return message.channel.send(
        `There was an error with that YouTube search, ${message.author}.\nError: ${err.message}`
      );
    }
  }
};

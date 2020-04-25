module.exports = {
  name: 'remove',
  description: 'Remove a song from the queue.',
  usage: 'queue_index',
  args: true,
  voiceConnected: true,
  guildOnly: true,
  execute(message, args, serverQueue) {
    if (!serverQueue) {
      return message.channel.send(`There is nothing in the queue to remove.`);
    }

    if (isNaN(args[0])) {
      return message.channel.send(
        `That's not a valid argument! Provide the index of the song you want to remove.`
      );
    }

    if (args[0] > serverQueue.songs.length) {
      return message.channel.send(`There aren't that many songs in the queue!`);
    }

    // ? If first song in queue, needs special attention

    if (args[0] === '1') {
      return serverQueue.connection.dispatcher.end();
    }

    const removedSong = serverQueue.songs.splice(args[0] - 1, 1);
    message.channel.send(`Removed **${removedSong[0].title}** from the queue.`);
  },
};

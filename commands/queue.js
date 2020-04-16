const { getQueue } = require('../functions');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Show what is going to play next.',
  execute(message, args) {
    let queue = getQueue(message);

    if (!queue || queue.length < 1) {
      return message.channel.send(`There seems to be nothing in the queue!`);
    }

    console.log(queue);

    const embedQueue = queue.map(({ string }, i) => ({
      name: i + 1,
      value: string,
    }));

    const embed = new MessageEmbed()
      .setTitle(`The Queue`)
      .setDescription(`This is the order the songs are going to play in.`)
      .addFields(embedQueue);

    message.channel.send(embed);
  },
};

const axios = require('axios');
const { rapidApiKey } = require('../config.json');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'game',
  description: 'Look up a game.',
  usage: 'game_name [platform]',
  async execute(message, args) {
    const regex = new RegExp(/"(.+)"\s?(.*)?/);
    const game = regex.exec(args.join(' '));

    if (!game)
      return message.reply(
        `try to use the command in this format: \`${this.usage}\`. \n\n_Make sure the game's name is wrapped in parenthesis!_`
      );

    const [string, gameName, platform = 'pc'] = game;

    const res = await axios({
      url: `https://chicken-coop.p.rapidapi.com/games/${gameName}`,
      params: {
        platform: platform,
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
      },
    });

    const {
      title,
      releaseDate,
      description,
      genre,
      image,
      score,
      developer,
      publisher,
      alsoAvailableOn,
    } = res.data.result;

    if (!title) {
      console.log(res);
      return message.channel.send(
        `I couldn't find that game! Try a different query.`
      );
    }

    const embed = new MessageEmbed()
      .setTitle(title)
      .setThumbnail(image)
      .setAuthor(developer)
      .setDescription(description)
      .addFields([
        {
          name: 'Genres',
          value: genre.join(', '),
          inline: false,
        },
        {
          name: 'Release date',
          value: releaseDate,
          inline: true,
        },
        {
          name: 'Score',
          value: score,
          inline: true,
        },
        {
          name: 'Also Available On',
          value: alsoAvailableOn.join(', '),
          inline: false,
        },
      ]);

    message.channel.send(embed);
  },
};

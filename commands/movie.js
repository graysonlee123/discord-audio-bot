const { omdbApiKey } = require('../config.json');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

function truncateString(str, num) {
  if (str.length <= num) return str;

  return str.slice(0, num) + '...';
}

module.exports = {
  name: 'movie',
  aliases: ['film'],
  description: 'Get information about a movie.',
  usage: 'movie_name',
  args: true,
  async execute(message, args) {
    const search = args.join(' ');

    const res = await axios.get(
      `http://www.omdbapi.com/?t=${search}&apikey=${omdbApiKey}`
    );

    if (!res.data.Title) {
      return message.reply(`I could not find a movie with that name!`);
    }

    const {
      Title,
      Year,
      Rated,
      Released,
      Runtime,
      Genre,
      Director,
      Writer,
      Actors,
      Plot,
      Country,
      Poster,
      Ratings,
      Awards,
      imdbRating,
      Metascore,
      BoxOffice,
    } = res.data;

    const embed = new MessageEmbed()
      .setColor([0, 255, 0])
      .setTitle(`**${Title}**`)
      .setThumbnail(Poster)
      .setDescription(Plot)
      .addFields([
        { name: 'Year', value: Year || 'N/A', inline: true },
        { name: 'Rated', value: Rated || 'N/A', inline: true },
        { name: 'Runtime', value: Runtime || 'N/A', inline: true },
        { name: 'Genre', value: Genre || 'N/A', inline: true },
        { name: 'Director', value: Director || 'N/A', inline: true },
        {
          name: 'Writer(s)',
          value: truncateString(Writer, 100) || 'N/A',
          inline: false,
        },
        { name: 'Actors', value: Actors || 'N/A', inline: false },
        { name: 'Country', value: Country || 'N/A', inline: false },
        { name: 'Awards', value: Awards || 'N/A', inline: false },
        { name: 'IMDB Rating', value: imdbRating || 'N/A', inline: true },
        { name: 'Meta Score', value: Metascore || 'N/A', inline: true },
        { name: 'Box Office', value: BoxOffice || 'N/A', inline: false },
      ]);

    message.channel.send(embed);
  },
};

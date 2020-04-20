const axios = require('axios');
const { rapidApiKey } = require('../config.json');

module.exports = {
  name: 'joke',
  description: 'Get a random joke from Joke API by LemmoTresto.',
  aliases: ['funny', 'laugh'],
  async execute(message, args) {
    const joke = await axios({
      url: 'https://joke3.p.rapidapi.com/v1/joke',
      headers: {
        'x-rapidapi-key': rapidApiKey,
      },
    });

    if (!joke.data) {
      message.channel.send(
        `I couldn't find a joke! Please report this to Grayson.`
      );

      console.log(res);
    }

    message.channel.send(joke.data.content);
  },
};

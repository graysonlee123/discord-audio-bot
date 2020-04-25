const axios = require("axios");

module.exports = {
  name: "joke",
  description:
    'Get a random joke from Joke API by Sven Fehler. Joke categories include "programming", "misc", and "dark"',
  usage: '[category]',
  async execute(message, args) {
    let category;

    switch (args[0]) {
      case "misc":
      case "miscellaneous":
      case "Misc":
      case "Miscellaneous":
        category = "miscellaneous";
        break;
      case "programming":
      case "Programming":
        category = "programming";
        break;
      case "dark":
      case "Dark":
        category = "dark";
        break;
      default:
        category = "any";
        break;
    }

    let url = `https://sv443.net/jokeapi/v2/joke/${category}`;

    try {
      const res = await axios({
        url: url,
      });

      if (res.data.error)
        return message.reply(`there was an error with that request!`);

      const { category, type, flags, id, error } = res.data;

      if (type === "twopart") {
        const { setup, delivery } = res.data;
        message.channel.send(setup);

        setTimeout(() => {
          message.channel.send(delivery);
        }, 1500);
      } else {
        const { joke } = res.data;
        message.channel.send(joke);
      }
    } catch (err) {
      return message.reply(`there was an error running that command!`);
    }
  },
};

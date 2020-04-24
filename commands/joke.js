const axios = require("axios");

module.exports = {
  name: "joke",
  description: "Get a random joke from Joke API by Sven Fehler.",
  aliases: ["funny", "laugh"],
  async execute(message, args) {
    try {
      const res = await axios({
        url: "https://sv443.net/jokeapi/v2/joke/any?type=single",
      });

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

      console.log(res.data);
    } catch (err) {
      return;
    }
  },
};

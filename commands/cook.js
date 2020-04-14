module.exports = {
  name: 'cook',
  description: 'Try me out.',
  cooldown: 5,
  execute(message, args) {
    message.channel.send("You're cooking with Kelby!");
  },
};

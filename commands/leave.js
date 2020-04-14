module.exports = {
  name: 'leave',
  aliases: ['go-away'],
  execute(message, args) {
    message.client.user.voiceChannel.leave();
  },
};

module.exports = {
  name: 'leave',
  aliases: ['go-away'],
  execute(message, args) {
    message.member.voice.channel.leave();
  },
};

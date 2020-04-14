module.exports = {
  name: 'leave',
  aliases: ['go-away'],
  guildOnly: true,
  execute(message, args) {
    message.member.voice.channel.leave();
  },
};

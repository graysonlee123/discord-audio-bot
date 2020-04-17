const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const { format, loggers, transports } = require('winston');

const client = new Discord.Client();
client.commands = new Discord.Collection();

loggers.add('main', {
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'log' }),
  ],
  format: format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${log.message}`
  ),
});

const logger = loggers.get('main');

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
  logger.log('info', 'Ready and online!');
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      `Don't try to slide into my DM's. (I can't do that command in here.)`
    );
  }

  if (command.voiceConnected && !message.member.voice.channel) {
    return message.reply(`You must be connected to a voice channel!`);
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \'${prefix}${command.name} ${command.usage}\'`;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \'${command.name}\' command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    logger.log('error', error);
    message.reply('there was an error trying to execute that command!');
  }
});

process.on('unhandledRejection', (error) => {
  logger.log('error', error);
});

client.login(token);

module.exports = client;

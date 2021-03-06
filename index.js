const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const good = chalk.bgGreenBright.black;

const client = new Discord.Client();

// ? @details         Make a new colleciton, a map with extended functionality
// ? @documentation   https://discord.js.org/#/docs/collection/master/class/Collection

client.commands = new Discord.Collection();

const queue = new Map();
exports.queue = queue;

// Returns an array of each file name, and requires each command

const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (commandObj) =>
        commandObj.aliases && commandObj.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      `Don't try to slide into my DM's. (That command is guild only.)`
    );
  }

  if (command.voiceConnected && !message.member.voice.channel) {
    return message.reply(`you must be in a voice channel to run that command!`);
  }

  // ! Remember that I ran args.shift()

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: '${prefix}${commandName} ${command.usage}`;
    }

    return message.channel.send(reply);
  }

  // * Try to execute the command

  const serverQueue = message.guild && queue.get(message.guild.id);

  try {
    command.execute(message, args, serverQueue);
  } catch (err) {
    console.log(
      error(`There was an error executing the command ${command.name}`)
    );
    console.error(err);
    message.reply(
      `there was an error trying to execute that command! Go yell at Grayson.`
    );
  }
});

// Logs

client.once('ready', () => {
  console.log(good('Online and Logged In!'));
});

client.once('reconnecting', () => {
  console.log(warning('Reconnecting'));
});

client.once('disconnect', () => {
  console.log(warning('Disconnect'));
});

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1); // Mandatory; bot is in an undefined state
});

process.on('unhandledRejection', (err) => {
  console.log(error('Unhandled Rejection:'));
  console.error(err);
});

client.login(token);

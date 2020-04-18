const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require('ytdl-core');
const chalk = require('chalk');
const fs = require('fs');

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
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

client.once('ready', () => {
  console.log(good('Online and Logged In!'));
});

client.once('reconnecting', () => {
  console.log(warning('Reconnecting'));
});

client.once('disconnect', () => {
  console.log(warning('Disconnect'));
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

  // ! Remember that I ran args.shift()

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: '${prefix}${commandName} ${command.usage}`;
    }

    return message.channel.send(reply);
  }

  // * Try to execute the command

  try {
    command.execute(message, args);
  } catch (err) {
    console.log(
      error(`There was an error executing the command ${command.name}`)
    );
    message.reply(
      `there was an error trying to execute that command! Go yell at Grayson.`
    );
  }
});

process.on('uncaughtException', (err) => {
  console.log(error('Uncaught excepction:'));
  console.error(err);
});

process.on('unhandledRejection', (err) => {
  console.log(error('Unhandled Rejection:'));
  console.error(err);
});

client.login(token);

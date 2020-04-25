module.exports = {
  name: 'reload',
  description: 'Reloads a command.',
  args: true,
  usage: 'command_name',
  execute(message, args) {
    const commandName = args[0].toLowerCase();
    const command =
      message.client.commands.get(commandName) ||
      message.client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command)
      return message.channel.send(
        `There is no command with the name or alias ${commandName}, ${message.author}!`
      );

    delete require.cache[require.resolve(`./${command.name}.js`)];

    try {
      const newCommand = require(`./${command.name}.js`);

      message.client.commands.set(newCommand.name, newCommand);
      message.channel.send(`Command reloaded!`);
    } catch (err) {
      console.log(error(`Error reloading command ${commandName}`, err));
      message.channel.send(
        `There was an error while reloading a command: ${command.name}. Error: ${err.message}.`
      );
    }
  },
};

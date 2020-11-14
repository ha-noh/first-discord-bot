const { prefix } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const fs = require('fs');
// create an array of file names in the /command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a collection item,
	// key: command name, value: exported module
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log(`Pikamee is live! Use '${prefix}' to summon me.`);
});

// command ideas: (1) uwu-ifier (2) insert emojis (take args) in between a message to turn it into pasta (3) tHiS THinG
client.on('message', message => {
	// ignore message if the author is a bot
	if(message.author.bot) return;

	// the message starts with the bot prefix
	else if(message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		// if the command doesn't exist, return
		if(!client.commands.has(commandName)) return;

		const command = client.commands.get(commandName);

		// check if the user provided args if the command requires them
		if(command.args && !args.length) {
			return message.channel.send(`You have to provide arguments with that command, ${message.author}!`);
		}

		try {
			command.execute(message, args);
		}
		catch(error) {
			console.error(error);
			message.reply('Gomenasorry, there was an issue executing that command.');
		}
	}

	else if(message.content.endsWith(' lol')) {
		client.commands.get('lol').execute(message);
	}
});

require('dotenv').config();
client.login(process.env.BOT_TOKEN);
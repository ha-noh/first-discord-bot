const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix } = require('./config.json');

const fs = require('fs');
// create an array from all the js files in the /command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.commands = new Discord.Collection();
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
	// ignore message if it doesn't start with the bot prefix, or if the author is a bot
	if(!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if(!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	}
	catch(error) {
		console.error(error);
		message.reply('Gomenasorry, there was an issue executing that command.');
	}
});

require('dotenv').config();
client.login(process.env.BOT_TOKEN);
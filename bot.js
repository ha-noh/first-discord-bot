const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const { prefix } = require('./config.json');
require('dotenv').config();

client.login(process.env.BOT_TOKEN);
client.on('ready', () => {
	console.log(`Pikamee is live! Use '${prefix}' to summon me.`);
});

// command ideas: (1) uwu-ifier (2) insert emojis (take args) in between a message to turn it into pasta (3) tHiS THinG
client.on('message', message => {
	// ignore message if it doesn't start with the bot prefix, or if the author is a bot
	if(!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if(command === 'uwu') {
		let convertedMessage = '';
		for(const arg of args) {
			const str = arg.replace(/(?<!tt)[lr](?!$)/gi, 'w').toLowerCase();
			convertedMessage = convertedMessage.concat(str + ' ');
		}
		message.channel.send(convertedMessage.concat('uwu'));
	}
});
const { prefix, inputChannelID, outputChannelID } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'USER'] });
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const hallOfFame = new Discord.Collection();
const Hof = require('./commands/hallOfFame.js');

const fs = require('fs');
// create an array of file names in the /command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	client.channels.fetch(outputChannelID)
		.then(fetchMessages)
		.then(buildHof)
		.catch(console.error);
	console.log(`Pikamee is live! Use '${prefix}' to summon me.`);
});

client.on('message', message => {
	if(message.author.bot) return;

	else if(message.content.endsWith(' lol')) {
		// returning from here would prevent commands ending with the phrase 'lol' from executing
		client.commands.get('lol').execute(message);
	}

	else if(!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if(!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if(command.args && !args.length) {
		let reply = (`You have to provide arguments with that command, ${message.author}!`);

		if(command.usage) {
			reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	// set a cooldown collection for a command if it doesn't already exist
	if(!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	// if the user has put the command on cooldown, check if the command is still unavailable to them
	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	// automatically remove the user cooldown once it expires
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	}
	catch(error) {
		console.error(error);
		message.reply('Gomenasorry, there was an issue executing that command.');
	}

});

client.on('messageReactionAdd', async (reaction, user) => {
	// reaction.partial vs reaction.message.partial
	if(reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch(error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}

	if(user.partial) {
		try {
			await user.fetch();
		}
		catch(error) {
			console.error('Something went wrong when fetching the user: ', error);
			return;
		}
	}
	// the message has now been cached and is fully available
	if(reaction.message.channel.id !== inputChannelID || !containsImageOrVideo(reaction.message)) return;
	Hof.execute(reaction, hallOfFame);
	console.log('size is now ' + hallOfFame.size);
	console.log('userid: ' + user.id + ' usertag: ' + user.tag);
});

function fetchMessages(channel) {
	return channel.messages.fetch();
}

function buildHof(messages) {
	const reposts = messages.filter(msg => containsImageOrVideo(msg));
	for(const repost of reposts.values()) {
		const url = Hof.getURLFromMsg(repost);
		const hofObject = { flag: true, list: null, count: 0 };
		hallOfFame.set(url, hofObject);
	}
	console.log('collection size after initialization: ' + hallOfFame.size);
}

// embeds and attachments properties will never be null, even if they're empty
// the image preview created by attachments are not considered embeds
function containsImageOrVideo(msg) {
	return Boolean(msg.embeds.length || msg.attachments.size);
}

require('dotenv').config();
client.login(process.env.BOT_TOKEN);
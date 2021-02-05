const { prefix, inputChannelID, outputChannelID } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'USER'] });
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const hallOfFame = new Discord.Collection();

const fs = require('fs');
// create an array of file names in the /command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log(`Pikamee is live! Use '${prefix}' to summon me.`);
	client.channels.fetch(outputChannelID)
		.then(fetchMessages)
		.then(buildHof)
		.catch(console.error);
});

function fetchMessages(channel) {
	return channel.messages.fetch();
}

function buildHof(messages) {
	console.log(messages.filter(msg => msg.attachments.size).size);
}

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

	// if the command is sent through DM, check whether it's applicable there
	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	// check if the user has provided any required args
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
	// if the reaction is partial, try to fetch the complete version
	// reaction.partial vs reaction.message.partial
	if(reaction.partial) {
		// catch error if the message being reacted to was deleted
		try {
			await reaction.fetch();
		}
		catch(error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	// the message has now been cached and is fully available
	if(reaction.message.channel.id !== inputChannelID || !containsImageOrVideo(reaction.message)) return;
	console.log(`The message '${reaction.message.content}' has id ${reaction.message.id}`);
	require('./commands/hallOfFame.js').execute(reaction, hallOfFame);
	console.log(hallOfFame.size);
});

// all messages have truthy values for the 'embeds' and 'attachments' properties;
// messages with image attachments don't necesarily have embeds
function containsImageOrVideo(msg) {
	if(msg.embeds.length || msg.attachments.size) return true;
	return false;
}

require('dotenv').config();
client.login(process.env.BOT_TOKEN);
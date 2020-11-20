module.exports = {
	name: 'uwu',
	aliases: ['owo'],
	description: 'make any text a non 0% more uwu',
	usage: '<text>',
	args: true,
	cooldown: 1,
	guildOnly: false,
	execute(message, args) {
		let convertedMessage = '';

		for(const arg of args) {
			const str = arg.replace(/(?<!tt)[lr](?!$)/gi, 'w').toLowerCase();
			convertedMessage += str + ' ';
		}

		message.channel.send(convertedMessage.concat('uwu'));
	},
};
module.exports = {
	name: 'uwu',
	cooldown: 1,
	description: 'make any text a non 0% more uwu',
	guildOnly: false,
	args: true,
	usage: '<text>',
	execute(message, args) {
		let convertedMessage = '';

		for(const arg of args) {
			const str = arg.replace(/(?<!tt)[lr](?!$)/gi, 'w').toLowerCase();
			convertedMessage += str + ' ';
		}

		message.channel.send(convertedMessage.concat('uwu'));
	},
};
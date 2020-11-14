module.exports = {
	name: 'uwu',
	description: 'make any text a non 0% more uwu',
	args: true,
	execute(message, args) {
		let convertedMessage = '';
		for(const arg of args) {
			const str = arg.replace(/(?<!tt)[lr](?!$)/gi, 'w').toLowerCase();
			convertedMessage = convertedMessage.concat(str + ' ');
		}
		message.channel.send(convertedMessage.concat('uwu'));
	},
};
module.exports = {
	name:'lol',
	description: 'cheeky bot',
	execute(message) {
		let modifiedMsg = '> ';
		let flag = false;
		const msg = message.content.substring(0, message.content.length - 3);
		// steps through the message and appends each char to the modified string
		for(let i = 0; i < msg.length; i++) {
			// the current character can be capitalized
			if(msg[i].match(/[a-z]/i)) {
				// const coinFlip = Math.floor(Math.random() * Math.floor(2));
				modifiedMsg = modifiedMsg.concat(flag ? msg[i].toUpperCase() : msg[i].toLowerCase());
				flag = !flag;
			}
			// if the character can not be capitalized, append it as is
			else {
				modifiedMsg = modifiedMsg.concat(msg[i]);
			}
		}
		modifiedMsg = modifiedMsg.concat(' lol');
		message.channel.send(modifiedMsg);
	},
};
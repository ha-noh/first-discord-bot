module.exports = {
	execute(reaction, db) {
		console.log(`Reaction: ${reaction.emoji} on ${reaction.message}; 
		identifier: ${reaction.emoji.identifier}
		name: ${reaction.emoji.name}`);

		const url = this.getURLFromMsg(reaction.message);
	},
	getURLFromMsg(msg) {
		return msg.attachments.size ? msg.attachments.first().url : msg.embeds[0].url;
	},
};
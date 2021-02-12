module.exports = {
	execute(reaction, hof) {
		console.log(`Reaction: ${reaction.emoji} on ${reaction.message}`);
		const url = this.getURLFromMsg(reaction.message);
		const post = hof.get(url);
		if(!post) {
			hof.set(url, { flag: true, list: null, count: 0 });
		}
	},
	getURLFromMsg(msg) {
		return msg.attachments.size ? msg.attachments.first().url : msg.embeds[0].url;
	},
};
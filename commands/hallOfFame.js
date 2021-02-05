module.exports = {
	execute(reaction, hof) {
		console.log(`Reaction: ${reaction.emoji} on ${reaction.message}`);
		hof.set(reaction.message.id, 'test');
	},
};
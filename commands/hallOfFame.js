module.exports = {
	execute(reaction, hof) {
		console.log(`Reaction: ${reaction.message}`);
		hof.set(reaction.message.id, 'test');
	},
};
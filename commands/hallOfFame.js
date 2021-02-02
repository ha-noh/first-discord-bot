module.exports = {
	execute(reaction, user) {
		console.log(`Reaction: ${reaction.message} User: ${user.username}`);
	},
};
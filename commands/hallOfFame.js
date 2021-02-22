module.exports = {
	execute(reaction, user, db) {
		const { outputChannelID, reactionThreshold } = require('../config.json');
		console.log(`Reaction: ${reaction.emoji.name} on ${reaction.message}`);
		const url = this.getURLFromMsg(reaction.message);
		const selectPost = `SELECT *
							FROM posts
							WHERE url = ?`;

		db.get(selectPost, [url], (err, row) => {
			if(err) return console.error(err.message);

			if(!row) {
				insertPost();
				insertReaction(user.id, reaction.emoji.name);
			}
			else {
				checkRepostConditions(row);
			}
		});

		function insertPost() {
			db.run('INSERT INTO posts VALUES (?, ?, ?)', [url, 0, 1], (err) => {
				if(err) return console.error(err.message);
				console.log(`A row has been inserted into posts with rowid ${this.lastID}`);
			});
		}

		function insertReaction(id, emoji) {
			db.run('INSERT INTO reactions VALUES (?, ?, ?)', [url, id, emoji], (err) => {
				if(err) return console.error(err.message);
				console.log(`A row has been inserted into reactions with rowid ${this.lastID}`);
			});
		}

		function checkRepostConditions(postRecord) {
			if(postRecord) return console.log('row.count: ' + postRecord.count);
			const count = postRecord.count++;
			const flag = postRecord.flag;
			const selectReaction = `SELECT *
									FROM reactions
									WHERE userid = ?`;
			// if Flag is false && Reactor is not in the List, add the Reactor to the List
			if(!flag) {
				db.get(selectReaction, [user.id], (err, row) => {
					if(err) return console.error(err.message);
					if(row) return;
					insertReaction(user.id, reaction.emoji.name);
					// if the length of the List >= the Threshold, repost and set Flag to true
				});
			}
			// else if Flag is true, update the emoji reactions on the Output post
			else {
				updateEmoji();
			}
		}

		function updateEmoji() {
			return;
		}
	},
	getURLFromMsg(msg) {
		return msg.attachments.size ? msg.attachments.first().url : msg.embeds[0].url;
	},
};
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
				insertReaction(user.id, user.tag, reaction.emoji.name);
			}
			else {
				checkRepostConditions(row);
			}
		});

		function insertPost() {
			const values = [url, 0, 0, reaction.message.author.id, reaction.message.author.tag];

			db.run('INSERT INTO posts VALUES (?, ?, ?, ?, ?)', values, err => {
				if(err) return console.error(err.message);
				console.log(`A row has been inserted into posts with rowid ${this.lastID}`);
			});
		}

		function insertReaction(id, tag, emoji, cb) {
			const values = [url, id, tag, emoji];

			db.run('INSERT INTO reactions VALUES (?, ?, ?, ?)', values, err => {
				if(err) return console.error(err.message);
				console.log(`A row has been inserted into reactions with rowid ${this.lastID}`);
				// update count in posts table
				db.get(selectPost, [url], (err, row) => {
					if(err) return console.error(err.message);
					updatePostRecord(0, row.count + 1);
				});

				if(cb) cb();
			});
		}

		function updatePostRecord(flag, count) {
			const updatePost = `UPDATE posts
								SET flag = ?,
									count = ?
								WHERE url = ?`;

			db.run(updatePost, [flag, count, url], err => {
				if(err) return console.error(err.message);
			});
		}

		function checkRepostConditions(postRecord) {
			const count = postRecord.count++;
			const flag = postRecord.flag;

			if(!flag) {
				insertReaction(user.id, user.tag, reaction.emoji.name, checkReactionThreshold);
			}
			else {
				updateEmoji();
			}
		}

		async function checkReactionThreshold() {
			const reactorCount = await getReactorCount().catch(err => console.error(err));

			if(reactorCount >= reactionThreshold) {
				repost();
			}
		}

		function getReactorCount() {
			return new Promise ((resolve, reject) => {
				const selectRows = `SELECT DISTINCT userid
									FROM reactions
									WHERE url = ?`;

				db.all(selectRows, [url], (err, rows) => {
					if(err) reject(err);

					console.log('rows.length: ' + rows.length);
					resolve(rows.length);
				});
			});
		}

		function updateEmoji() {
			console.log(url + ' emoji updated');
		}

		function repost() {
			console.log(url + ' reposted');
		}
	},
	getURLFromMsg(msg) {
		return msg.attachments.size ? msg.attachments.first().url : msg.embeds[0].url;
	},
};
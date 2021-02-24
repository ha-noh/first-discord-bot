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
				insertPost()
					.then(insertReaction(user.id, user.tag, reaction.emoji.name))
					.then(updatePostRecord(0, 1));
			}
			else {
				checkRepostConditions(row);
			}
		});

		function insertPost() {
			return new Promise(resolve => {
				const values = [url, 0, 0, reaction.message.author.id, reaction.message.author.tag];
				const insertSQL = `INSERT INTO posts (
										url, 
										flag, 
										count, 
										userid, 
										usertag
									) VALUES (?, ?, ?, ?, ?)`;

				db.run(insertSQL, values, err => {
					if(err) return console.error(err);

					resolve(`A row has been inserted into posts with rowid ${this.lastID}`);
				});
			});
		}

		function insertReaction(id, tag, emoji) {
			return new Promise(resolve => {
				const values = [url, id, tag, emoji];

				db.run('INSERT INTO reactions VALUES (?, ?, ?, ?)', values, err => {
					if(err) return console.error(err);

					resolve(`A row has been inserted into reactions with rowid ${this.lastID}`);
				});
			});
		}

		function updatePostRecord(flag, inc) {
			return new Promise(resolve => {
				const updatePost = `UPDATE posts
									SET flag = ?,
										count = ?
									WHERE url = ?`;

				db.get(selectPost, [url], (err, row) => {
					if(err) return console.error(err);

					db.run(updatePost, [flag, row.count + inc, url], err => {
						if(err) return console.error(err);
						resolve('A row has been updated with ' + this.changes);
					});
				});
			});
		}

		async function checkRepostConditions(postRecord) {
			const flag = postRecord.flag;

			if(!flag) {
				await insertReaction(user.id, user.tag, reaction.emoji.name);
				updatePostRecord(0, 1);
				checkReactionThreshold();
			}
			else {
				updatePostRecord(1, 1).then(updateEmoji);
			}
		}

		async function checkReactionThreshold() {
			const reactorCount = await getReactorCount().catch(err => console.error(err));

			if(reactorCount >= reactionThreshold) {
				repost();
			}
		}

		function getReactorCount() {
			return new Promise (resolve => {
				const selectRows = `SELECT DISTINCT userid
									FROM reactions
									WHERE url = ?`;

				db.all(selectRows, [url], (err, rows) => {
					if(err) return console.error(err);

					console.log('rows.length: ' + rows.length);
					resolve(rows.length);
				});
			});
		}

		function updateEmoji() {
			console.log(url + ' emoji updated');
		}

		async function repost() {
			const entryNumber = await updatePostRecord(1, 0).then(countHofEntries);
			// repost with usertag, original message, and url
			const repostMsg = `Hall of Fame Entry #${entryNumber}`;
			// add repost id to posts
			console.log(repostMsg);
		}

		function countHofEntries() {
			return new Promise((resolve, reject) => {

				db.get('SELECT COUNT(*) AS count FROM posts WHERE flag = 1', [], (err, row) => {
					if(err) return console.error(err);
					if(row.count) resolve(row.count);
					else reject('row.count is undefinted');
				});
			});
		}
	},

	getURLFromMsg(msg) {
		return msg.attachments.size ? msg.attachments.first().url : msg.embeds[0].url;
	},
};
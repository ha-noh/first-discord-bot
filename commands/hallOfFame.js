module.exports = {
	execute(reaction, user, db) {
		console.log(`Reaction: ${reaction.emoji.name} on ${reaction.message}`);
		const url = this.getURLFromMsg(reaction.message);
		const sql = `SELECT *
					 FROM posts
					 WHERE url = ?`;

		db.get(sql, [url], (err, row) => {
			if(err) return console.error(err.message);

			if(!row) {
				insertRecord();
			}
			else {
				checkRepostConditions(row);
			}
		});

		function insertRecord() {
			db.run('INSERT INTO posts VALUES (?, ?, ?)', [url, 0, 1], (err) => {
				if(err) return console.error(err.message);
				console.log(`A row has been inserted with rowid ${this.lastID}`);
			});

			db.run('INSERT INTO reactions VALUES (?, ?, ?)', [url, user.tag, reaction.emoji], (err) => {
				if(err) return console.error(err.message);
			});
		}

		function checkRepostConditions(row) {
			const count = row.count++;
			// if Flag is false && Reactor is not in the List, add the Reactor to the List
			// if the length of the List >= the Threshold, repost and set Flag to true
			// else if the length is less than the Threshold, return
			// else if Flag is true, update the emoji reactions on the Output post
			return;
		}

		function insertIfNotExist() {
			return;
		}
	},
	getURLFromMsg(msg) {
		return msg.attachments.size ? msg.attachments.first().url : msg.embeds[0].url;
	},
};
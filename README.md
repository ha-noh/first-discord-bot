# ABOUT THIS HERE BOT
Testing out discord.js APIs
# HOW TO USE YOUR OWN VERSION OF THIS HERE BOT
1. Go to https://discord.com/developers/applications using the account you would like the bot to function under, and create an application.
2. From the application page, go to Settings>Bot to create a bot from your new application.
3. Download/clone this repository, and make sure you have node.js installed - as well as all of the npm packages listed under dependencies.
4. Create a file named `.env` in the project's main directory. Have its contents be `BOT_TOKEN = (your bot token)`; this bot token can be found on the same page where you created your bot.
5. Create another file, named `config.json`, again in the main folder. It should look like so: 
	{
		"prefix": "+",
		"outputChannelID": <discord channel id where messages will be reposted>,
		"inputChannelID": <discord channel id where messages will be read from>,
		"reactionThreshold": "3"
	}
6. To run this bot locally, go to this repository in a CLI and use the command `node bot.js` to spin up your new bot. Presumably you have node.js installed.
# DEPENDENCIES 
Node.js and these subsequent packages:
* discord.js
* dotenv
* sqlite3
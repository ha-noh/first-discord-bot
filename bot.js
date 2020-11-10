const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();

client.login(process.env.BOT_TOKEN);
client.on('ready', () => {
    console.log('Pikamee is live!');
});

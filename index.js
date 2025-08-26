require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

const webhookUrl = process.env.N8N_WEBHOOK_DM;

client.once(Events.ClientReady, () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.channel.type !== 1 || message.author.bot) return; // 1 = DM
  try {
    await axios.post(webhookUrl, {
      user_id: message.author.id,
      username: message.author.username,
      message: message.content
    });
    console.log('Sent message to n8n webhook');
  } catch (error) {
    console.error('Error sending message to n8n:', error.message);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await axios.post(webhookUrl, {
      event: 'user_joined',
      user_id: member.user.id,
      username: member.user.username
    });
    console.log('Sent join event to n8n webhook');
  } catch (error) {
    console.error('Error sending join event:', error.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

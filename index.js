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
  partials: [Partials.Channel, Partials.GuildMember]
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

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    const oldRolesCache = oldMember && oldMember.roles && oldMember.roles.cache ? oldMember.roles.cache : null;
    const addedRoles = oldRolesCache
      ? newMember.roles.cache.filter(role => !oldRolesCache.has(role.id))
      : newMember.roles.cache; // Kein alter Cache: alle aktuellen Rollen als hinzugefügt werten
    if (addedRoles.size === 0) return;

    for (const [roleId, role] of addedRoles) {
      const payload = {
        event: 'role_added',
        user_id: newMember.user.id,
        username: newMember.user.username,
        role_id: role.id,
        role_name: role.name
      };
      console.log('Sending role_added payload to n8n:', payload);
      await axios.post(webhookUrl, payload);
    }
    console.log(`Sent ${addedRoles.size} role_added event(s) to n8n webhook`);
  } catch (error) {
    console.error('Error sending role_added event:', error.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

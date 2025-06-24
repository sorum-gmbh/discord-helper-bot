import { Client, GatewayIntentBits, Partials } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`Bot online als ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  try {
    await member.send(
      `👋 Willkommen ${member.user.username}!

Ich bin dein digitaler Helfer. Wenn du bereit bist, schreib mir einfach hier eine Nachricht.`
    );
  } catch (err) {
    console.error(`DM an ${member.user.username} fehlgeschlagen.`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 1) return; // Nur DMs verarbeiten

  try {
    await axios.post(process.env.N8N_WEBHOOK_URL, {
      discord_id: message.author.id,
      username: message.author.username,
      content: message.content,
    });
  } catch (err) {
    console.error('Fehler beim Senden an n8n:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);

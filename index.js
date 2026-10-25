const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  AttachmentBuilder, 
  PermissionsBitField 
} = require('discord.js');
const config = require('./config');
const { backupAndZip } = require('./sql');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function processBackupAndSend(targetChannel, requestedUser = null) {
  const statusMsg = await targetChannel.send('⏳ SQL yedeği alınıyor ve zip arşivi hazırlanıyor...');

  try {
    const result = await backupAndZip();
    const attachment = new AttachmentBuilder(result.filePath, { name: result.fileName });

    const embed = new EmbedBuilder()
      .setColor(0x00FF7F)
      .setTitle('📦 FiveM SQL Yedekleme Başarılı')
      .setDescription(
        requestedUser 
          ? `Yedekleyen: <@${requestedUser}>` 
          : 'Otomatik yedekleme başarıyla tamamlandı.'
      )
      .addFields(
        { name: '🗄️ Veritabanı Adı', value: `\`${config.database.name}\``, inline: true },
        { name: '💾 Dosya Boyutu', value: `\`${result.sizeMb} MB\``, inline: true },
      )
      .setFooter({ text: 'FiveM Sql Bot' })
      .setTimestamp();

    if (config.discord.banner && config.discord.banner.trim() !== '') {
      embed.setImage(config.discord.banner);
    }

    await targetChannel.send({
      embeds: [embed],
      files: [attachment]
    });

    await statusMsg.delete().catch(() => {});
  } catch (error) {
    console.error('[HATA]', error);
    await statusMsg.edit(`❌ **Yedekleme Hatası:** \`\`\`${error.message}\`\`\``);
  }
}

client.once('ready', () => {
  console.log(`[BOT] ${client.user.tag} aktif! Prefix: ${config.discord.prefix}`);

  const channel = client.channels.cache.get(config.discord.channelId);
  if (channel) {
    console.log(`[CRON] Otomatik yedek devrede (Her ${config.backup.intervalMinutes} dakikada bir).`);
    setInterval(() => {
      processBackupAndSend(channel, null);
    }, config.backup.intervalMinutes * 60 * 1000);
  } else {
    console.warn('[UYARI] config.js içindeki channelId bulunamadı veya bot kanala erişemiyor.');
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.discord.prefix)) return;

  const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'yedek') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Bu komutu sadece `Yönetici` yetkisi olanlar kullanabilir.');
    }
    await processBackupAndSend(message.channel, message.author.id);
  }
});

client.login(config.discord.token);
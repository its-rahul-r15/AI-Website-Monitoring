const User = require('../models/User');
const telegramService = require('../services/telegramService');

// Telegram webhook handle karna
const handleTelegramWebhook = async (req, res) => {
  try {
    const update = req.body;
    console.log('📨 Telegram Webhook Received:', update);

    // Message receive hua hai
    if (update.message) {
      const { chat, text, from } = update.message;
      const chatId = chat.id;
      const userId = from.id;

      console.log(`💬 Message from ${from.first_name} (${chatId}): ${text}`);

      // /start command handle karna
      if (text === '/start') {
        await handleStartCommand(chat, from);
      }
      
      // /connect command handle karna (with verification code)
      else if (text.startsWith('/connect ')) {
        const verificationCode = text.split(' ')[1];
        await handleConnectCommand(chatId, from, verificationCode);
      }
      
      else {
        await telegramService.sendMessage(chatId, 
          '🤖 <b>AI Website Monitor Bot</b>\n\n' +
          'Available Commands:\n' +
          '/start - Start the bot\n' +
          '/connect CODE - Connect your account\n' +
          '/help - Show help'
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};

// /start command handle karna
const handleStartCommand = async (chat, from) => {
  const chatId = chat.id;
  const userName = from.first_name || 'User';

  const message = `
👋 <b>Hello ${userName}!</b>

Welcome to <b>AI Website Monitor</b> 🤖

I will send you real-time alerts about your website's:
• Uptime & Downtime
• Performance issues  
• SEO recommendations
• SSL certificate expiry
• Broken links

To get started, you need to connect your account:

1. Go to your dashboard
2. Click "Connect Telegram"
3. Use the verification code with /connect command

Need help? Use /help
  `.trim();

  await telegramService.sendMessage(chatId, message);
};

// /connect command handle karna
const handleConnectCommand = async (chatId, from, verificationCode) => {
  try {
    if (!verificationCode) {
      await telegramService.sendMessage(chatId,
        '❌ <b>Verification code missing!</b>\n\n' +
        'Usage: <code>/connect YOUR_CODE</code>\n\n' +
        'Get the code from your dashboard.'
      );
      return;
    }

    // Database mein verification code check karo
    const user = await User.findOne({ 
      telegramVerificationCode: verificationCode,
      telegramVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      await telegramService.sendMessage(chatId,
        '❌ <b>Invalid or expired verification code!</b>\n\n' +
        'Please generate a new code from your dashboard.'
      );
      return;
    }

    // User update karo
    user.telegramChatId = chatId;
    user.telegramVerificationCode = null;
    user.telegramVerificationExpires = null;
    user.telegramUsername = from.username || from.first_name;
    await user.save();

    await telegramService.sendMessage(chatId,
      `✅ <b>Account Connected Successfully!</b>\n\n` +
      `Welcome <b>${user.name}</b>!\n\n` +
      `📧 <b>Email:</b> ${user.email}\n` +
      `🔗 <b>Connected:</b> ${new Date().toLocaleString()}\n\n` +
      `You will now receive real-time monitoring alerts here.`
    );

    console.log(`✅ Telegram connected for user: ${user.email}, chatId: ${chatId}`);

  } catch (error) {
    console.error('Connect command error:', error);
    await telegramService.sendMessage(chatId,
      '❌ <b>Connection failed!</b>\n\n' +
      'Please try again or contact support.'
    );
  }
};

module.exports = {
  handleTelegramWebhook
};
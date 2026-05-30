const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN || '8890269997:AAFQt1NGTAeCrsBhXFrAvsMULiWW_Cmn3SI';

const bot = new TelegramBot(TOKEN, {
    polling: true
});

console.log('SerfStat Bot запущен');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        '📊 SerfStat Analyzer\n\nОтправь скрин профиля Серфбота.'
    );
});

bot.on('photo', async (msg) => {

    const photo = msg.photo[msg.photo.length - 1];

    bot.sendMessage(
        msg.chat.id,
        `✅ Скрин получен.\n\nID фото:\n${photo.file_id}`
    );
});

bot.on('polling_error', (error) => {
    console.log('Polling Error:', error.message);
});

bot.on('error', (error) => {
    console.log('Bot Error:', error.message);
});
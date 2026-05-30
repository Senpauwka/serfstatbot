const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');
const TOKEN = process.env.BOT_TOKEN || '8890269997:AAFQt1NGTAeCrsBhXFrAvsMULiWW_Cmn3SI';
const OCR_API_KEY = process.env.OCR_API_KEY;
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

    try {

        const photo = msg.photo[msg.photo.length - 1];

        const file = await bot.getFile(photo.file_id);

        const imageUrl =
            `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

        await bot.sendMessage(
            msg.chat.id,
            '🔍 Распознаю текст...'
        );

        const formData = new FormData();

        formData.append(
            'url',
            imageUrl
        );

        formData.append(
            'apikey',
            OCR_API_KEY
        );

        formData.append(
            'language',
            'rus'
        );

        const response = await axios.post(
            'https://api.ocr.space/parse/image',
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        console.log(JSON.stringify(response.data, null, 2));

const parsed =
    response.data?.ParsedResults?.[0]?.ParsedText
    || 'Текст не найден';
        await bot.sendMessage(
            msg.chat.id,
            parsed.substring(0, 3500)
        );

    } catch (err) {

        console.log(err);

        await bot.sendMessage(
            msg.chat.id,
            '❌ Ошибка OCR'
        );
    }
});

bot.on('polling_error', (error) => {
    console.log('Polling Error:', error.message);
});

bot.on('error', (error) => {
    console.log('Bot Error:', error.message);
});
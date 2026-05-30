const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const TOKEN = process.env.BOT_TOKEN || '8890269997:AAFQt1NGTAeCrsBhXFrAvsMULiWW_Cmn3SI';
const OCR_API_KEY = process.env.OCR_API_KEY;
const bot = new TelegramBot(TOKEN, {
    polling: true
});

console.log('VER 2.0 TEST');

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

        const imageResponse = await axios.get(
            imageUrl,
            {
                responseType: 'stream'
            }
        );

        const tempFile = path.join(
            __dirname,
            'temp.jpg'
        );

        const writer = fs.createWriteStream(tempFile);

        imageResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const formData = new FormData();

        formData.append(
            'apikey',
            OCR_API_KEY
        );

        formData.append(
            'language',
            'rus'
        );

        formData.append(
            'file',
            fs.createReadStream(tempFile)
        );

        const response = await axios.post(
            'https://api.ocr.space/parse/image',
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        console.log(
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

        const parsed =
            response.data?.ParsedResults?.[0]?.ParsedText
            || 'Текст не найден';
const memesMatch = parsed.match(/(\d+)\s+мемов/i);
const rankMatch = parsed.match(/(\d+)\s+ранг/i);
const ptsMatch = parsed.match(/([\d,]+)\s+pts/i);

const commonMatch = parsed.match(/(\d+)\s+из\s+59/i);

const rareMatch = parsed.match(/Редких.*?(\d+)\s+из\s+58/i);
const superRareMatch = parsed.match(/Сверхредких.*?(\d+)\s+из\s+58/i);
const epicMatch = parsed.match(/Эпических.*?(\d+)\s+из\s+61/i);
const mythicMatch = parsed.match(/Мифических.*?(\d+)\s+из\s+57/i);
const legendaryMatch = parsed.match(/Легендарных.*?(\d+)\s+из\s+38/i);

const memes = memesMatch ? memesMatch[1] : '?';
const rank = rankMatch ? rankMatch[1] : '?';
const pts = ptsMatch ? ptsMatch[1] : '?';

const common = commonMatch ? commonMatch[1] : '?';
const rare = rareMatch ? rareMatch[1] : '?';
const superRare = superRareMatch ? superRareMatch[1] : '?';
const epic = epicMatch ? epicMatch[1] : '?';
const mythic = mythicMatch ? mythicMatch[1] : '?';
const legendary = legendaryMatch ? legendaryMatch[1] : '?';
        await bot.sendMessage(
            msg.chat.id,
            parsed.substring(0, 3500)
        );

        fs.unlinkSync(tempFile);

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
const http = require('http');

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
    res.writeHead(200);
    res.end('SerfStat Bot работает');
}).listen(PORT);

console.log(`HTTP сервер запущен на порту ${PORT}`);
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const TOKEN = process.env.BOT_TOKEN;
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
    `temp_${Date.now()}.jpg`
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
console.log("PARSED TEXT:");
console.log(parsed);
const memesMatch = parsed.match(/(\d+)\s+мемов/i);
const rankMatch = parsed.match(/([\d,]+)\s+ранг/i);
const rank =
    rankMatch
        ? rankMatch[1].replace(/,/g, '')
        : '?';
const ptsMatch =
    parsed.match(/([\d.,]+)\s*pts/i);

let pts = '?';
let ptsNumber = 0;

if (ptsMatch) {

    pts = ptsMatch[1];

    ptsNumber =
        Number(
            pts.replace(/[.,]/g, '')
        );

} else {

    const allNumbers =
        parsed.match(/\d[\d.,]*/g);

    if (allNumbers) {

        const largeNumbers =
            allNumbers.filter(
                n =>
                    Number(
                        n.replace(/[.,]/g, '')
                    ) > 5000
            );

        if (largeNumbers.length > 0) {

            pts =
                largeNumbers[
                    largeNumbers.length - 1
                ];

            ptsNumber =
                Number(
                    pts.replace(/[.,]/g, '')
                );
        }
    }
}
console.log('RANK:', rank);
console.log('PTS:', pts);
console.log('PTS NUMBER:', ptsNumber);

const commonMatch = parsed.match(/(\d+)\s+из\s+59/i);

const rareMatch = parsed.match(/Редких.*?(\d+)\s+из\s+58/i);
const superRareMatch = parsed.match(/Сверхредких.*?(\d+)\s+из\s+58/i);
const epicMatch = parsed.match(/Эпических.*?(\d+)\s+из\s+61/i);
const mythicMatch = parsed.match(/Мифических.*?(\d+)\s+из\s+57/i);
const legendaryMatch = parsed.match(/Легендарных.*?(\d+)\s+из\s+38/i);

const memes = memesMatch ? memesMatch[1] : '?';


const common = commonMatch ? commonMatch[1] : '?';
const rare = rareMatch ? rareMatch[1] : '?';
const superRare = superRareMatch ? superRareMatch[1] : '?';
const epic = epicMatch ? epicMatch[1] : '?';
const mythic = mythicMatch ? mythicMatch[1] : '?';
const legendary = legendaryMatch ? legendaryMatch[1] : '?';
const uniqueMemes =
    Number(common) +
    Number(rare) +
    Number(superRare) +
    Number(epic) +
    Number(mythic) +
    Number(legendary);
const collectionPercent =
(
    uniqueMemes / 331 * 100
).toFixed(1);
const minPts =
    Number(common) * 25 +
    Number(rare) * 55 +
    Number(superRare) * 80 +
    Number(epic) * 150 +
    Number(mythic) * 250 +
    Number(legendary) * 750;
const estimatedRolls =
    ptsNumber > 0
        ? Math.round(
            ptsNumber / 55
          )
        : 0;

const duplicates =
    estimatedRolls > 0
        ? estimatedRolls - uniqueMemes
        : 0;
const luckScore =
    estimatedRolls > 0
        ? (
            uniqueMemes /
            estimatedRolls *
            100
          )
        : 0;

const newRate =
    estimatedRolls > 0
        ? (
            uniqueMemes /
            estimatedRolls *
            100
          ).toFixed(1)
        : '?';

const duplicateRate =
    estimatedRolls > 0
        ? (
            duplicates /
            estimatedRolls *
            100
          ).toFixed(1)
        : '?';
let luckText = '❓ Не определена';

if (newRate >= 40) {

    luckText = '👑 Легендарная';

} else if (newRate >= 30) {

    luckText = '🔥 Очень высокая';

} else if (newRate >= 20) {

    luckText = '🍀 Высокая';

} else if (newRate >= 10) {

    luckText = '🙂 Средняя';

} else {

    luckText = '💀 Не везёт';
}

        const report =
`📊 Анализ профиля

🎴 Мемов в боте: ${memes}
🏆 Ранг: ${rank}
⭐ PTS: ${pts}

📚 Коллекция 🎴

🩵 Обычные: ${common}/59
💚 Редкие: ${rare}/58
💙 Сверхредкие: ${superRare}/58
💜 Эпические: ${epic}/61
❤️ Мифические: ${mythic}/57
⭐ Легендарные: ${legendary}/38

━━━━━━━━━━━━━━━━━━━━━━━━

🎴 Уникальных мемов: ${uniqueMemes}

📚 Закрытие коллекции:
${collectionPercent}%

🗑️ Оценка баянов: ${duplicates}

📈 Коэффициент новых:
${newRate}%

🍀 Удача аккаунта:
${luckText}

📉 Коэффициент баянов:
${duplicateRate}%

🎰 Оценка прокрутов:
${estimatedRolls}`;

await bot.sendMessage(
    msg.chat.id,
    report
);

        if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
};

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
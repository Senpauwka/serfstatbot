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
const userData = {};

console.log('VER 2.0 TEST');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        '📊 SerfStat Analyzer\n\nОтправь скрин профиля Серфбота.'
    );
});

bot.onText(/\/profile/, (msg) => {

    const data =
        userData[msg.chat.id];

    if (!data) {

        return bot.sendMessage(
            msg.chat.id,
            '❌ Сначала отправь скрин профиля.'
        );
    }

    bot.sendMessage(
        msg.chat.id,

`📊 Профиль

🏆 Ранг: ${data.rank}
⭐ PTS: ${data.pts}

🎴 Уникальных мемов:
${data.uniqueMemes}/331

📚 Закрытие коллекции:
${data.collectionPercent}%

🏅 Титул:
${data.collectorTitle}

⚜️ Рейтинг:
${data.accountRank}`
    );
});

bot.onText(/\/achievements/, (msg) => {

    const data =
        userData[msg.chat.id];

    if (!data) {

        return bot.sendMessage(
            msg.chat.id,
            '❌ Сначала отправь скрин профиля.'
        );
    }

    bot.sendMessage(
        msg.chat.id,

`🏆 Достижения

${data.achievements.join('\n')}`
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

const commonPercent =
    (
        Number(common) / 59 * 100
    ).toFixed(1);

const rarePercent =
    (
        Number(rare) / 58 * 100
    ).toFixed(1);

const superRarePercent =
    (
        Number(superRare) / 58 * 100
    ).toFixed(1);

const epicPercent =
    (
        Number(epic) / 61 * 100
    ).toFixed(1);

const mythicPercent =
    (
        Number(mythic) / 57 * 100
    ).toFixed(1);

const legendaryPercent =
    (
        Number(legendary) / 38 * 100
    ).toFixed(1);

const uniqueMemes =
    Number(common) +
    Number(rare) +
    Number(superRare) +
    Number(epic) +
    Number(mythic) +
    Number(legendary);

const TOTAL_MEMES =
    59 +
    58 +
    58 +
    61 +
    57 +
    38;

const collectionPercent =
(
    uniqueMemes /
    TOTAL_MEMES *
    100
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
let collectorTitle = '📦 Новичок';

if (collectionPercent >= 100) {

    collectorTitle =
        '💎 Абсолютный Коллекционер';

} else if (collectionPercent >= 90) {

    collectorTitle =
        '👑 Хранитель Мемов';

} else if (collectionPercent >= 75) {

    collectorTitle =
        '🥇 Архивариус';

} else if (collectionPercent >= 50) {

    collectorTitle =
        '🥈 Коллекционер';

} else if (collectionPercent >= 25) {

    collectorTitle =
        '🥉 Собиратель';
}

let nextCollectionGoal = '';

const nextMilestones = [
    25,
    50,
    100,
    200,
    300,
    TOTAL_MEMES
];

const nextGoal =
    nextMilestones.find(
        goal => uniqueMemes < goal
    );

if (nextGoal) {

    nextCollectionGoal =
        `До следующей цели: ${
            nextGoal - uniqueMemes
        } мемов`;

} else {

    nextCollectionGoal =
        '🏆 Коллекция полностью собрана';
}

const commonAchievements = [];
const rareAchievements = [];
const epicAchievements = [];
const legendaryAchievements = [];

// Легендарные

if (Number(legendary) >= 1)
    commonAchievements.push(
        '⭐ Первая легендарка'
    );

if (Number(legendary) >= 10)
    rareAchievements.push(
        '⭐ Охотник на легендарки'
    );

if (Number(legendary) >= 20)
    epicAchievements.push(
        '🌟 Коллекционер легенд'
    );

if (Number(legendary) >= 30)
    legendaryAchievements.push(
        '👑 Повелитель легендарок'
    );

if (Number(legendary) >= 38)
    legendaryAchievements.push(
       '💎 Все легендарки собраны
    );


// Мифические

if (Number(mythic) >= 10)
    commonAchievements.push('🧡 Искатель мифов');

if (Number(mythic) >= 25)
    rareAchievements.push(
        '🔥 Мифический коллекционер'
    );

if (Number(mythic) >= 40)
    epicAchievements.push(
        '⚡ Архимаг мификов'
    );

if (Number(mythic) >= 57)
    legendaryAchievements.push(
        '💎 Все мифики собраны'
    );


// Эпические

if (Number(epic) >= 20)
    commonAchievements.push('💜 Любитель эпиков');

if (Number(epic) >= 40)
    rareAchievements.push('📚 Эпический архив');

if (Number(epic) >= 61)
    legendaryAchievements.push('💎 Все эпики собраны');


// Коллекция

if (collectionPercent >= 25)
    commonAchievements.push('📦 Четверть коллекции');

if (collectionPercent >= 50)
    rareAchievements.push('📚 Половина коллекции');

if (collectionPercent >= 75)
    epicAchievements.push('🥇 Три четверти пути');

if (collectionPercent >= 90)
    legendaryAchievements.push('🏆 Почти собрал всё');

if (collectionPercent >= 100)
    legendaryAchievements.push(
        '💎 Коллекция завершена'
    );


// Количество мемов

if (uniqueMemes >= 25)
    commonAchievements.push('🎴 Первые 25 мемов');

if (uniqueMemes >= 50)
    rareAchievements.push('📚 Первые 50 мемов');

if (uniqueMemes >= 100)
    epicAchievements.push('🎯 Сотня мемов');

if (uniqueMemes >= 200)
    legendaryAchievements.push('🔥 200 уникальных мемов');

if (uniqueMemes >= 300)
    legendaryAchievements.push(
        '👑 300 уникальных мемов'
    );


// Удача

if (newRate >= 20)
    rareAchievements.push('🍀 Везунчик');

if (newRate >= 30)
    epicAchievements.push('🔥 Любимчик рандома');

if (newRate >= 40)
    legendaryAchievements.push('👑 Избранник RNG');

let accountScore = 0;

accountScore += uniqueMemes * 2;
accountScore += Number(legendary) * 50;
accountScore += Number(mythic) * 20;
accountScore += Number(epic) * 10;
accountScore += Number(superRare) * 5;

accountScore += Math.floor(
    collectionPercent * 5
);

let accountRank = '📦 Новобранец';

if (accountScore >= 5000) {

    accountRank =
        '👑 Император Мемов';

} else if (accountScore >= 3500) {

    accountRank =
        '⚜️ Лорд Мемов';

} else if (accountScore >= 2500) {

    accountRank =
        '🏆 Магистр Коллекции';

} else if (accountScore >= 1500) {

    accountRank =
        '🥇 Ветеран';

} else if (accountScore >= 750) {

    accountRank =
        '🥈 Опытный коллекционер';
}

userData[msg.chat.id] = {
    memes,
    rank,
    pts,
    common,
    rare,
    superRare,
    epic,
    mythic,
    legendary,
    uniqueMemes,
    collectionPercent,
    minPts,
    estimatedRolls,
    duplicates,
    newRate,
    duplicateRate,
    luckText,
    collectorTitle,
    accountRank,
    accountScore,
    achievements,
    nextCollectionGoal
};

const totalAchievements =
    commonAchievements.length +
    rareAchievements.length +
    epicAchievements.length +
    legendaryAchievements.length;

        const report =
`📊 Анализ профиля

🎴 Мемов в боте: ${memes}
🏆 Ранг: ${rank}
⭐ PTS: ${pts}

📚 Коллекция 🎴

🩵 Обычные:
${common}/59 (${commonPercent}%)
💚 Редкие:
${rare}/58 (${rarePercent}%)
💙 Сверхредкие:
${superRare}/58 (${superRarePercent}%)
💜 Эпические:
${epic}/61 (${epicPercent}%)
❤️ Мифические:
${mythic}/57 (${mythicPercent}%)
⭐ Легендарные:
${legendary}/38 (${legendaryPercent}%)
━━━━━━━━━━━━━━━━━━━━━━━━

🎴 Уникальных мемов: ${uniqueMemes}

💎 Ценность коллекции:
${minPts} PTS

📚 Закрытие коллекции:
${collectionPercent}%

🎯 Следующая цель:
${nextCollectionGoal}

🏅 Титул:
${collectorTitle}

⚜️ Рейтинг аккаунта:
${accountRank}

📊 Сила аккаунта:
${accountScore}

🗑️ Оценка баянов: ${duplicates}

📈 Коэффициент новых:
${newRate}%

🍀 Удача аккаунта:
${luckText}

📉 Коэффициент баянов:
${duplicateRate}%

🏆 Достижения:
${totalAchievements}/22

🟢 Обычные:
${commonAchievements.length}

🔵 Редкие:
${rareAchievements.length}

🟣 Эпические:
${epicAchievements.length}

🟡 Легендарные:
${legendaryAchievements.length}

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
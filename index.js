const https = require('https');

const TOKEN = '8890269997:AAFQt1NGTAeCrsBhXFrAvsMULiWW_Cmn3SI';

function sendMessage(chatId, text) {
    const data = JSON.stringify({
        chat_id: chatId,
        text: text
    });

    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options);

    req.write(data);
    req.end();
}

function getUpdates(offset = 0) {
    https.get(
        `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}`,
        (res) => {

            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {

                const json = JSON.parse(data);

                if (!json.result) return;

                json.result.forEach(update => {

                    const message = update.message;

                    if (!message) return;

                    const chatId = message.chat.id;

                    // /start
                    if (message.text === '/start') {

                        sendMessage(
                            chatId,
                            '📊 SerfStat Analyzer запущен.\n\nОтправь скрин профиля.'
                        );
                    }

                    // Фото
                    if (message.photo) {

                        sendMessage(
                            chatId,
                            '✅ Скрин получен.\nАнализ скоро будет подключён.'
                        );
                    }

                    offset = update.update_id + 1;
                });

                setTimeout(() => {
                    getUpdates(offset);
                }, 1000);
            });
        }
    );
}

console.log('Бот запущен...');

getUpdates();
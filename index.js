const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('QR Scan Kar Phone Se!');
});

client.on('ready', () => {
    console.log('Bot Connected! Live on Render.');
});

client.on('message', async message => {
    const text = message.body.trim().toLowerCase();
    const onlyDigits = text.replace(/\D/g, '');

    if (onlyDigits.length === 10 && text.length === 10) {
        message.reply(`Searching ${onlyDigits}... Wait!`);

        try {
            const response = await fetch(`https://x2-proxy.vercel.app/api?num=${onlyDigits}`);
            if (!response.ok) {
                message.reply('API error, try later!');
                return;
            }
            const data = await response.json();

            if (data.success && data.result && data.result.length > 0) {
                const info = data.result[0];
                let reply = `Details for ${onlyDigits}:\n\n`;
                reply += `Name: ${info.name || 'N/A'}\n`;
                reply += `Father: ${info.father_name || 'N/A'}\n`;
                reply += `Address: ${(info.address || '').replace(/!/g, ' ') || 'N/A'}\n`;
                reply += `Alt Mobile: ${info.alt_mobile || 'N/A'}\n`;
                reply += `Circle: ${info.circle || 'N/A'}\n`;
                reply += `ID: ${info.id_number || 'N/A'}`;
                message.reply(reply);
            } else {
                message.reply(`No details for ${onlyDigits}.`);
            }
        } catch (error) {
            message.reply('Error, try later!');
            console.error(error);
        }
        return;
    }

    // Casual replies
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
        message.reply('Hey! Send 10-digit number for details 😊');
    } else {
        message.reply('Hi! Send a 10-digit number to search.');
    }
});

client.initialize();

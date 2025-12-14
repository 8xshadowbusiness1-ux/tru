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
    // Clean bada QR image link (direct click kar scan ho jayega)
    const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=' + encodeURIComponent(qr);
    
    console.log('\n');
    console.log('=====================================');
    console.log('   DIRECT QR SCAN LINK (CLICK KAR)');
    console.log('=====================================');
    console.log(qrImageUrl);
    console.log('=====================================');
    console.log('\n');
    
    // Optional: Chhota ASCII QR bhi dikha de
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot Connected! Ab fully live hai on Render 🚀');
    console.log('Ab messages aayenge aur replies jaayenge.');
});

client.on('message', async message => {
    const text = message.body.trim().toLowerCase();
    const onlyDigits = text.replace(/\D/g, '');

    // 10-digit number search
    if (onlyDigits.length === 10 && text.length === 10) {
        message.reply(`Searching details for ${onlyDigits}... Please wait!`);

        try {
            const response = await fetch(`https://x2-proxy.vercel.app/api?num=${onlyDigits}`, { timeout: 15000 });
            
            if (!response.ok) {
                message.reply('API error right now. Try again later!');
                return;
            }

            const data = await response.json();

            if (data.success && data.result && data.result.length > 0) {
                const info = data.result[0];
                let reply = `Details found for ${onlyDigits}:\n\n`;
                reply += `Name: ${info.name || 'N/A'}\n`;
                reply += `Father: ${info.father_name || 'N/A'}\n`;
                reply += `Address: ${(info.address || '').replace(/!/g, ' ') || 'N/A'}\n`;
                reply += `Alt Mobile: ${info.alt_mobile || 'N/A'}\n`;
                reply += `Circle: ${info.circle || 'N/A'}\n`;
                reply += `ID Number: ${info.id_number || 'N/A'}`;

                message.reply(reply);
            } else {
                message.reply(`No details found for ${onlyDigits}.`);
            }
        } catch (error) {
            message.reply('Something went wrong. Try again later!');
            console.error('API Error:', error);
        }
        return;
    }

    // Casual English replies
    if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('hlo')) {
        message.reply('Hey there! 👋\nSend any 10-digit Indian mobile number and I will fetch its details for you.');
    }
    else if (text.includes('how are you') || text.includes('kaise ho') || text.includes('whats up')) {
        message.reply('I am running perfectly! Ready to search any number 😊\nJust send a 10-digit number.');
    }
    else if (text.includes('thanks') || text.includes('thank you') || text.includes('dhanyavad')) {
        message.reply('You are most welcome! Need anything else?');
    }
    else if (text.includes('bye') || text.includes('goodbye')) {
        message.reply('Bye! Have a great day 👋');
    }
    else {
        message.reply('Hi! Send me a 10-digit mobile number and I will try to find its details.\nExample: 7701972396');
    }
});

client.initialize();

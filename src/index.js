const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const path = require('path');
const input = require("input");
const fs = require("fs");
const { enviarParaWhatsApp } = require("./zap");
require("dotenv/config");

const usuariosPath = path.join(__dirname, '..', 'usuarios.json');

function getUsuariosInteresse() {
    if (!fs.existsSync(usuariosPath)) fs.writeFileSync(usuariosPath, '{}');
    return JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
}

let savedSession = "";
if (fs.existsSync("session.json")) {
    const data = JSON.parse(fs.readFileSync("session.json", "utf8"));
    savedSession = data.session;
}

const stringSession = new StringSession(savedSession);

async function iniciarBotTelegram() {
    const client = new TelegramClient(stringSession, Number(process.env.API_ID), process.env.API_HASH, {
        connectionRetries: 5,
    });

    try {
        await client.connect();

        if (!client.connected) {
            await client.start({
                phoneNumber: async () => await input.text("Número de telefone: "),
                password: async () => await input.text("Senha de 2FA (se tiver): "),
                phoneCode: async () => await input.text("Código de verificação: "),
                onError: (err) => console.log(err),
            });

            console.log("✅ Logado com sucesso!");
            const sessionString = client.session.save();
            fs.writeFileSync("session.json", JSON.stringify({ session: sessionString }, null, 2));
            console.log("💾 Sessão salva com sucesso.");
        }

        async function processarPromocao(message, mediaBuffer = null) {
            const texto = `Nova promoção detectada:\n\n${message}`;
            const caminhoImagem = mediaBuffer
                ? path.join(__dirname, 'temp', `promo_${Date.now()}.jpg`)
                : null;

            if (mediaBuffer && caminhoImagem) {
                fs.writeFileSync(caminhoImagem, mediaBuffer);
                console.log(`🖼️ Imagem salva como ${path.basename(caminhoImagem)}`);
            }

            try {
                const grupoPadraoJid = process.env.GROUP_DEFAULT;
                await enviarParaWhatsApp(grupoPadraoJid, texto, caminhoImagem);

                const usuarios = getUsuariosInteresse();
                for (const numero in usuarios) {
                    const palavras = usuarios[numero];
                    const contemPalavra = palavras.some(p =>
                        message.toLowerCase().includes(p.toLowerCase())
                    );

                    if (contemPalavra) {
                        const jid = numero.replace(/\D/g, '') + "@s.whatsapp.net";
                        await enviarParaWhatsApp(jid, texto, caminhoImagem);
                    }
                }
            } finally {
                if (caminhoImagem && fs.existsSync(caminhoImagem)) {
                    fs.unlink(caminhoImagem, (err) => {
                        if (err) console.error('❌ Erro ao deletar imagem temporária:', err.message);
                        else console.log('🧹 Imagem temporária removida:', caminhoImagem);
                    });
                }
            }
        }

        client.addEventHandler(async (event) => {
            const message = event.message.message;
            const senderId = event.message.senderId?.value;
            const idGroup = event.message.peerId?.channelId?.value;

            const IDS = ['', '', '', ''];

            for (const id of IDS) {
                if (id == senderId || id == idGroup) {
                    if (!message) return;

                    try {
                        if (event.message.media) {
                            const buffer = await client.downloadMedia(event.message.media);
                            await processarPromocao(message, buffer);
                        } else {
                            await processarPromocao(message);
                        }
                    } catch (err) {
                        console.error('❌ Erro ao processar promoção:', err.message);
                    }
                    break;
                }
            }
        }, new NewMessage({}));

        console.log("🤖 Bot Telegram está rodando...");
    } catch (err) {
        console.error("❌ Erro de conexão:", err.message);
        console.log("⏳ Tentando reconectar em 5 segundos...");
        setTimeout(iniciarBotTelegram, 5000); // reconectar após erro
    }
}

iniciarBotTelegram();

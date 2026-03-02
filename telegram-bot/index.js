import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import express from "express";

const { BOT_TOKEN, CHAT_ID, SECRET_KEY, PORT = 3001 } = process.env;

if (!BOT_TOKEN) {
  console.error("Ошибка: BOT_TOKEN не задан в .env файле");
  process.exit(1);
}

// === TELEGRAM BOT ===
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// /start — сообщает пользователю его CHAT_ID
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `✅ Бот SK Rosa запущен!\n\nВаш <b>CHAT_ID</b>: <code>${chatId}</code>\n\nСкопируйте это число и вставьте в файл <code>telegram-bot/.env</code>:\n<code>CHAT_ID=${chatId}</code>\n\nПосле этого перезапустите бот: <code>npm start</code>`,
    { parse_mode: "HTML" }
  );
});

// /chatid — повторно показывает CHAT_ID
bot.onText(/\/chatid/, msg => {
  bot.sendMessage(msg.chat.id, `Ваш CHAT_ID: <code>${msg.chat.id}</code>`, {
    parse_mode: "HTML",
  });
});

bot.on("polling_error", err => {
  console.error("Ошибка Telegram polling:", err.message);
});

// === HTTP SERVER для приёма лидов от PHP ===
const app = express();
app.use(express.json());

app.post("/lead", async (req, res) => {
  // Проверяем секретный ключ из заголовка
  if (req.headers["x-secret-key"] !== SECRET_KEY) {
    console.warn("Отклонён запрос с неверным SECRET_KEY");
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!CHAT_ID) {
    console.error("CHAT_ID не задан в .env — напишите /start боту чтобы получить его");
    return res.status(500).json({ error: "CHAT_ID not configured" });
  }

  const { name, phone, comment, source } = req.body;

  const lines = [
    "🔔 <b>Новая заявка с сайта!</b>",
    "",
    `👤 Имя: <b>${name || "—"}</b>`,
    `📞 Телефон: <b>${phone || "—"}</b>`,
  ];

  if (comment) {
    lines.push(`💬 Комментарий: ${comment}`);
  }

  if (source) {
    lines.push(`📍 Источник: ${source}`);
  }

  const message = lines.join("\n");

  try {
    await bot.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
    console.log(`Лид отправлен в Telegram (chat: ${CHAT_ID})`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Ошибка отправки в Telegram:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Проверка жизнеспособности
app.get("/health", (_req, res) => {
  res.json({ status: "ok", chatIdSet: Boolean(CHAT_ID) });
});

app.listen(PORT, () => {
  console.log(`SK Rosa Bot запущен на порту ${PORT}`);
  if (!CHAT_ID) {
    console.warn("⚠️  CHAT_ID не задан! Напишите /start боту @rosa_lead_bot чтобы получить его.");
  }
});

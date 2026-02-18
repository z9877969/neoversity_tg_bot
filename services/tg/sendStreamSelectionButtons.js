const { streamsDict } = require("../../constants");
const bot = require("./tgApi");

/**
 * Надсилає кнопки для вибору номеру потоку відповідно до напрямку
 * @param {number} chatId ID чату
 * @param {string} direction Напрямок навчання
 */
async function sendStreamSelectionButtons(chatId, direction) {
  const streams = streamsDict[direction] || [];

  if (streams.length > 0) {
    await bot.sendMessage(chatId, '👉 Оберіть ваш потік:', {
      reply_markup: { inline_keyboard: streams },
    });
  } else {
    await bot.sendMessage(chatId, 'Для вашого напрямку потоки не знайдено.');
  }
}

module.exports = sendStreamSelectionButtons;

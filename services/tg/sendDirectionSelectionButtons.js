const { directionsBtns } = require('../../constants');
const bot = require('./tgApi');

/**
 * Надсилає кнопки для вибору напрямку навчання
 * @param {number} chatId ID чату
 */

async function sendDirectionSelectionButtons(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: directionsBtns,
    },
  };
  await bot.sendMessage(chatId, '👉 Оберіть ваш напрямок:', options);
}

module.exports = sendDirectionSelectionButtons;

const bot = require("./tgApi");

/**
 * Надсилає головне меню користувачу
 * @param {number} chatId ID чату
 * @param {boolean} isAfterRegistration Чи це перший показ меню після реєстрації
 */
async function sendMainMenu(chatId, isAfterRegistration = false) {
  const text = isAfterRegistration
    ? 'Дякую! Реєстрація завершена ✅️'
    : 'Чим можу допомогти?';
  const options = {
    reply_markup: {
      keyboard: [
        ['👤 Мій профіль', '❔ Часті питання'],
        ['📋 Додаткові послуги', '💬 Контакти менеджера'],
        // ['📢 Останні новини', '📅 Мій графік'], // тимчасово неактуальні
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
  await bot.sendMessage(chatId, text, options);
}

module.exports = sendMainMenu;
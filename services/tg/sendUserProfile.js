const bot = require('./tgApi');
const { dbApi } = require('../index');
const { getUserInfo } = require('../../utils');

/**
 * Надсилає інформацію профілю користувача з кнопками для редагування
 * @param {number} chatId ID чату
 */


async function sendUserProfile(chatId) {
  const user = await dbApi.getUserData(chatId);

  if (user) {
    const profileMessage =
      `<b>👤 Ваш профіль</b>\n` +
      `<b>Ім'я:</b> ${user.full_name || 'не вказано'}\n` +
      `<b>Email:</b> ${user.email || 'не вказано'}\n` +
      `<b>Напрямок:</b> ${getUserInfo.directionName(user.direction) || 'не вказано'}\n` +
      `<b>Потік:</b> ${getUserInfo.streamName(user.stream) || 'не вказано'}\n`;

    const options = {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          ["Редагувати ім'я", 'Редагувати email'],
          ['Редагувати напрямок', 'Редагувати потік'],
          ['⬅️ Назад'],
        ],
        resize_keyboard: true,
      },
    };
    await bot.sendMessage(chatId, profileMessage, options);
  }
}

module.exports = sendUserProfile;

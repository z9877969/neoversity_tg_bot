const { dbApi } = require('../index');
const bot = require('./tgApi');

/**
 * Надсилає список поширених питань
 * @param {number} chatId ID чату
 */
async function sendFAQList(chatId) {
  const faqs = await dbApi.getFAQsList();
  if (faqs) {
    const keyboard = faqs.map((faq) => [
      { text: faq.question, callback_data: `faq_${faq.id}` },
    ]);
    await bot.sendMessage(chatId, '👉 Оберіть питання:', {
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    await bot.sendMessage(chatId, 'Поки що немає жодних частих питань.');
  }
}

module.exports = sendFAQList;

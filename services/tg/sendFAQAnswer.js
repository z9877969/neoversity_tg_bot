const { convertToTelegramHtml } = require('../../utils');
const { dbApi } = require('../index');
const bot = require('./tgApi');

/**
 * Надсилає відповідь на обране питання
 * @param {number} chatId ID чату
 * @param {number} faqId ID питання
 */
async function sendFAQAnswer(chatId, faqId) {
  const faq = await dbApi.getFAQById(faqId);
  if (faq) {
    await bot.sendMessage(
      chatId,
      `❓ <b>${faq.question}</b>\n\n${convertToTelegramHtml(faq.answer)}`,
      { parse_mode: 'HTML' },
    );
  }
}

module.exports = sendFAQAnswer;

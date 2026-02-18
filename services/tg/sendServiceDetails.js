const bot = require('./tgApi');
const { dbApi } = require('../index');
const { convertToTelegramHtml } = require('../../utils');

async function sendServiceDetails(chatId, serviceId) {
  const service = await dbApi.getServiceDetailsById(serviceId);
  if (service) {
    const options = {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Перейти до послуги', url: service.services_link }],
        ],
      },
    };
    await bot.sendMessage(
      chatId,
      `🔹 <b>${service.services_name}</b>\n\n${convertToTelegramHtml(service.services_description)}`,
      options,
    );
  }
}

module.exports = sendServiceDetails;

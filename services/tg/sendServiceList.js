const { dbApi } = require('..');
const bot = require('./tgApi');

async function sendServiceList(chatId) {
  const stream = await dbApi.getUserStream(chatId);
  if (!stream) {
    return await bot.sendMessage(
      chatId,
      'Ваш потік не визначено. Перевірте профіль.',
    );
  }

  const services = await dbApi.getAllowedServiceList(stream);
  if (services) {
    const keyboard = services.map((s) => [
      { text: s.services_name, callback_data: `service_${s.id}` },
    ]);
    await bot.sendMessage(chatId, '👉 Оберіть послугу:', {
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    await bot.sendMessage(chatId, 'Поки що немає послуг для вашого потоку.');
  }
}

module.exports = sendServiceList;

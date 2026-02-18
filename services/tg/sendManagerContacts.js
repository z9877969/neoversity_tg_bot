const dbApi = require('../dbApi');
const bot = require('./tgApi');

async function sendManagerContacts(chatId) {
  const stream = await dbApi.getUserStream(chatId);
  if (!stream) {
    return await bot.sendMessage(
      chatId,
      'Ваш потік не визначено. Перевірте профіль.',
    );
  }

  const contacts = await dbApi.getManagerContactsByStream(stream);
  if (contacts) {
    let contactsMessage = '<b>Контакти менеджерів:</b>\n\n';
    contacts.forEach((c) => {
      contactsMessage += `👤 ${c.manager_name}\n✉️ Email: ${c.manager_email}\n📞 Телеграм: ${c.manager_phone}\n\n`;
    });
    await bot.sendMessage(chatId, contactsMessage.trim(), {
      parse_mode: 'HTML',
    });
  } else {
    await bot.sendMessage(
      chatId,
      'Поки що немає контактів менеджера для вашого потоку.',
    );
  }
}

module.exports = sendManagerContacts;

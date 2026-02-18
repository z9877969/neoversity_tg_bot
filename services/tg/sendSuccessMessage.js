const bot = require('./tgApi');

const email = (chatId) => {
  return bot.sendMessage(chatId, 'Email збережено ✅');
};

const name = (chatId) => {
  return bot.sendMessage(chatId, "Ім'я збережено ✅");
};

const direction = (chatId) => {
  return bot.sendMessage(chatId, 'Напрямок збережено ✅');
};

const stream = (chatId) => {
  return bot.sendMessage(chatId, 'Потік збережено ✅');
};

module.exports = {
  email,
  name,
  direction,
  stream,
};

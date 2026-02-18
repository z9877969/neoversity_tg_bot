const { directions } = require('../../constants');
const bot = require('./tgApi');

const email = (chatId) => {
  return bot.sendMessage(chatId, 'Email збережено ✅');
};

const name = (chatId) => {
  return bot.sendMessage(chatId, "Ім'я збережено ✅");
};

const direction = (chatId, direction) => {
  const message =
    'Напрямок збережено ✅\n\n' +
    'Обраний вами напрямок: ' +
    `<b>${directions[direction].name}</b>`;
  return bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
  });
};

const stream = (chatId, stream) => {
  const streamNumber = stream.split('_').reverse()[0];
  const streamName = stream.split('_' + streamNumber)[0];
  const message =
    'Потік збережено ✅\n\n' +
    'Обраний вами потік: ' +
    `<b>${directions[streamName].shortcut} ${streamNumber}</b>`;
  return bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};

module.exports = {
  email,
  name,
  direction,
  stream,
};

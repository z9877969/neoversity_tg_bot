const dbApi = require('../dbApi');
const bot = require('./tgApi');
const sendDirectionSelectionButtons = require('./sendDirectionSelectionButtons');
const sendStreamSelectionButtons = require('./sendStreamSelectionButtons');
const { types } = require('../../constants');
const { createUnregisterUserMessage } = require('../../utils');

const callbackMessageSenderMap = {
  [types.dbUserDataFields.DIRECTION]: sendDirectionSelectionButtons,
  [types.dbUserDataFields.STREAM]: sendStreamSelectionButtons,
};

/**
 * Перевіряє стан реєстрації користувача та надсилає відповідне повідомлення, якщо реєстрація не завершена.
 * @param {number} chatId ID чату
 */

const sendWrongRegistrationActionsMessage = async (chatId) => {
  const unregisterFieldData = await dbApi.getUserUnregisterFieldData(chatId);
  if (unregisterFieldData === null) return null;
  const { stage, field } = unregisterFieldData;
  if (stage !== types.registartionStages[field].value) {
    const messageText = createUnregisterUserMessage(field);
    await bot.sendMessage(
      chatId,
      'Будь ласка, завершіть реєстрацію перед вибором опцій.\n' +
        (field in types.messageTypes ? messageText : ''),
    );
    if (field in callbackMessageSenderMap) {
      await callbackMessageSenderMap[field](chatId);
    }
  } else if (field in types.callbackTypes) {
    await bot.sendMessage(
      chatId,
      'Будь ласка, завершіть реєстрацію перед вибором опцій.\n' +
        (field in types.messageTypes ? messageText : ''),
    );
    const { direction } = await dbApi.getUserData(chatId);
    const args = direction ? [chatId, direction] : [chatId];
    await callbackMessageSenderMap[field](...args);
  }
};

module.exports = sendWrongRegistrationActionsMessage;

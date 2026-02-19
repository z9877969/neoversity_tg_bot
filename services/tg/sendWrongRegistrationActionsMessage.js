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
 * @returns {string} 'completed' | 'not_completed' | null - Чи користувач заповненив всі поля і реєстрація є завершеною
 */

const sendWrongRegistrationActionsMessage = async (chatId) => {
  const unregisterFieldData = await dbApi.getUserUnregisterFieldData(chatId);

  if (unregisterFieldData === null) {
    return types.registrationResults.NOT_REGISTERED;
  }

  if (unregisterFieldData?.stage === types.registrationResults.COMPLETED) {
    return types.registrationResults.COMPLETED;
  }

  if (
    unregisterFieldData?.stage !==
    types.registartionStages[unregisterFieldData.field].value
  ) {
    const messageText = createUnregisterUserMessage(unregisterFieldData);
    await bot.sendMessage(
      chatId,
      'Будь ласка, завершіть реєстрацію перед вибором опцій.\n' +
        (unregisterFieldData.field in types.messageTypes ? messageText : ''),
    );
    if (unregisterFieldData.field in callbackMessageSenderMap) {
      await callbackMessageSenderMap[unregisterFieldData.field](chatId);
    }
  } else if (unregisterFieldData?.field in types.callbackTypes) {
    await bot.sendMessage(
      chatId,
      'Будь ласка, завершіть реєстрацію перед вибором опцій.\n' +
        (unregisterFieldData.field in types.messageTypes ? messageText : ''),
    );
    const { direction } = await dbApi.getUserData(chatId);
    const args = direction ? [chatId, direction] : [chatId];
    await callbackMessageSenderMap[unregisterFieldData.field](...args);
  }
  return unregisterFieldData?.stage === types.registrationResults.COMPLETED
    ? types.registrationResults.COMPLETED
    : types.registrationResults.NOT_COMPLETED;
};

module.exports = sendWrongRegistrationActionsMessage;

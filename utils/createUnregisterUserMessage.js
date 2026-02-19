const types = require('../constants/types');

const startMessagePart = {
  callback_query: 'Оберіть ',
  message: 'Введіть ',
};
const endMessagePart = {
  callback_query: {
    [types.dbUserDataFields.DIRECTION]: 'напрямок',
    [types.dbUserDataFields.STREAM]: 'потік',
  },
  message: {
    [types.dbUserDataFields.EMAIL]: 'email',
    [types.dbUserDataFields.FULL_NAME]: "ім'я",
  },
};

/**
 * Створює повідомлення для користувача про незавершену реєстрацію, вказуючи, яке поле потрібно заповнити.
 * @param {Object} unregisterField - Незаповнене поле користувача
 * @returns {string} Повідомлення для користувача
 */

const createUnregisterUserMessage = (unregisterField) => {
  return unregisterField in endMessagePart.callback_query
    ? `${startMessagePart.callback_query}${endMessagePart.callback_query[unregisterField]}.`
    : `${startMessagePart.message}${endMessagePart.message[unregisterField]}.`;
};

module.exports = createUnregisterUserMessage;

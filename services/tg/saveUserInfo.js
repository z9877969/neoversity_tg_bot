const dbApi = require('../dbApi');
const sendSuccessMessage = require('./sendSuccessMessage');

async function fullName(chatId, fullName, isEdit = false) {
  const sql =
    "INSERT INTO users (telegram_id, full_name, registration_stage) \
    VALUES (?, ?, 'waiting_for_email') \
    ON DUPLICATE KEY UPDATE full_name = ?";
  await dbApi.db.execute(sql, [chatId, fullName, fullName]);
  if (isEdit) {
    await sendSuccessMessage.name(chatId);
  }
}

async function email(chatId, email, isEdit = false) {
  await dbApi.setUserEmail(chatId, email);
  if (isEdit) {
    await sendSuccessMessage.email(chatId);
  }
}

async function direction(chatId, direction) {
  await dbApi.setUserDirection(chatId, direction);
}

async function stream(chatId, stream) {
  await dbApi.setUserStream(chatId, stream);
  await sendSuccessMessage.stream(chatId);
}

module.exports = {
  fullName,
  email,
  direction,
  stream,
};

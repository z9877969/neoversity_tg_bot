const mysql = require('mysql2/promise');
const { env } = require('../constants');

const dbConfig = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// --- ІНІЦІАЛІЗАЦІЯ ---

const db = mysql.createPool({ ...dbConfig, port: env.DB_PORT || 3306 });

async function setRegistrationStage(chatId, stage) {
  await db.execute(
    'UPDATE users SET registration_stage = ? WHERE telegram_id = ?',
    [stage, chatId],
  );
}

async function getRegistrationStage(chatId) {
  const [rows] = await db.execute(
    'SELECT registration_stage FROM users WHERE telegram_id = ?',
    [chatId],
  );
  return rows.length > 0 ? rows[0].registration_stage : 'not_registered';
}

async function setEditStage(chatId, stage) {
  await db.execute('UPDATE users SET edit_stage = ? WHERE telegram_id = ?', [
    stage,
    chatId,
  ]);
}

async function getEditStage(chatId) {
  const [rows] = await db.execute(
    'SELECT edit_stage FROM users WHERE telegram_id = ?',
    [chatId],
  );
  return rows.length > 0 ? rows[0].edit_stage : 'null';
}

async function getUserDirection(chatId) {
  const [rows] = await db.execute(
    'SELECT direction FROM users WHERE telegram_id = ?',
    [chatId],
  );
  return rows.length > 0 ? rows[0].direction : null;
}

async function getUserStream(chatId) {
  const [rows] = await db.execute(
    'SELECT stream FROM users WHERE telegram_id = ?',
    [chatId],
  );
  return rows.length > 0 ? rows[0].stream : null;
}

async function getUserData(chatId) {
  const [rows] = await db.execute(
    'SELECT full_name, email, direction, stream FROM users WHERE telegram_id = ?',
    [chatId],
  );
  return rows.length > 0 ? rows[0] : null;
}

async function getFAQsList() {
  const [faqs] = await db.execute('SELECT id, question FROM faq');
  return faqs.length > 0 ? faqs : null;
}

async function getFAQById(faqId) {
  const [rows] = await db.execute(
    'SELECT question, answer FROM faq WHERE id = ?',
    [faqId],
  );
  return rows.length > 0 ? rows[0] : null;
}

async function getAllowedServiceList(stream) {
  const [services] = await db.execute(
    'SELECT id, services_name FROM services WHERE FIND_IN_SET(?, services_streams)',
    [stream],
  );
  return services.length > 0 ? services : null;
}

async function getServiceDetailsById(serviceId) {
  const [rows] = await db.execute(
    'SELECT services_name, services_description, services_link FROM services WHERE id = ?',
    [serviceId],
  );
  return rows.length > 0 ? rows[0] : null;
}

// =========================
// --- ЕКСПОРТ ФУНКЦІЙ ---
async function setUserFullName(chatId, fullName) {
  await db.execute('UPDATE users SET full_name = ? WHERE telegram_id = ?', [
    fullName,
    chatId,
  ]);
}

async function setUserEmail(chatId, email) {
  await db.execute('UPDATE users SET email = ? WHERE telegram_id = ?', [
    email,
    chatId,
  ]);
}

async function setUserDirection(chatId, direction) {
  await db.execute('UPDATE users SET direction = ? WHERE telegram_id = ?', [
    direction,
    chatId,
  ]);
}

async function setUserStream(chatId, stream) {
  await db.execute('UPDATE users SET stream = ? WHERE telegram_id = ?', [
    stream,
    chatId,
  ]);
}
// ========================

const getManagerContactsByStream = async (stream) => {
  const [rows] = await db.execute(
    'SELECT manager_name, manager_email, manager_phone FROM manager_contacts WHERE FIND_IN_SET(?, managers_streams)',
    [stream],
  );
  return rows.length > 0 ? rows : null;
};

module.exports = {
  db,
  setRegistrationStage,
  getRegistrationStage,
  setEditStage,
  getEditStage,
  getUserDirection,
  getUserStream,
  getUserData,
  getFAQsList,
  getFAQById,
  getAllowedServiceList,
  getServiceDetailsById,
  setUserFullName,
  setUserEmail,
  setUserDirection,
  setUserStream,
  getManagerContactsByStream,
};

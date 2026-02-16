// Імпортуємо необхідні бібліотеки
const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
const { env } = require('./envConfig');
const { streamsDict, dirrectionsBtns } = require('./constants');

// --- КОНФІГУРАЦІЯ ---

// Токен вашого Telegram бота
const API_TOKEN = env.TG_API_TOKEN;

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
const bot = new TelegramBot(API_TOKEN, { polling: true });

console.log('Бот успішно запущений...');

// --- ОБРОБКА КОМАНД І ПОВІДОМЛЕНЬ ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  try {
    const registrationStage = await getRegistrationStage(chatId);
    const editStage = await getEditStage(chatId);

    if (text === '/start') {
      if (registrationStage === 'completed') {
        await sendMainMenu(chatId);
      } else {
        await setRegistrationStage(chatId, 'waiting_for_name');
        await bot.sendMessage(
          chatId,
          '👉 Введіть ваше прізвище та імʼя. Наприклад: Бубоненко Анатолій',
        );
      }
    } else if (text === '👤 Мій профіль' && registrationStage === 'completed') {
      await sendUserProfile(chatId);
    } else if (
      text === '❔ Часті питання' &&
      registrationStage === 'completed'
    ) {
      await sendFAQList(chatId);
    } else if (
      text === '💬 Контакти менеджера' &&
      registrationStage === 'completed'
    ) {
      await sendManagerContacts(chatId);
    } else if (
      text === '📋 Додаткові послуги' &&
      registrationStage === 'completed'
    ) {
      await sendServiceList(chatId);
    } else if (
      text === '📢 Останні новини' &&
      registrationStage === 'completed'
    ) {
      await sendNewsList(chatId);
    } else if (text === '📅 Мій графік' && registrationStage === 'completed') {
      await sendScheduleDetails(chatId);
    } else if (text === '⬅️ Назад' && registrationStage === 'completed') {
      await setEditStage(chatId, 'null');
      await sendMainMenu(chatId);
    }
    // Логіка реєстрації
    else if (
      registrationStage === 'waiting_for_name' &&
      /^[\p{L} '-]+$/u.test(text)
    ) {
      await saveUserFullName(chatId, text);
      await setRegistrationStage(chatId, 'waiting_for_email');
      await bot.sendMessage(chatId, 'Тепер надішліть вашу електронну пошту');
    } else if (registrationStage === 'waiting_for_email') {
      if (/\S+@\S+\.\S+/.test(text)) {
        // Проста валідація email
        await saveUserEmail(chatId, text);
        await setRegistrationStage(chatId, 'waiting_for_direction');
        await sendDirectionSelectionButtons(chatId);
      } else {
        await bot.sendMessage(
          chatId,
          '❌ Eлектронна пошта введена неправильно',
        );
      }
    }
    // Логіка редагування профілю
    else if (text === "Редагувати ім'я") {
      await setEditStage(chatId, 'edit_full_name');
      await bot.sendMessage(chatId, "Введіть нове ім'я:");
    } else if (editStage === 'edit_full_name') {
      await saveUserFullName(chatId, text, true); // true - означає редагування
      await setEditStage(chatId, 'null');
    } else if (text === 'Редагувати email') {
      await setEditStage(chatId, 'edit_email');
      await bot.sendMessage(chatId, 'Введіть новий email:');
    } else if (editStage === 'edit_email') {
      await saveUserEmail(chatId, text, true); // true - означає редагування
      await setEditStage(chatId, 'null');
    } else if (text === 'Редагувати напрямок') {
      await setEditStage(chatId, 'null');
      await sendDirectionSelectionButtons(chatId);
    } else if (text === 'Редагувати потік') {
      const direction = await getUserDirection(chatId);
      await setEditStage(chatId, 'null');
      await sendStreamSelectionButtons(chatId, direction);
    }
    // Якщо команду не розпізнано
    else {
      if (registrationStage === 'completed') {
        await bot.sendMessage(
          chatId,
          'Я не розумію цю команду. Спробуйте ще раз, використовуючи меню.',
        );
      }
    }
  } catch (error) {
    console.error(`Помилка обробки повідомлення для chatId ${chatId}:`, error);
    await bot.sendMessage(
      chatId,
      'Виникла внутрішня помилка. Спробуйте пізніше.',
    );
  }
});

// --- ОБРОБКА НАТИСКАНЬ НА INLINE-КНОПКИ ---

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  try {
    // Видаляємо клавіатуру після натискання
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId },
    );
    const registrationStage = await getRegistrationStage(chatId);

    if (data.startsWith('direction_')) {
      const direction = data.replace('direction_', '');
      await saveUserDirection(chatId, direction);
      await setRegistrationStage(chatId, 'waiting_for_stream');
      await sendStreamSelectionButtons(chatId, direction);
    } else if (data.startsWith('stream_')) {
      const stream = data.replace('stream_', '');
      await saveUserStream(chatId, stream);
      if (registrationStage !== 'completed') {
        await setRegistrationStage(chatId, 'completed');
        await sendMainMenu(chatId, true); // true - показати вітальне повідомлення
      } else {
        await sendMainMenu(chatId);
      }
    } else if (data.startsWith('faq_')) {
      const faqId = data.replace('faq_', '');
      await sendFAQAnswer(chatId, faqId);
    } else if (data.startsWith('service_')) {
      const serviceId = data.replace('service_', '');
      await sendServiceDetails(chatId, serviceId);
    } else if (data.startsWith('news_')) {
      const newsId = data.replace('news_', '');
      await sendNewsDetails(chatId, newsId);
    }
  } catch (error) {
    console.error(
      `Помилка обробки callback_query для chatId ${chatId}:`,
      error,
    );
    await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте ще раз.');
  }
});

// --- ОСНОВНІ ФУНКЦІЇ ---

/**
 * Надсилає головне меню користувачу
 * @param {number} chatId ID чату
 * @param {boolean} isAfterRegistration Чи це перший показ меню після реєстрації
 */
async function sendMainMenu(chatId, isAfterRegistration = false) {
  const text = isAfterRegistration
    ? 'Дякую! Реєстрація завершена ✅️'
    : 'Чим можу допомогти?';
  const options = {
    reply_markup: {
      keyboard: [
        ['👤 Мій профіль', '❔ Часті питання'],
        ['📋 Додаткові послуги', '💬 Контакти менеджера'],
        ['📢 Останні новини', '📅 Мій графік'],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
  await bot.sendMessage(chatId, text, options);
}

/**
 * Надсилає інформацію профілю користувача з кнопками для редагування
 * @param {number} chatId ID чату
 */
async function sendUserProfile(chatId) {
  const [rows] = await db.execute(
    'SELECT full_name, email, direction, stream FROM users WHERE telegram_id = ?',
    [chatId],
  );
  if (rows.length > 0) {
    const user = rows[0];
    const profileMessage =
      `<b>👤 Ваш профіль</b>\n` +
      `<b>Ім'я:</b> ${user.full_name || 'не вказано'}\n` +
      `<b>Email:</b> ${user.email || 'не вказано'}\n` +
      `<b>Напрямок:</b> ${user.direction || 'не вказано'}\n` +
      `<b>Потік:</b> ${user.stream || 'не вказано'}\n`;

    const options = {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          ["Редагувати ім'я", 'Редагувати email'],
          ['Редагувати напрямок', 'Редагувати потік'],
          ['⬅️ Назад'],
        ],
        resize_keyboard: true,
      },
    };
    await bot.sendMessage(chatId, profileMessage, options);
  }
}

/**
 * Надсилає кнопки для вибору напрямку навчання
 * @param {number} chatId ID чату
 */

async function sendDirectionSelectionButtons(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: dirrectionsBtns,
    },
  };
  await bot.sendMessage(chatId, '👉 Оберіть ваш напрямок:', options);
}

/**
 * Надсилає кнопки для вибору потоку відповідно до напрямку
 * @param {number} chatId ID чату
 * @param {string} direction Напрямок навчання
 */
async function sendStreamSelectionButtons(chatId, direction) {
  const streams = streamsDict[direction] || [];

  if (streams.length > 0) {
    await bot.sendMessage(chatId, '👉 Оберіть ваш потік:', {
      reply_markup: { inline_keyboard: streams },
    });
  } else {
    await bot.sendMessage(chatId, 'Для вашого напрямку потоки не знайдено.');
  }
}

/**
 * Надсилає список поширених питань
 * @param {number} chatId ID чату
 */
async function sendFAQList(chatId) {
  const [faqs] = await db.execute('SELECT id, question FROM faq');
  if (faqs.length > 0) {
    const keyboard = faqs.map((faq) => [
      { text: faq.question, callback_data: `faq_${faq.id}` },
    ]);
    await bot.sendMessage(chatId, '👉 Оберіть питання:', {
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    await bot.sendMessage(chatId, 'Поки що немає жодних частих питань.');
  }
}

/**
 * Надсилає відповідь на обране питання
 * @param {number} chatId ID чату
 * @param {number} faqId ID питання
 */
async function sendFAQAnswer(chatId, faqId) {
  const [rows] = await db.execute(
    'SELECT question, answer FROM faq WHERE id = ?',
    [faqId],
  );
  if (rows.length > 0) {
    const faq = rows[0];
    await bot.sendMessage(
      chatId,
      `❓ <b>${faq.question}</b>\n\n${faq.answer}`,
      { parse_mode: 'HTML' },
    );
  }
}

// ... Інші функції (новини, послуги, контакти, графік) ...
async function sendNewsList(chatId) {
  const stream = await getUserStream(chatId);
  if (!stream) {
    return await bot.sendMessage(
      chatId,
      'Ваш потік не визначено. Перевірте профіль.',
    );
  }

  const [news] = await db.execute(
    'SELECT id, news_title FROM news WHERE FIND_IN_SET(?, news_streams)',
    [stream],
  );
  if (news.length > 0) {
    const keyboard = news.map((n) => [
      { text: n.news_title, callback_data: `news_${n.id}` },
    ]);
    await bot.sendMessage(chatId, '👉 Оберіть новину:', {
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    await bot.sendMessage(chatId, 'Поки що немає новин для вашого потоку.');
  }
}

async function sendNewsDetails(chatId, newsId) {
  const [rows] = await db.execute(
    'SELECT news_title, news_description FROM news WHERE id = ?',
    [newsId],
  );
  if (rows.length > 0) {
    const news = rows[0];
    await bot.sendMessage(
      chatId,
      `📰 <b>${news.news_title}</b>\n\n${news.news_description}`,
      { parse_mode: 'HTML' },
    );
  }
}

async function sendServiceList(chatId) {
  const stream = await getUserStream(chatId);
  if (!stream) {
    return await bot.sendMessage(
      chatId,
      'Ваш потік не визначено. Перевірте профіль.',
    );
  }

  const [services] = await db.execute(
    'SELECT id, services_name FROM services WHERE FIND_IN_SET(?, services_streams)',
    [stream],
  );
  if (services.length > 0) {
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

async function sendServiceDetails(chatId, serviceId) {
  const [rows] = await db.execute(
    'SELECT services_name, services_description, services_link FROM services WHERE id = ?',
    [serviceId],
  );
  if (rows.length > 0) {
    const service = rows[0];
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
      `🔹 <b>${service.services_name}</b>\n\n${service.services_description}`,
      options,
    );
  }
}

async function sendManagerContacts(chatId) {
  const stream = await getUserStream(chatId);
  if (!stream) {
    return await bot.sendMessage(
      chatId,
      'Ваш потік не визначено. Перевірте профіль.',
    );
  }

  const [contacts] = await db.execute(
    'SELECT manager_name, manager_email, manager_phone FROM manager_contacts WHERE FIND_IN_SET(?, managers_streams)',
    [stream],
  );
  if (contacts.length > 0) {
    let contactsMessage = '<b>Контакти менеджерів:</b>\n\n';
    contacts.forEach((c) => {
      contactsMessage += `👤 ${c.manager_name}\n✉️ Email: ${c.manager_email}\n📞 Телефон: ${c.manager_phone}\n\n`;
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

async function sendScheduleDetails(chatId) {
  const stream = await getUserStream(chatId);
  if (!stream) {
    return await bot.sendMessage(
      chatId,
      'Ваш потік не визначено. Перевірте профіль.',
    );
  }

  const [schedules] = await db.execute(
    'SELECT schedule_title, schedule_description, schedule_link FROM schedule WHERE FIND_IN_SET(?, schedule_streams)',
    [stream],
  );

  if (schedules.length > 0) {
    for (const schedule of schedules) {
      const message = `<b>${schedule.schedule_title}</b>\n\n${schedule.schedule_description}`;
      const options = {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Переглянути графік', url: schedule.schedule_link }],
          ],
        },
      };
      await bot.sendMessage(chatId, message, options);
    }
  } else {
    await bot.sendMessage(chatId, 'Наразі немає розкладу для вашого потоку.');
  }
}

// --- ФУНКЦІЇ ДЛЯ РОБОТИ З БД ---

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

// Універсальні функції збереження. INSERT ... ON DUPLICATE KEY UPDATE більш ефективний.
async function saveUserFullName(chatId, fullName, isEdit = false) {
  const sql =
    "INSERT INTO users (telegram_id, full_name, registration_stage) \
    VALUES (?, ?, 'waiting_for_email') \
    ON DUPLICATE KEY UPDATE full_name = ?";
  await db.execute(sql, [chatId, fullName, fullName]);
  if (isEdit) {
    await bot.sendMessage(chatId, "Ім'я збережено ✅");
  }
}

async function saveUserEmail(chatId, email, isEdit = false) {
  await db.execute('UPDATE users SET email = ? WHERE telegram_id = ?', [
    email,
    chatId,
  ]);
  if (isEdit) {
    await bot.sendMessage(chatId, 'Email збережено ✅');
  }
}

async function saveUserDirection(chatId, direction) {
  await db.execute('UPDATE users SET direction = ? WHERE telegram_id = ?', [
    direction,
    chatId,
  ]);
}

async function saveUserStream(chatId, stream) {
  await db.execute('UPDATE users SET stream = ? WHERE telegram_id = ?', [
    stream,
    chatId,
  ]);
  await bot.sendMessage(chatId, 'Потік збережено ✅');
}

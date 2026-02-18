// Імпортуємо необхідні бібліотеки

const { directionsBtns } = require('./constants');
const { dbApi, tgApi } = require('./services');

const { bot } = tgApi;

console.log('Бот успішно запущений...');

// --- ОБРОБКА КОМАНД І ПОВІДОМЛЕНЬ ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  try {
    const registrationStage = await dbApi.getRegistrationStage(chatId);
    const editStage = await dbApi.getEditStage(chatId);

    if (text === '/start') {
      if (registrationStage === 'completed') {
        await tgApi.sendMainMenu(chatId);
      } else {
        await dbApi.setRegistrationStage(chatId, 'waiting_for_name');
        await bot.sendMessage(
          chatId,
          '👉 Введіть ваше прізвище та імʼя. Наприклад: Бубоненко Анатолій',
        );
      }
    } else if (text === '👤 Мій профіль' && registrationStage === 'completed') {
      await tgApi.sendUserProfile(chatId);
    } else if (
      text === '❔ Часті питання' &&
      registrationStage === 'completed'
    ) {
      await tgApi.sendFAQList(chatId);
    } else if (
      text === '💬 Контакти менеджера' &&
      registrationStage === 'completed'
    ) {
      await tgApi.sendManagerContacts(chatId);
    } else if (
      text === '📋 Додаткові послуги' &&
      registrationStage === 'completed'
    ) {
      await tgApi.sendServiceList(chatId);
    } else if (text === '📅 Мій графік' && registrationStage === 'completed') {
      await tgApi.sendScheduleDetails(chatId);
    } else if (text === '⬅️ Назад' && registrationStage === 'completed') {
      await dbApi.setEditStage(chatId, 'null');
      await tgApi.sendMainMenu(chatId);
    }
    // Логіка реєстрації
    else if (
      registrationStage === 'waiting_for_name' &&
      /^[\p{L} '-]+$/u.test(text)
    ) {
      await tgApi.saveUserInfo.fullName(chatId, text);
      await dbApi.setRegistrationStage(chatId, 'waiting_for_email');
      await bot.sendMessage(chatId, 'Тепер надішліть вашу електронну пошту');
    } else if (registrationStage === 'waiting_for_email') {
      if (/\S+@\S+\.\S+/.test(text)) {
        // Проста валідація email
        await tgApi.saveUserInfo.email(chatId, text);
        await dbApi.setRegistrationStage(chatId, 'waiting_for_direction');
        await tgApi.sendDirectionSelectionButtons(chatId);
      } else {
        await bot.sendMessage(
          chatId,
          '❌ Eлектронна пошта введена неправильно',
        );
      }
    }
    // Логіка редагування профілю
    else if (text === "Редагувати ім'я") {
      await dbApi.setEditStage(chatId, 'edit_full_name');
      await bot.sendMessage(chatId, "Введіть нове ім'я:");
    } else if (editStage === 'edit_full_name') {
      await tgApi.saveUserInfo.fullName(chatId, text, true); // true - означає редагування
      await dbApi.setEditStage(chatId, 'null');
    } else if (text === 'Редагувати email') {
      await dbApi.setEditStage(chatId, 'edit_email');
      await bot.sendMessage(chatId, 'Введіть новий email:');
    } else if (editStage === 'edit_email') {
      await tgApi.saveUserInfo.email(chatId, text, true); // true - означає редагування
      await dbApi.setEditStage(chatId, 'null');
    } else if (text === 'Редагувати напрямок') {
      await dbApi.setEditStage(chatId, 'null');
      await tgApi.sendDirectionSelectionButtons(chatId);
    } else if (text === 'Редагувати потік') {
      const direction = await dbApi.getUserDirection(chatId);
      await dbApi.setEditStage(chatId, 'null');
      await tgApi.sendStreamSelectionButtons(chatId, direction);
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
    const registrationStage = await dbApi.getRegistrationStage(chatId);

    if (data.startsWith('direction_')) {
      const direction = data.replace('direction_', '');
      await tgApi.saveUserInfo.direction(chatId, direction);
      await dbApi.setRegistrationStage(chatId, 'waiting_for_stream');
      await tgApi.sendStreamSelectionButtons(chatId, direction);
    } else if (data.startsWith('stream_')) {
      const stream = data.replace('stream_', '');
      await tgApi.saveUserInfo.stream(chatId, stream);
      if (registrationStage !== 'completed') {
        await dbApi.setRegistrationStage(chatId, 'completed');
        await tgApi.sendMainMenu(chatId, true); // true - показати вітальне повідомлення
      } else {
        await tgApi.sendMainMenu(chatId);
      }
    } else if (data.startsWith('faq_')) {
      const faqId = data.replace('faq_', '');
      await tgApi.sendFAQAnswer(chatId, faqId);
    } else if (data.startsWith('service_')) {
      const serviceId = data.replace('service_', '');
      await tgApi.sendServiceDetails(chatId, serviceId);
    }
  } catch (error) {
    console.error(
      `Помилка обробки callback_query для chatId ${chatId}:`,
      error,
    );
    await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте ще раз.');
  }
});

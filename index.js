const { types } = require('./constants');
const { dbApi, tgApi } = require('./services');

const { bot } = tgApi;

console.log('Бот успішно запущений...');

// --- ОБРОБКА ТЕКСТОВИХ КОМАНД І ПОВІДОМЛЕНЬ ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  try {
    // Отримуємо статус процедури реєстрації
    const registrationStatus = await dbApi.checkRegistrationStatus(chatId);

    const { edit_stage: editStage } = await dbApi.getUserStage(chatId);

    // Якщо користувач не зареєстрований, створюємо запис зі статусом в БД 'waiting_for_name' та просимо ввести ім'я
    if (registrationStatus === types.registrationResults.NOT_REGISTERED) {
      await dbApi.initializeUser(chatId);
      await bot.sendMessage(
        chatId,
        '👉 Спочатку зареєструйтесь!\n Введіть ваше прізвище та імʼя. Наприклад: Бубоненко Анатолій',
      );
      return;
    }

    // Опрацьовуємо текстові команди та повідомлення в залежності від статусу реєстрації
    if (text === '/start') {
      if (registrationStatus === types.registrationResults.COMPLETED) {
        await tgApi.sendMainMenu(chatId);
      } else {
        await tgApi.sendWrongRegistrationActionsMessage(chatId);
      }
    } else if (registrationStatus === types.registrationResults.COMPLETED) {
      if (text === '👤 Мій профіль') {
        await tgApi.sendUserProfile(chatId);
      } else if (text === '❔ Часті питання') {
        await tgApi.sendFAQList(chatId);
      } else if (text === '💬 Контакти менеджера') {
        await tgApi.sendManagerContacts(chatId);
      } else if (text === '📋 Додаткові послуги') {
        await tgApi.sendServiceList(chatId);
      } else if (text === '⬅️ Назад') {
        await dbApi.setEditStage(chatId, 'null');
        await tgApi.sendMainMenu(chatId);
      }
      // Логіка редагування профілю для зареєстрованих користувачів
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
        await dbApi.setEditStage(
          chatId,
          types.registartionTypes.WAITING_FOR_DIRECTION,
        );
        await tgApi.sendDirectionSelectionButtons(chatId);
      } else if (text === 'Редагувати потік') {
        const direction = await dbApi.getUserDirection(chatId);
        await dbApi.setEditStage(
          chatId,
          types.registartionTypes.WAITING_FOR_STREAM,
        );
        await tgApi.sendStreamSelectionButtons(chatId, direction);
      }
      // Якщо команду не розпізнано
      else {
        if (editStage === types.registartionTypes.WAITING_FOR_DIRECTION) {
          await tgApi.sendDirectionSelectionButtons(chatId);
        } else if (editStage === types.registartionTypes.WAITING_FOR_STREAM) {
          const direction = await dbApi.getUserDirection(chatId);
          await tgApi.sendStreamSelectionButtons(chatId, direction);
        } else {
          await bot.sendMessage(
            chatId,
            'Я не розумію цю команду. Спробуйте ще раз, використовуючи меню.',
          );
        }
      }
    }
    // Логіка реєстрації
    else {
      if (
        registrationStatus === types.registartionTypes.WAITING_FOR_NAME &&
        /^[\p{L} '-]+$/u.test(text)
      ) {
        await tgApi.saveUserInfo.fullName(chatId, text);
        await bot.sendMessage(chatId, 'Тепер надішліть вашу електронну пошту');
      } else if (
        registrationStatus === types.registartionTypes.WAITING_FOR_EMAIL
      ) {
        if (/\S+@\S+\.\S+/.test(text)) {
          // Проста валідація email
          await tgApi.saveUserInfo.email(chatId, text);
          await tgApi.sendDirectionSelectionButtons(chatId);
        } else {
          await bot.sendMessage(
            chatId,
            '❌ Eлектронна пошта введена неправильно',
          );
        }
      } else if (
        registrationStatus === types.registartionTypes.WAITING_FOR_DIRECTION ||
        registrationStatus === types.registartionTypes.WAITING_FOR_STREAM
      ) {
        await tgApi.sendWrongRegistrationActionsMessage(chatId);
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

/* 
 - після вибору напрямку обов'зково надавати вибор потоку
 - при спробі ввести повідомлення на етапі вибору потоку повернути до вибору потоку 
 або вивести повідомлення
 */

// --- ОБРОБКА НАТИСКАНЬ НА INLINE-КНОПКИ ---
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  const registrationStatus = await dbApi.checkRegistrationStatus(chatId);

  const isRegistrationCompleted =
    registrationStatus === types.registrationResults.COMPLETED;

  try {
    // Видаляємо клавіатуру після натискання
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId },
    );
    // Якщо реєстрація не завершена, обробляємо лише кнопки, пов'язані з реєстрацією
    if (registrationStatus !== types.registrationResults.COMPLETED) {
      if (data.startsWith('direction_')) {
        const direction = data.replace('direction_', '');
        await tgApi.saveUserInfo.direction(chatId, direction);
        await tgApi.sendStreamSelectionButtons(chatId, direction);
      } else if (data.startsWith('stream_')) {
        const stream = data.replace('stream_', '');
        await tgApi.saveUserInfo.stream(chatId, stream);
        await tgApi.sendMainMenu(chatId, isRegistrationCompleted); // true - показати повідомлення про успішну реєстрацію
      } else {
        await tgApi.sendWrongRegistrationActionsMessage(chatId);
      }
      return; // При реєстрації не обробляємо інші callback-и
    }
    // Обробляємо callback-и для зареєстрованих користувачів
    if (data.startsWith('direction_')) {
      const direction = data.replace('direction_', '');
      await tgApi.saveUserInfo.direction(chatId, direction);
      await dbApi.setEditStage(
        chatId,
        types.registartionTypes.WAITING_FOR_STREAM,
      );
      await tgApi.sendStreamSelectionButtons(chatId, direction);
    } else if (data.startsWith('stream_')) {
      const stream = data.replace('stream_', '');
      await tgApi.saveUserInfo.stream(chatId, stream);
      await dbApi.setEditStage(chatId, 'null');
      await tgApi.sendMainMenu(chatId);
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

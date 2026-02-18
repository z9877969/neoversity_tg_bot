/* async function sendScheduleDetails(chatId) {
  const stream = await dbApi.getUserStream(chatId);
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
} */
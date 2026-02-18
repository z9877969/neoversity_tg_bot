/* async function sendNewsDetails(chatId, newsId) {
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
} */

/* 
async function sendNewsList(chatId) {
  const stream = await dbApi.getUserStream(chatId);
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
*/
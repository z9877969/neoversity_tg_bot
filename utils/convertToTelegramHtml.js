/**
 * Конвертує базовий Markdown у Telegram-сумісний HTML
 * @param {string} text - Вхідний текст у форматі Markdown
 * @returns {string} - Відформатований HTML для Telegram Bot API
 */
const convertToTelegramHTML = (text) => {
  if (!text) return '';

  let html = text;

  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*/g, '<i>$1</i>');

  // Посилання: [текст](url) -> <a href="url">текст</a>
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2">$1</a>',
  );

  // 5. Посилання без тексту (як у вашому прикладі: Більше про плюшки (url))
  // Шукаємо текст перед дужками з url
  html = html.replace(
    /([А-Яа-яA-Za-z\s]+)\s\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2">$1</a>',
  );

  // 6. Моноширинний текст для блоку UPD (наприклад, адреси)
  // Робимо рядки, що починаються з "- Woolf", "- 548 Market", "- registrar" моноширинними
  const updPatterns = [
    /Woolf Inc\./g,
    /548 Market St, PMB 78990, San Francisco, California, 94104/g,
    /registrar@woolf\.university/g,
  ];

  updPatterns.forEach((pattern) => {
    html = html.replace(pattern, '<code>$&</code>');
  });

  return html;
};

module.exports = convertToTelegramHTML;

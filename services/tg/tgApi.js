const TelegramBot = require('node-telegram-bot-api');
const { env } = require('../../constants');

const API_TOKEN = env.TG_API_TOKEN;
const bot = new TelegramBot(API_TOKEN, { polling: true });

module.exports = bot;

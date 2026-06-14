const TelegramBot = require('node-telegram-bot-api')

const token = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const bot = new TelegramBot(token)

module.exports = async (request, response) => {
  try {
    const date = new Date()
    const jam = String(date.getHours()).padStart(2, '0') + '.' + String(date.getMinutes()).padStart(2, '0')
    const teksBio = 'Bot aktif melayani Anda Update terakhir jam ' + jam
    
    await bot.setMyShortDescription(teksBio)
    
    response.status(200).send('Bio bot berhasil diperbarui')
  } catch (error) {
    console.error(error)
    response.status(500).send('Terjadi kesalahan saat memperbarui bio')
  }

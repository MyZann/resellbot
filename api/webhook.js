const TelegramBot = require('node-telegram-bot-api')

const token = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const ownerId = 7340265605

const bot = new TelegramBot(token)

let startTime = Date.now()
let authorizedUsers = [ownerId]

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function getWaktu() {
  const date = new Date()
  const tanggal = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
  const jam = String(date.getHours()).padStart(2, '0') + '.' + String(date.getMinutes()).padStart(2, '0') + '.' + String(date.getSeconds()).padStart(2, '0')
  return tanggal + ' ' + jam
}

function getUptime() {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000)
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return d + 'd ' + h + 'h ' + m + 'm ' + s + 's'
}

async function kirimDashboard(chatId) {
  const teksDasbor = 'Waktu Sekarang ' + getWaktu() + '\n' +
    'Runtime Bot ' + getUptime() + '\n' +
    'Saldo Kamu Rp 0\n' +
    'Total Pengguna ' + authorizedUsers.length + '\n' +
    '-----------------------------\n' +
    'PRODUK TERSEDIA KAMI\n' +
    'GENERATOR KEY PREMIUM\n' +
    'RESS PANEL ADM PANEL TK PANEL\n' +
    'APK PREMIUM DAN BERBAYAR\n' +
    'SCRIPT BOT TELE DAN WA BERBAYAR\n\n' +
    'Official Key Bot'

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'OWNER MENU', callback_data: 'owner_menu' }],
        [{ text: 'BUAT KEY', callback_data: 'buat_key' }, { text: 'RESELLER PANEL', callback_data: 'dummy' }],
        [{ text: 'SPECIAL PANEL', callback_data: 'dummy' }, { text: 'APPS PREMIUM', callback_data: 'dummy' }],
        [{ text: 'SCRIPT TEMPLATE', callback_data: 'dummy' }, { text: 'DEPOSIT SALDO', callback_data: 'dummy' }],
        [{ text: 'PANEL SAYA', callback_data: 'dummy' }, { text: 'BANTUAN', callback_data: 'dummy' }]
      ]
    }
  }
  await bot.sendMessage(chatId, teksDasbor, options)
}

module.exports = async (request, response) => {
  try {
    const body = request.body

    if (body && body.message) {
      const msg = body.message
      const chatId = msg.chat.id
      const text = msg.text

      if (text === '/start') {
        if (authorizedUsers.includes(chatId)) {
          await kirimDashboard(chatId)
        } else {
          const options = {
            reply_markup: {
              inline_keyboard: [[{ text: 'MINTA AKSES', callback_data: 'minta_akses' }]]
            }
          }
          await bot.sendMessage(chatId, 'Kamu belum memiliki akses Silakan ajukan permintaan ke administrator', options)
        }
      }
    }

    if (body && body.callback_query) {
      const query = body.callback_query
      const chatId = query.message.chat.id
      const messageId = query.message.message_id
      const data = query.data
      const username = query.from.username || query.from.first_name || 'Tanpa Nama'

      if (data === 'minta_akses') {
        if (authorizedUsers.includes(chatId)) {
          await bot.sendMessage(chatId, 'Kamu sudah memiliki akses Ketik /start')
        } else {
          await bot.sendMessage(chatId, 'Permintaan kamu berhasil dikirim ke administrator')
          const adminOptions = {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Terima', callback_data: 'terima_' + chatId }, { text: 'Tolak', callback_data: 'tolak_' + chatId }]
              ]
            }
          }
          await bot.sendMessage(ownerId, 'Permintaan akses dari ' + username + ' ID ' + chatId, adminOptions)
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data.startsWith('terima_')) {
        if (chatId === ownerId) {
          const targetId = parseInt(data.split('_')[1])
          if (!authorizedUsers.includes(targetId)) {
            authorizedUsers.push(targetId)
          }
          await bot.editMessageText('Akses disetujui untuk ID ' + targetId, { chat_id: chatId, message_id: messageId })
          await bot.sendMessage(targetId, 'Akses disetujui Ketik /start untuk membuka menu utama')
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data.startsWith('tolak_')) {
        if (chatId === ownerId) {
          const targetId = parseInt(data.split('_')[1])
          await bot.editMessageText('Akses ditolak untuk ID ' + targetId, { chat_id: chatId, message_id: messageId })
          await bot.sendMessage(targetId, 'Maaf administrator menolak permintaan akses kamu')
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data === 'buat_key') {
        if (!authorizedUsers.includes(chatId)) {
          await bot.sendMessage(chatId, 'Kamu tidak memiliki akses')
        } else {
          const rawKey = generateKey()
          const formatKey = rawKey.slice(0, 4) + '-' + rawKey.slice(4, 8) + '-' + rawKey.slice(8, 12) + '-' + rawKey.slice(12, 16)
          const teksHasil = 'KEY BARU DIBUAT\n\n' +
            'User ' + username + '\n' +
            'Key ' + formatKey + '\n' +
            'Tipe Premium\n' +
            'Waktu ' + getWaktu() + '\n\n' +
            'Key berhasil dibuat'
          await bot.sendMessage(chatId, teksHasil)
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data === 'dummy' || data === 'owner_menu') {
        await bot.answerCallbackQuery(query.id, { text: 'Fitur sedang dalam pengembangan' })
      }
    }

    response.status(200).send('OK')
  } catch (error) {
    response.status(500).send('Error')
  }
}

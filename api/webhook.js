const TelegramBot = require('node-telegram-bot-api')

const token = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const ownerId = 7340265605

const bot = new TelegramBot(token)

let startTime = Date.now()
let authorizedUsers = [ownerId]
let keyLogs = []

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
  const teksDasbor = '🕒 <b>Waktu Sekarang:</b> ' + getWaktu() + '\n' +
    '⏱ <b>Runtime Bot:</b> ' + getUptime() + '\n' +
    '💳 <b>Saldo Kamu:</b> Rp 0\n' +
    '👥 <b>Total Pengguna:</b> ' + authorizedUsers.length + '\n' +
    '-----------------------------\n' +
    '🔥 <b>PRODUK TERSEDIA KAMI</b> 🔥\n' +
    '🔑 GENERATOR KEY PREMIUM\n' +
    '🛒 RESS PANEL ADM PANEL TK PANEL\n' +
    '📱 APK PREMIUM DAN BERBAYAR\n' +
    '💻 SCRIPT BOT TELE DAN WA BERBAYAR\n\n' +
    '🚀 <i>Official Key Bot</i>'

  const options = {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '👑 OWNER MENU', callback_data: 'owner_menu' }],
        [{ text: '🔑 BUAT KEY', callback_data: 'buat_key' }, { text: '💼 RESELLER PANEL', callback_data: 'dummy_panel' }],
        [{ text: '🌟 SPECIAL PANEL', callback_data: 'dummy_special' }, { text: '📱 APPS PREMIUM', callback_data: 'dummy_apps' }],
        [{ text: '💻 SCRIPT TEMPLATE', callback_data: 'dummy_script' }, { text: '💰 DEPOSIT SALDO', callback_data: 'dummy_depo' }],
        [{ text: '📦 PANEL SAYA', callback_data: 'dummy_saya' }, { text: 'ℹ️ BANTUAN', callback_data: 'dummy_bantuan' }]
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
              inline_keyboard: [[{ text: '🔒 MINTA AKSES', callback_data: 'minta_akses' }]]
            }
          }
          await bot.sendMessage(chatId, '⛔ Kamu belum memiliki akses. Silakan ajukan permintaan ke administrator.', options)
        }
      }
    }

    if (body && body.callback_query) {
      const query = body.callback_query
      const chatId = query.message.chat.id
      const messageId = query.message.message_id
      const data = query.data
      const username = query.from.username ? '@' + query.from.username : query.from.first_name

      if (data === 'minta_akses') {
        if (authorizedUsers.includes(chatId)) {
          await bot.sendMessage(chatId, '✅ Kamu sudah memiliki akses. Ketik /start')
        } else {
          await bot.sendMessage(chatId, '⏳ Permintaan kamu berhasil dikirim ke administrator.')
          const adminOptions = {
            reply_markup: {
              inline_keyboard: [
                [{ text: '✅ Terima', callback_data: 'terima_' + chatId }, { text: '❌ Tolak', callback_data: 'tolak_' + chatId }]
              ]
            }
          }
          await bot.sendMessage(ownerId, '🔔 Permintaan akses baru dari ' + username + ' ID ' + chatId, adminOptions)
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data.startsWith('terima_')) {
        if (chatId === ownerId) {
          const targetId = parseInt(data.split('_')[1])
          if (!authorizedUsers.includes(targetId)) {
            authorizedUsers.push(targetId)
          }
          await bot.editMessageText('✅ Akses disetujui untuk ID ' + targetId, { chat_id: chatId, message_id: messageId })
          await bot.sendMessage(targetId, '🎉 Akses disetujui! Ketik /start untuk membuka menu utama.')
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data.startsWith('tolak_')) {
        if (chatId === ownerId) {
          const targetId = parseInt(data.split('_')[1])
          await bot.editMessageText('❌ Akses ditolak untuk ID ' + targetId, { chat_id: chatId, message_id: messageId })
          await bot.sendMessage(targetId, 'Maaf, administrator menolak permintaan akses kamu. 😔')
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data === 'buat_key') {
        if (!authorizedUsers.includes(chatId)) {
          await bot.sendMessage(chatId, '⛔ Kamu tidak memiliki akses.')
        } else {
          const rawKey = generateKey()
          const formatKey = rawKey.slice(0, 4) + '-' + rawKey.slice(4, 8) + '-' + rawKey.slice(8, 12) + '-' + rawKey.slice(12, 16)
          
          keyLogs.push('👤 ' + username + ' 🔑 ' + formatKey)

          const teksHasil = '🛒 <b>KEY BARU DIBUAT!</b>\n\n' +
            '👤 <b>User:</b> ' + username + '\n' +
            '🔑 <b>Key:</b> <span class="tg-spoiler">' + formatKey + '</span>\n' +
            '💰 <b>Tipe:</b> Premium\n' +
            '⏰ <b>Waktu:</b> ' + getWaktu() + '\n\n' +
            '🚀 <i>Key berhasil dibuat.</i>'
            
          await bot.sendMessage(chatId, teksHasil, { parse_mode: 'HTML' })
        }
        await bot.answerCallbackQuery(query.id)
      }

      if (data === 'owner_menu') {
        if (chatId === ownerId) {
          let logText = '👑 <b>LOG PEMBUATAN KEY</b>\n\n'
          if (keyLogs.length === 0) {
            logText += 'Belum ada data key dibuat.'
          } else {
            logText += keyLogs.join('\n')
          }
          await bot.sendMessage(chatId, logText, { parse_mode: 'HTML' })
        } else {
          await bot.answerCallbackQuery(query.id, { text: '⛔ Menu ini khusus untuk Owner!', show_alert: true })
        }
      }

      if (data.startsWith('dummy_')) {
        await bot.answerCallbackQuery(query.id, { text: '🚧 Fitur sedang dalam pengembangan', show_alert: true })
      }
    }

    response.status(200).send('OK')
  } catch (error) {
    response.status(500).send('Error')
  }
}

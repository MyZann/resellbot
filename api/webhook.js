const TelegramBot = require('node-telegram-bot-api')
const express = require('express')

const token = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const ownerId = 7340265605

const bot = new TelegramBot(token, {polling: true})
const app = express()
const port = process.env.PORT || 3000

const startTime = Date.now()
const authorizedUsers = new Set()
authorizedUsers.add(ownerId)

app.get('/', (req, res) => {
  res.send('Bot aktif dengan tampilan UI profesional')
})

app.listen(port, () => {
  console.log('Server berjalan')
})

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
  return tanggal + ', ' + jam
}

function getUptime() {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000)
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return d + 'd ' + h + 'h ' + m + 'm ' + s + 's'
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  
  if (authorizedUsers.has(chatId)) {
    kirimDashboard(chatId)
  } else {
    const options = {
      reply_markup: {
        inline_keyboard: [[{ text: '🔒 MINTA AKSES', callback_data: 'minta_akses' }]]
      }
    }
    bot.sendMessage(chatId, 'Kamu belum memiliki akses Silakan ajukan permintaan ke administrator', options)
  }
})

function kirimDashboard(chatId) {
  const teksDasbor = 
`\`\`\`text
🕒 Waktu Sekarang : ${getWaktu()}
⏱ Runtime Bot     : ${getUptime()}
💳 Saldo Kamu     : Rp 0
👥 Total Pengguna : ${authorizedUsers.size}
─────────────────────────────
PRODUK TERSEDIA KAMI:
🔑 GENERATOR KEY PREMIUM
🛒 RESS PANEL, ADM PANEL, TK PANEL
📱 APK PREMIUM DAN BERBAYAR
💻 SCRIPT BOT TELE & WA BERBAYAR

🚀 ──── ( *Official Key Bot* ) ──── 🚀
\`\`\``

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '👑 OWNER MENU', callback_data: 'owner_menu' }],
        [{ text: '🔑 BUAT KEY', callback_data: 'buat_key' }, { text: '💼 RESELLER PANEL', callback_data: 'dummy' }],
        [{ text: '👑 SPECIAL PANEL', callback_data: 'dummy' }, { text: '📱 APPS PREMIUM', callback_data: 'dummy' }],
        [{ text: '💻 SCRIPT & TEMPLATE', callback_data: 'dummy' }, { text: '💰 DEPOSIT SALDO', callback_data: 'dummy' }],
        [{ text: '📦 PANEL SAYA', callback_data: 'dummy' }, { text: 'ℹ️ BANTUAN', callback_data: 'dummy' }]
      ]
    }
  }
  
  bot.sendMessage(chatId, teksDasbor, options)
}

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id
  const messageId = query.message.message_id
  const data = query.data
  const username = query.from.username || query.from.first_name || 'Tanpa Nama'

  if (data === 'minta_akses') {
    if (authorizedUsers.has(chatId)) {
      bot.sendMessage(chatId, 'Kamu sudah memiliki akses Ketik /start')
      bot.answerCallbackQuery(query.id)
      return
    }
    
    bot.sendMessage(chatId, 'Permintaan kamu berhasil dikirim ke administrator')
    
    const adminOptions = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Terima', callback_data: 'terima_' + chatId }, { text: '❌ Tolak', callback_data: 'tolak_' + chatId }]
        ]
      }
    }
    bot.sendMessage(ownerId, 'Permintaan akses dari @' + username + ' (ID: ' + chatId + ')', adminOptions)
  }

  if (data.startsWith('terima_')) {
    if (chatId !== ownerId) return bot.answerCallbackQuery(query.id)
    
    const targetId = parseInt(data.split('_')[1])
    authorizedUsers.add(targetId)
    
    bot.editMessageText('Akses disetujui untuk ID ' + targetId, { chat_id: chatId, message_id: messageId })
    bot.sendMessage(targetId, 'Akses disetujui Ketik /start untuk membuka menu utama')
  }

  if (data.startsWith('tolak_')) {
    if (chatId !== ownerId) return bot.answerCallbackQuery(query.id)
    
    const targetId = parseInt(data.split('_')[1])
    bot.editMessageText('Akses ditolak untuk ID ' + targetId, { chat_id: chatId, message_id: messageId })
    bot.sendMessage(targetId, 'Maaf administrator menolak permintaan akses kamu')
  }

  if (data === 'buat_key') {
    if (!authorizedUsers.has(chatId)) {
      bot.sendMessage(chatId, 'Kamu tidak memiliki akses')
      bot.answerCallbackQuery(query.id)
      return
    }
    
    const rawKey = generateKey()
    const formatKey = rawKey.slice(0, 4) + '-' + rawKey.slice(4, 8) + '-' + rawKey.slice(8, 12) + '-' + rawKey.slice(12, 16)
    
    const teksHasil = 
`\`\`\`JavaScript
🛒 *KEY BARU DIBUAT!*

👤 *User:* @${username}
🔑 *Key:* ${formatKey}
💰 *Tipe:* Premium
⏰ *Waktu:* ${getWaktu()}

🚀 *Key berhasil dibuat!*
\`\`\``

    bot.sendMessage(chatId, teksHasil, { parse_mode: 'Markdown' })
  }

  if (data === 'dummy' || data === 'owner_menu') {
    bot.answerCallbackQuery(query.id, { text: 'Fitur sedang dalam pengembangan' })
    return
  }
  
  bot.answerCallbackQuery(query.id)
})

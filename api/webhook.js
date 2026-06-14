const TOKEN = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const OWNER_ID = 7340265605
const TELEGRAM_API = 'https://api.telegram.org/bot' + TOKEN

let startTime = Date.now()
let authorizedUsers = [OWNER_ID]
let keyLogs = []

async function sendTelegramRequest(method, payload) {
  try {
    const response = await fetch(TELEGRAM_API + '/' + method, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    return await response.json()
  } catch (error) {
    console.error('Gagal mengirim pesan:', error)
    return null
  }
}

async function sendMessage(chatId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    text: text,
    ...options
  }
  return await sendTelegramRequest('sendMessage', payload)
}

async function editMessageText(chatId, messageId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    ...options
  }
  return await sendTelegramRequest('editMessageText', payload)
}

async function answerCallbackQuery(callbackQueryId, options = {}) {
  const payload = {
    callback_query_id: callbackQueryId,
    ...options
  }
  return await sendTelegramRequest('answerCallbackQuery', payload)
}

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
  await sendMessage(chatId, teksDasbor, options)
}

module.exports = async (request, response) => {
  // Rute ini dipakai cron-job.org untuk menjaga server tetap hidup
  if (request.method === 'GET') {
    return response.status(200).send('Server bot aktif dan siap menerima pesan')
  }

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
          await sendMessage(chatId, '⛔ Kamu belum memiliki akses Silakan ajukan permintaan ke administrator', options)
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
          await sendMessage(chatId, '✅ Kamu sudah memiliki akses Ketik /start')
        } else {
          await sendMessage(chatId, '⏳ Permintaan kamu berhasil dikirim ke administrator')
          const adminOptions = {
            reply_markup: {
              inline_keyboard: [
                [{ text: '✅ Terima', callback_data: 'terima_' + chatId }, { text: '❌ Tolak', callback_data: 'tolak_' + chatId }]
              ]
            }
          }
          await sendMessage(OWNER_ID, '🔔 Permintaan akses baru dari ' + username + ' ID ' + chatId, adminOptions)
        }
        await answerCallbackQuery(query.id)
      }

      if (data.startsWith('terima_')) {
        if (chatId === OWNER_ID) {
          const targetId = parseInt(data.split('_')[1])
          if (!authorizedUsers.includes(targetId)) {
            authorizedUsers.push(targetId)
          }
          await editMessageText(chatId, messageId, '✅ Akses disetujui untuk ID ' + targetId)
          await sendMessage(targetId, '🎉 Akses disetujui Ketik /start untuk membuka menu utama')
        }
        await answerCallbackQuery(query.id)
      }

      if (data.startsWith('tolak_')) {
        if (chatId === OWNER_ID) {
          const targetId = parseInt(data.split('_')[1])
          await editMessageText(chatId, messageId, '❌ Akses ditolak untuk ID ' + targetId)
          await sendMessage(targetId, 'Maaf administrator menolak permintaan akses kamu 😔')
        }
        await answerCallbackQuery(query.id)
      }

      if (data === 'buat_key') {
        if (!authorizedUsers.includes(chatId)) {
          await sendMessage(chatId, '⛔ Kamu tidak memiliki akses')
        } else {
          const rawKey = generateKey()
          const formatKey = rawKey.slice(0, 4) + '-' + rawKey.slice(4, 8) + '-' + rawKey.slice(8, 12) + '-' + rawKey.slice(12, 16)
          
          keyLogs.push('👤 ' + username + ' 🔑 ' + formatKey)

          const teksHasil = '🛒 <b>KEY BARU DIBUAT</b>\n\n' +
            '👤 <b>User:</b> ' + username + '\n' +
            '🔑 <b>Key:</b> <span class="tg-spoiler">' + formatKey + '</span>\n' +
            '💰 <b>Tipe:</b> Premium\n' +
            '⏰ <b>Waktu:</b> ' + getWaktu() + '\n\n' +
            '🚀 <i>Key berhasil dibuat</i>'
            
          await sendMessage(chatId, teksHasil, { parse_mode: 'HTML' })
        }
        await answerCallbackQuery(query.id)
      }

      if (data === 'owner_menu') {
        if (chatId === OWNER_ID) {
          let logText = '👑 <b>LOG PEMBUATAN KEY</b>\n\n'
          if (keyLogs.length === 0) {
            logText += 'Belum ada data key dibuat'
          } else {
            logText += keyLogs.join('\n')
          }
          await sendMessage(chatId, logText, { parse_mode: 'HTML' })
        } else {
          await answerCallbackQuery(query.id, { text: '⛔ Menu ini khusus untuk Owner', show_alert: true })
        }
      }

      if (data.startsWith('dummy_')) {
        await answerCallbackQuery(query.id, { text: '🚧 Fitur sedang dalam pengembangan', show_alert: true })
      }
    }

    response.status(200).send('OK')
  } catch (error) {
    console.error('Error handling webhook:', error)
    response.status(500).send('Error')
  }
}

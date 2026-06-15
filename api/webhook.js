const TOKEN = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const OWNER_ID = 7340265605
const TELEGRAM_API = 'https://api.telegram.org/bot' + TOKEN

let startTime = Date.now()
let authorizedUsers = [OWNER_ID]
let keyLogs = []
let userBalances = {}

const products = {
  p1: { name: 'Fluorite iOS', img: 'https://placehold.co/600x400/png?text=Fluorite+iOS', pkgs: [['1D', 35000], ['7D', 125000], ['30D', 300000]] },
  p2: { name: 'Migul iOS', img: 'https://placehold.co/600x400/png?text=Migul+iOS', pkgs: [['1D', 25000], ['7D', 90000], ['31D', 200000]] },
  p3: { name: 'Drip Client Proxy', img: 'https://placehold.co/600x400/png?text=Drip+Proxy', pkgs: [['1D', 7000], ['2D', 15000], ['3D', 35000]] },
  p4: { name: 'Drip Client Non Root', img: 'https://placehold.co/600x400/png?text=Drip+Non+Root', pkgs: [['1D', 7000], ['3D', 18000], ['7D', 25000], ['15D', 57000], ['30D', 78000]] },
  p5: { name: 'BR Root Mods', img: 'https://placehold.co/600x400/png?text=BR+Root', pkgs: [['1D', 9000], ['7D', 35000], ['15D', 65000], ['30D', 100000]] },
  p6: { name: 'HG Mods', img: 'https://placehold.co/600x400/png?text=HG+Mods', pkgs: [['1D', 7500], ['7D', 25000], ['10D', 35000], ['30D', 100000]] },
  p7: { name: 'Prime Hook', img: 'https://placehold.co/600x400/png?text=Prime+Hook', pkgs: [['1D', 5000], ['3D', 25000], ['7D', 32000]] },
  p8: { name: 'Pato Team Orange', img: 'https://placehold.co/600x400/png?text=Pato+Orange', pkgs: [['3D', 25000], ['7D', 50000], ['15D', 100000], ['30D', 150000]] },
  p9: { name: 'Pato Team Blue', img: 'https://placehold.co/600x400/png?text=Pato+Blue', pkgs: [['3D', 20000], ['7D', 50000], ['15D', 100000], ['30D', 150000]] },
  p10: { name: 'GBox', img: 'https://placehold.co/600x400/png?text=GBox', pkgs: [['1Y', 60000]] }
}

function getBalance(chatId) {
  if (chatId === OWNER_ID) return 9999999;
  return userBalances[chatId] || 0;
}

function formatRp(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

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

async function sendPhoto(chatId, photo, options = {}) {
  const payload = {
    chat_id: chatId,
    photo: photo,
    ...options
  }
  return await sendTelegramRequest('sendPhoto', payload)
}

async function deleteMessage(chatId, messageId) {
  const payload = {
    chat_id: chatId,
    message_id: messageId
  }
  return await sendTelegramRequest('deleteMessage', payload)
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
    '💳 <b>Saldo Kamu:</b> ' + formatRp(getBalance(chatId)) + '\n' +
    '👥 <b>Total Pengguna:</b> ' + authorizedUsers.length + '\n' +
    '-----------------------------\n' +
    '🔥 <b>PRODUK TERSEDIA KAMI</b> 🔥\n' +
    '1. Fluorite iOS\n' +
    '2. Migul iOS\n' +
    '3. Drip Client Proxy\n' +
    '4. Drip Client Non Root\n' +
    '5. BR Root Mods\n' +
    '6. HG Mods\n' +
    '7. Prime Hook\n' +
    '8. Pato Team Orange\n' +
    '9. Pato Team Blue\n' +
    '10. GBox\n\n' +
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

      if (data === 'kembali_menu') {
        await deleteMessage(chatId, messageId)
        await kirimDashboard(chatId)
        await answerCallbackQuery(query.id)
      }

      if (data === 'buat_key') {
        if (!authorizedUsers.includes(chatId)) {
          await sendMessage(chatId, '⛔ Kamu tidak memiliki akses')
        } else {
          await deleteMessage(chatId, messageId)
          
          const keyboardList = Object.keys(products).map(key => ([{ text: products[key].name, callback_data: 'sel_' + key }]))
          keyboardList.push([{ text: '🔙 Kembali', callback_data: 'kembali_menu' }])
          
          await sendMessage(chatId, '📦 <b>PILIH PRODUK</b>\nSilakan pilih produk yang ingin Anda buat key-nya:', {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: keyboardList }
          })
        }
        await answerCallbackQuery(query.id)
      }

      if (data.startsWith('sel_')) {
        const prodId = data.replace('sel_', '')
        const p = products[prodId]
        if (p) {
          await deleteMessage(chatId, messageId)
          const packageButtons = p.pkgs.map((pkg, idx) => ([{ text: pkg[0] + ' - ' + formatRp(pkg[1]), callback_data: 'buy_' + prodId + '_' + idx }]))
          packageButtons.push([{ text: '🔙 Kembali', callback_data: 'buat_key' }])
          
          await sendPhoto(chatId, p.img, {
            caption: 'Produk: <b>' + p.name + '</b>\n\nSilakan pilih durasi paket di bawah ini:',
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: packageButtons }
          })
        }
        await answerCallbackQuery(query.id)
      }

      if (data.startsWith('buy_')) {
        const parts = data.split('_')
        const prodId = parts[1]
        const pkgIdx = parts[2]
        const p = products[prodId]
        const pkg = p.pkgs[pkgIdx]
        
        const price = pkg[1]
        const duration = pkg[0]
        const bal = getBalance(chatId)

        if (bal < price) {
          await answerCallbackQuery(query.id, { text: '⛔ Saldo tidak mencukupi!\nHarga: ' + formatRp(price) + '\nSaldo Anda: ' + formatRp(bal), show_alert: true })
        } else {
          if (chatId !== OWNER_ID) {
            userBalances[chatId] = bal - price
          }

          const rawKey = generateKey()
          const formatKey = rawKey.slice(0, 4) + '-' + rawKey.slice(4, 8) + '-' + rawKey.slice(8, 12) + '-' + rawKey.slice(12, 16)
          
          keyLogs.push('👤 ' + username + ' 🔑 ' + formatKey + ' (' + p.name + ' ' + duration + ')')

          const teksHasil = '🛒 <b>KEY BARU DIBUAT</b>\n\n' +
            '👤 <b>User:</b> ' + username + '\n' +
            '📦 <b>Produk:</b> ' + p.name + '\n' +
            '⏳ <b>Durasi:</b> ' + duration + '\n' +
            '🔑 <b>Key:</b> <span class="tg-spoiler">' + formatKey + '</span>\n' +
            '💰 <b>Harga:</b> ' + formatRp(price) + '\n' +
            '⏰ <b>Waktu:</b> ' + getWaktu() + '\n\n' +
            '🚀 <i>Key berhasil dibuat</i>'
            
          await deleteMessage(chatId, messageId)
          await sendMessage(chatId, teksHasil, { parse_mode: 'HTML' })
          await kirimDashboard(chatId)
          await answerCallbackQuery(query.id)
        }
      }

      if (data === 'dummy_depo') {
        if (chatId !== OWNER_ID) {
          userBalances[chatId] = (userBalances[chatId] || 0) + 100000
        }
        await answerCallbackQuery(query.id, { text: '✅ Saldo Rp 100.000 ditambahkan untuk pengujian', show_alert: true })
        await deleteMessage(chatId, messageId)
        await kirimDashboard(chatId)
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

      if (data.startsWith('dummy_') && data !== 'dummy_depo') {
        await answerCallbackQuery(query.id, { text: '🚧 Fitur sedang dalam pengembangan', show_alert: true })
      }
    }

    response.status(200).send('OK')
  } catch (error) {
    console.error('Error handling webhook:', error)
    response.status(500).send('Error')
  }
}

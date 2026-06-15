const TOKEN = '8999455251:AAFkmFjMu3dd02IAESeg0JzyreCAFZ2eT5o'
const OWNER_ID = 7340265605
const TELEGRAM_API = 'https://api.telegram.org/bot' + TOKEN

let startTime = Date.now()
let authorizedUsers = [OWNER_ID]
let blacklistedUsers = []
let keyLogs = []
let activeKeys = {}
let userBalances = {}
let adminState = ''

let products = {
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
  let prodText = ''
  const keys = Object.keys(products)
  for (let i = 0; i < keys.length; i++) {
    prodText += (i + 1) + '. ' + products[keys[i]].name + '\n'
  }

  const teksDasbor = '🕒 <b>Waktu Sekarang:</b> ' + getWaktu() + '\n' +
    '⏱ <b>Runtime Bot:</b> ' + getUptime() + '\n' +
    '💳 <b>Saldo Kamu:</b> ' + formatRp(getBalance(chatId)) + '\n' +
    '👥 <b>Total Pengguna:</b> ' + authorizedUsers.length + '\n' +
    '-----------------------------\n' +
    '🔥 <b>PRODUK TERSEDIA KAMI</b> 🔥\n' +
    prodText + '\n' +
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

async function handleAdminInput(chatId, text) {
  try {
    if (adminState === 'ADD_USER') {
      const id = parseInt(text)
      if (!authorizedUsers.includes(id)) authorizedUsers.push(id)
      await sendMessage(chatId, '✅ User ' + id + ' berhasil ditambahkan')
    } else if (adminState === 'REMOVE_USER') {
      const id = parseInt(text)
      authorizedUsers = authorizedUsers.filter(u => u !== id)
      await sendMessage(chatId, '✅ User ' + id + ' berhasil dihapus')
    } else if (adminState === 'BAN_USER') {
      const id = parseInt(text)
      if (!blacklistedUsers.includes(id)) blacklistedUsers.push(id)
      authorizedUsers = authorizedUsers.filter(u => u !== id)
      await sendMessage(chatId, '✅ User ' + id + ' dibanned')
    } else if (adminState === 'ADD_BAL') {
      const parts = text.split(' ')
      const id = parseInt(parts[0])
      const amount = parseInt(parts[1])
      userBalances[id] = (userBalances[id] || 0) + amount
      await sendMessage(chatId, '✅ Saldo user ' + id + ' ditambah ' + formatRp(amount))
    } else if (adminState === 'REMOVE_BAL') {
      const parts = text.split(' ')
      const id = parseInt(parts[0])
      const amount = parseInt(parts[1])
      userBalances[id] = Math.max(0, (userBalances[id] || 0) - amount)
      await sendMessage(chatId, '✅ Saldo user ' + id + ' dikurangi ' + formatRp(amount))
    } else if (adminState === 'ADD_PROD') {
      const parts = text.split('|')
      const pId = parts[0]
      const pName = parts[1]
      const pPkgs = parts[2].split(';').map(p => {
        const sp = p.split(',')
        return [sp[0], parseInt(sp[1])]
      })
      products[pId] = { name: pName, img: 'https://placehold.co/600x400/png?text=' + pName.replace(/ /g, '+'), pkgs: pPkgs }
      await sendMessage(chatId, '✅ Produk ' + pName + ' berhasil ditambahkan')
    } else if (adminState === 'DEL_PROD') {
      delete products[text]
      await sendMessage(chatId, '✅ Produk ' + text + ' dihapus')
    } else if (adminState === 'REVOKE_KEY' || adminState === 'RESET_KEY') {
      delete activeKeys[text]
      await sendMessage(chatId, '✅ Tindakan berhasil untuk key ' + text)
    }
  } catch (e) {
    await sendMessage(chatId, '❌ Format salah Silakan ulangi')
  }
  adminState = ''
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
      const text = msg.text || ''

      if (chatId === OWNER_ID && adminState !== '' && !text.startsWith('/')) {
        await handleAdminInput(chatId, text)
        return response.status(200).send('OK')
      }

      if (text === '/start') {
        if (blacklistedUsers.includes(chatId)) {
          await sendMessage(chatId, '⛔ Akun Anda telah dibanned oleh Admin')
          return response.status(200).send('OK')
        }
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
          activeKeys[formatKey] = { user: username, prod: p.name }

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
          const opts = {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '👥 Kelola User', callback_data: 'own_users' }, { text: '💰 Kelola Saldo', callback_data: 'own_bal' }],
                [{ text: '📦 Kelola Produk', callback_data: 'own_prod' }, { text: '🔑 Kelola Key', callback_data: 'own_keys' }],
                [{ text: '📋 Lihat Log', callback_data: 'own_logs' }, { text: '🔙 Kembali Dasbor', callback_data: 'kembali_menu' }]
              ]
            }
          }
          await editMessageText(chatId, messageId, '👑 <b>PANEL OWNER</b>\nSilakan pilih menu manajemen:', opts)
        } else {
          await answerCallbackQuery(query.id, { text: '⛔ Menu ini khusus untuk Owner', show_alert: true })
        }
      }

      if (data === 'own_users') {
        if (chatId === OWNER_ID) {
          await editMessageText(chatId, messageId, '👥 <b>Manajemen User</b>', {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '➕ Add User', callback_data: 'act_ADD_USER' }, { text: '➖ Remove User', callback_data: 'act_REMOVE_USER' }],
                [{ text: '🚫 Ban User', callback_data: 'act_BAN_USER' }, { text: '🔙 Kembali', callback_data: 'owner_menu' }]
              ]
            }
          })
        }
      }

      if (data === 'own_bal') {
        if (chatId === OWNER_ID) {
          await editMessageText(chatId, messageId, '💰 <b>Manajemen Saldo</b>', {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '➕ Add Balance', callback_data: 'act_ADD_BAL' }, { text: '➖ Reduce Balance', callback_data: 'act_REMOVE_BAL' }],
                [{ text: '🔙 Kembali', callback_data: 'owner_menu' }]
              ]
            }
          })
        }
      }

      if (data === 'own_prod') {
        if (chatId === OWNER_ID) {
          let pList = 'Daftar Produk Saat Ini:\n' + Object.keys(products).map(k => k + ' ' + products[k].name).join('\n')
          await editMessageText(chatId, messageId, '📦 <b>Manajemen Produk</b>\n' + pList, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '➕ Add Produk', callback_data: 'act_ADD_PROD' }, { text: '➖ Hapus Produk', callback_data: 'act_DEL_PROD' }],
                [{ text: '🔙 Kembali', callback_data: 'owner_menu' }]
              ]
            }
          })
        }
      }

      if (data === 'own_keys') {
        if (chatId === OWNER_ID) {
          await editMessageText(chatId, messageId, '🔑 <b>Manajemen Key</b>', {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Revoke Key', callback_data: 'act_REVOKE_KEY' }, { text: '🔄 Reset Key', callback_data: 'act_RESET_KEY' }],
                [{ text: '🔙 Kembali', callback_data: 'owner_menu' }]
              ]
            }
          })
        }
      }

      if (data === 'own_logs') {
        if (chatId === OWNER_ID) {
          let logText = '👑 <b>LOG PEMBUATAN KEY</b>\n\n'
          if (keyLogs.length === 0) logText += 'Belum ada data key dibuat'
          else logText += keyLogs.join('\n')
          await editMessageText(chatId, messageId, logText, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Kembali', callback_data: 'owner_menu' }]] }
          })
        }
      }

      if (data.startsWith('act_')) {
        if (chatId === OWNER_ID) {
          adminState = data.replace('act_', '')
          let msgText = 'Kirimkan data untuk ' + adminState + '\n\n'
          if (adminState === 'ADD_USER' || adminState === 'REMOVE_USER' || adminState === 'BAN_USER') msgText += 'Format IDUser\nContoh 12345678'
          else if (adminState === 'ADD_BAL' || adminState === 'REMOVE_BAL') msgText += 'Format IDUser Jumlah\nContoh 12345678 50000'
          else if (adminState === 'ADD_PROD') msgText += 'Format ID|Nama|Durasi,Harga;Durasi,Harga\nContoh p11|VIP Baru|1D,10000;7D,50000'
          else if (adminState === 'DEL_PROD') msgText += 'Format IDProduk\nContoh p1'
          else if (adminState === 'REVOKE_KEY' || adminState === 'RESET_KEY') msgText += 'Format Key\nContoh ABCD-EFGH-IJKL-MNOP'

          await sendMessage(chatId, msgText)
          await answerCallbackQuery(query.id)
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

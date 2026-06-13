const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Halo dari Vercel'))
bot.on('text', (ctx) => ctx.reply('Anda mengetik: ' + ctx.message.text))

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res)
  } else {
    res.status(200).send('Server bot aktif')
  }
}

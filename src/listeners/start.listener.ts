import { bot } from '../lib/bot'
import { Markup } from 'telegraf'

export const startListener = () => {
  return bot.start((ctx) => {
    const message = [
      '*Hello!*',
      '',
      "*It's Easy to get started! add me to your group, or send me your media*",
      'And i will ensure that:',
      '- No duplicate media exist in our chat',
      '- No duplicate media exist in your group',
      '',
      '*Practical steps:*',
      '',
      '- Send me here invite links, or forward them to me here',
      "- If you've added me to a group, make sure to give me full admin rights",
      "- That's it the bot will do the rest!",
    ].join('\n')

    ctx.reply(message, { parse_mode: 'Markdown' })
  })
}

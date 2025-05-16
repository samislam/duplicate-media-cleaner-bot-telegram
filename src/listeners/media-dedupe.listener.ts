import { to } from 'await-to-js'
import type { Message } from '../types/misc'
import ProcessedMedia, { type IProcessedMedia } from '../db/media.schema'
import type { MessageListener } from '../utils/register-message-listeners'

export const mediaDedupeListener: MessageListener = async (ctx) => {
  const msg: Message = ctx.message as Message
  const chatId = ctx.chat.id
  // const chatType = ctx.chat.type

  const media = msg.photo?.slice(-1)[0] ?? msg.document ?? msg.video ?? msg.sticker
  if (!media) return

  const fileUniqueId = media.file_unique_id
  if (!fileUniqueId) return

  const [errSavingMedia] = await to<IProcessedMedia, any>(
    new ProcessedMedia({
      chatId,
      fileUniqueId,
      username: ctx.from.username,
      userId: ctx.from.id,
      messageId: msg.message_id,
    }).save()
  )

  // first‐time in this chat ➞ nothing to delete
  if (!errSavingMedia) return console.log(`🆕 [${chatId}] saved ${fileUniqueId}`)
  switch (errSavingMedia.code) {
    // duplicate in the same chat
    case 11000:
      console.log(`⚠️ duplicate in chat ${chatId}: ${fileUniqueId}`)
      // delete the duplicate message
      const [errDel] = await to<any, any>(ctx.deleteMessage(msg.message_id))
      if (!errDel) break
      const isCantDelete =
        errDel.code === 400 &&
        typeof errDel.description === 'string' &&
        errDel.description.includes("message can't be deleted")
      if (isCantDelete) console.log("Couldn't delete media because bot is not an admin")
      else console.log('Failed to delete media', errDel)
      console.error('Failed to delete duplicate:', errDel)
      break
    default:
      console.error('Error saving media record:', errSavingMedia)
  }
}

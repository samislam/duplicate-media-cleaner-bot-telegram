// src/db/spy-media.schema.ts
import mongoose from 'mongoose'

export interface IProcessedSpyMedia {
  spyGroupId: number
  fileUniqueId: string
  forwardedAt: Date
  userId?: number
  username?: string
  fullName?: string
  phoneNumber?: string
}

const spyMediaSchema = new mongoose.Schema<IProcessedSpyMedia>({
  spyGroupId: { type: Number, required: true },
  fileUniqueId: { type: String, required: true },
  forwardedAt: { type: Date, default: Date.now },
  userId: { type: Number },
  username: { type: String },
  fullName: { type: String },
  phoneNumber: { type: String },
})

// compound unique: only one per (spyGroupId, fileUniqueId)
spyMediaSchema.index({ spyGroupId: 1, fileUniqueId: 1 }, { unique: true })

const ProcessedSpyMedia = mongoose.model<IProcessedSpyMedia>('ProcessedSpyMedia', spyMediaSchema)

export default ProcessedSpyMedia

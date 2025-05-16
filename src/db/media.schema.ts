import mongoose from 'mongoose'

export interface IProcessedMedia {
  chatId: number
  fileUniqueId: string
  timestamp: Date
  username?: string
  userId?: number
  messageId: number
}

const processedMediaSchema = new mongoose.Schema<IProcessedMedia>({
  chatId: { type: Number, required: true },
  fileUniqueId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  username: { type: String },
  userId: { type: Number },
  messageId: { type: Number, required: true },
})

// COMPOUND UNIQUE INDEX: one record per (chatId, fileUniqueId)
processedMediaSchema.index({ chatId: 1, fileUniqueId: 1 }, { unique: true })

const ProcessedMedia = mongoose.model<IProcessedMedia>('ProcessedMedia', processedMediaSchema)

export default ProcessedMedia

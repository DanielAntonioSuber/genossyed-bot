import { downloadMediaMessage, proto } from 'baileys'
import { Command } from '../structures/Command'
import { getQuotedMessage, hasQuotedMediaMessage, isMediaMessage } from '../utils/WebMessageInfoUtils'
import sharp from 'sharp'

export default class Sticker extends Command {
  name: string
  description?: string
  aliases?: string[] | undefined

  constructor() {
    super()
    this.name = 'sticker'
    this.aliases = ['s']
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    const isMedia = isMediaMessage(webMessageInfo)
    const hasQuotedMedia = hasQuotedMediaMessage(webMessageInfo)

    if (!isMedia && !hasQuotedMedia) {
      return this.bot.replyText(webMessageInfo, 'No es una imagen o no estás respondiendo a una.')
    }

    try {
      const mediaMessage = isMedia ? webMessageInfo : getQuotedMessage(webMessageInfo)
      const buffer = await downloadMediaMessage(mediaMessage, 'buffer', {}) as Buffer

      const stickerBuffer = await sharp(buffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 100 })
        .toBuffer()

      await this.bot.replySticker(webMessageInfo, { sticker: stickerBuffer })
    } catch (error) {
      console.error('Error al generar el sticker:', error)
      await this.bot.replyText(webMessageInfo, 'No se pudo generar el sticker.')
    }
  }
}
